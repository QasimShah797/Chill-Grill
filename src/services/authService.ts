import type { AuthUser, Role } from '../types'
import { isSupabaseConfigured, requireSupabase } from './supabaseClient'
import { ensureMenu } from './supabaseStore'

const USERS: (AuthUser & { password: string })[] = [
  {
    id: 'user-admin',
    name: 'Restaurant Admin',
    email: 'admin@chillandgrill.pk',
    password: 'ChillGrill#Admin',
    role: 'ADMIN',
  },
  {
    id: 'user-staff',
    name: 'Floor Staff',
    email: 'staff@chillandgrill.pk',
    password: 'ChillGrill#Staff',
    role: 'STAFF',
  },
]

const SESSION = 'cg.session'

export const demoAccounts = isSupabaseConfigured()
  ? []
  : USERS.map(({ email, password, role, name }) => ({ email, password, role, name }))

function mockLogin(email: string, password: string): AuthUser {
  const found = USERS.find(
    (user) => user.email.toLowerCase() === email.trim().toLowerCase() && user.password === password,
  )
  if (!found) throw new Error('Email or password is incorrect.')
  const session: AuthUser = { id: found.id, name: found.name, email: found.email, role: found.role }
  sessionStorage.setItem(SESSION, JSON.stringify(session))
  return session
}

async function profileFor(userId: string, email: string): Promise<AuthUser> {
  const client = requireSupabase()
  const { data, error } = await client.from('profiles').select('name, email, role').eq('id', userId).maybeSingle()
  if (error) throw new Error('Unable to load your account.')
  const role: Role = data?.role === 'ADMIN' || data?.role === 'STAFF' || data?.role === 'SALESMAN' ? data.role : 'CUSTOMER'
  return {
    id: userId,
    name: data?.name || email.split('@')[0] || 'Guest',
    email: data?.email || email,
    role,
  }
}

export async function login(email: string, password: string): Promise<AuthUser> {
  if (!isSupabaseConfigured()) return mockLogin(email, password)
  const client = requireSupabase()
  const { data, error } = await client.auth.signInWithPassword({ email: email.trim(), password })
  if (error) {
    if (/not confirmed/i.test(error.message)) throw new Error('Confirm this email in Supabase, then sign in.')
    throw new Error('Email or password is incorrect.')
  }
  const session = await profileFor(data.user.id, data.user.email ?? email)
  if (session.role === 'CUSTOMER') {
    await client.auth.signOut()
    throw new Error('This login is for restaurant staff. Customers can sign in from the menu.')
  }
  if (session.role === 'ADMIN') await ensureMenu()
  return session
}

export async function logout() {
  sessionStorage.removeItem(SESSION)
  if (!isSupabaseConfigured()) return
  await requireSupabase().auth.signOut()
}

export function currentUser(): AuthUser | null {
  if (isSupabaseConfigured()) return null
  try {
    const raw = sessionStorage.getItem(SESSION)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

export async function restoreSession(): Promise<AuthUser | null> {
  if (!isSupabaseConfigured()) return currentUser()
  const client = requireSupabase()
  const { data } = await client.auth.getSession()
  if (!data.session?.user) return null
  return profileFor(data.session.user.id, data.session.user.email ?? '')
}

const LOCAL_CUSTOMERS = 'cg.customers'

type LocalCustomer = { id: string; name: string; email: string; passwordHash: string }

async function passwordHash(password: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function localCustomers(): LocalCustomer[] {
  try {
    const raw = localStorage.getItem(LOCAL_CUSTOMERS)
    return raw ? (JSON.parse(raw) as LocalCustomer[]) : []
  } catch {
    return []
  }
}

function saveLocalSession(user: AuthUser) {
  sessionStorage.setItem(SESSION, JSON.stringify(user))
}

export async function signInCustomer(email: string, password: string): Promise<AuthUser> {
  const trimmed = email.trim().toLowerCase()
  if (!isSupabaseConfigured()) {
    const found = localCustomers().find((user) => user.email === trimmed)
    if (!found || found.passwordHash !== (await passwordHash(password))) {
      throw new Error('Email or password is incorrect.')
    }
    const session: AuthUser = { id: found.id, name: found.name, email: found.email, role: 'CUSTOMER' }
    saveLocalSession(session)
    return session
  }
  const client = requireSupabase()
  const { data, error } = await client.auth.signInWithPassword({ email: trimmed, password })
  if (error) throw new Error('Email or password is incorrect.')
  return profileFor(data.user.id, data.user.email ?? trimmed)
}

export async function registerCustomer(name: string, email: string, password: string): Promise<{ user: AuthUser | null; confirm: boolean }> {
  const trimmedName = name.trim()
  const trimmedEmail = email.trim().toLowerCase()
  if (trimmedName.length < 2) throw new Error('Enter your name.')
  if (password.length < 6) throw new Error('Use a password of at least 6 characters.')
  if (!isSupabaseConfigured()) {
    const existing = localCustomers()
    if (existing.some((user) => user.email === trimmedEmail)) throw new Error('An account with that email already exists.')
    const session: AuthUser = { id: `customer-${crypto.randomUUID()}`, name: trimmedName, email: trimmedEmail, role: 'CUSTOMER' }
    localStorage.setItem(
      LOCAL_CUSTOMERS,
      JSON.stringify([...existing, { id: session.id, name: session.name, email: session.email, passwordHash: await passwordHash(password) }]),
    )
    saveLocalSession(session)
    return { user: session, confirm: false }
  }
  const client = requireSupabase()
  const { data, error } = await client.auth.signUp({
    email: trimmedEmail,
    password,
    options: {
      data: { name: trimmedName },
      emailRedirectTo: `${window.location.origin}/account`,
    },
  })
  if (error) throw new Error(error.message)
  if (!data.session || !data.user) return { user: null, confirm: true }
  return { user: await profileFor(data.user.id, data.user.email ?? trimmedEmail), confirm: false }
}

export async function loginWithGoogle() {
  if (!isSupabaseConfigured()) {
    throw new Error('Google sign-in needs Supabase. Add your project keys, run supabase/schema.sql again, then enable the Google provider.')
  }
  const { error } = await requireSupabase().auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/account` },
  })
  if (error) throw new Error('Google sign-in could not start.')
}

export async function requestPasswordReset(email: string) {
  if (!isSupabaseConfigured()) {
    const exists = USERS.some((user) => user.email.toLowerCase() === email.trim().toLowerCase())
    if (!exists) throw new Error('No account found for that email.')
    return 'Password reset email is not connected yet. Use the demo password shown on the login screen.'
  }
  const { error } = await requireSupabase().auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${window.location.origin}/admin/login`,
  })
  if (error) throw new Error('Unable to send a reset email.')
  return 'If that email is registered, a reset link is on its way.'
}

const staffBlocked = new Set(['sales', 'settings', 'categories', 'deals', 'addons'])
const salesmanBlocked = new Set(['settings', 'categories', 'deals', 'addons'])

export function canAccess(role: Role, area: string) {
  if (role === 'CUSTOMER') return false
  if (role === 'ADMIN') return true
  if (role === 'SALESMAN') return !salesmanBlocked.has(area)
  return !staffBlocked.has(area)
}

export function canEditCatalog(role: Role) {
  return role === 'ADMIN'
}
