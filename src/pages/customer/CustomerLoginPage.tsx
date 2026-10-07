import { FormEvent, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useStore } from '../../context/AppState'
import { usePageTitle } from '../../hooks/usePageTitle'

export function CustomerLoginPage() {
  usePageTitle('Log in — Chill & Grill')
  const { session, signIn, register, loginWithGoogle } = useStore()
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  if (session) return <Navigate to="/account" replace />

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNote('')
    void (async () => {
      try {
        if (mode === 'up') {
          const confirm = await register(name, email, password)
          if (confirm) setNote('Check your email to confirm the account, then log in.')
        } else {
          await signIn(email, password)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to sign in.')
      } finally {
        setBusy(false)
      }
    })()
  }

  const google = () => {
    setBusy(true)
    setError('')
    void loginWithGoogle().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : 'Google sign-in could not start.')
      setBusy(false)
    })
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <form onSubmit={submit} className="rounded-3xl bg-coal p-6 ring-1 ring-white/10">
        <p className="font-display text-4xl text-brand">Chill & Grill</p>
        <h1 className="mt-1 text-lg">{mode === 'in' ? 'Log in' : 'Create account'}</h1>
        <p className="mt-1 text-sm text-white/60">Save your orders and check out faster.</p>
        {mode === 'up' ? (
          <label className="mt-4 block text-sm">
            Name
            <input required value={name} onChange={(event) => setName(event.target.value)} className="mt-1 h-11 w-full rounded-2xl bg-white/8 px-3" />
          </label>
        ) : null}
        <label className="mt-3 block text-sm">
          Email
          <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 h-11 w-full rounded-2xl bg-white/8 px-3" />
        </label>
        <label className="mt-3 block text-sm">
          Password
          <input type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 h-11 w-full rounded-2xl bg-white/8 px-3" />
        </label>
        {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
        {note ? <p className="mt-3 text-sm text-brand">{note}</p> : null}
        <button type="submit" disabled={busy} className="mt-5 h-11 w-full rounded-full bg-brand font-bold text-ink">{busy ? 'Please wait…' : mode === 'in' ? 'Log in' : 'Create account'}</button>
        <button type="button" disabled={busy} onClick={google} className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-white text-sm font-semibold text-ink">
          <GoogleMark />
          Continue with Google
        </button>
        <button
          type="button"
          className="mt-4 text-sm text-white/70"
          onClick={() => { setMode((value) => (value === 'in' ? 'up' : 'in')); setError(''); setNote('') }}
        >
          {mode === 'in' ? 'New here? Create an account' : 'Already have an account? Log in'}
        </button>
        <p className="mt-4 text-xs text-white/40">Restaurant staff use the <Link to="/admin/login" className="text-brand">admin login</Link>.</p>
      </form>
    </div>
  )
}

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.7-6.6 7.1l6.3 5.3C37.4 38.3 44 34 44 24c0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  )
}
