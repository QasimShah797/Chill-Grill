import { FormEvent, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useStore } from '../../context/AppState'
import { usePageTitle } from '../../hooks/usePageTitle'
import { demoAccounts, requestPasswordReset } from '../../services/authService'

export function LoginPage() {
  usePageTitle('Admin login — Chill & Grill')
  const { login, session } = useStore()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [forgot, setForgot] = useState(false)
  const [note, setNote] = useState('')

  if (session) return <Navigate to="/admin" replace />

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    void (async () => {
      try {
        if (forgot) {
          setNote(await requestPasswordReset(email))
        } else {
          await login(email, password)
          navigate('/admin')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to sign in.')
      } finally {
        setBusy(false)
      }
    })()
  }

  return (
    <div className="grid min-h-screen place-items-center bg-ink px-4 text-white">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl bg-coal p-6 ring-1 ring-white/10">
        <p className="font-display text-4xl text-brand">Chill & Grill</p>
        <h1 className="mt-1 text-lg">{forgot ? 'Forgot password' : 'Admin login'}</h1>
        <label className="mt-4 block text-sm">
          Email
          <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 h-11 w-full rounded-2xl bg-white/8 px-3" />
        </label>
        {!forgot ? (
          <label className="mt-3 block text-sm">
            Password
            <input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 h-11 w-full rounded-2xl bg-white/8 px-3" />
          </label>
        ) : null}
        {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
        {note ? <p className="mt-3 text-sm text-brand">{note}</p> : null}
        <button type="submit" disabled={busy} className="mt-5 h-11 w-full rounded-full bg-brand font-bold text-ink">{busy ? 'Please wait…' : forgot ? 'Send reset link' : 'Login'}</button>
        <button type="button" className="mt-3 text-sm text-white/70" onClick={() => { setForgot((value) => !value); setError(''); setNote('') }}>
          {forgot ? 'Back to login' : 'Forgot Password'}
        </button>
        {demoAccounts.length ? (
          <div className="mt-5 rounded-2xl bg-black/30 p-3 text-xs text-white/60">
            <p className="font-semibold text-white/80">Demo access</p>
            {demoAccounts.map((account) => (
              <p key={account.email} className="mt-1">{account.role}: {account.email} / {account.password}</p>
            ))}
          </div>
        ) : null}
      </form>
    </div>
  )
}
