import { Link, Navigate } from 'react-router-dom'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { useStore } from '../../context/AppState'
import { usePageTitle } from '../../hooks/usePageTitle'
import { pkr } from '../../utils/format'

export function AccountPage() {
  usePageTitle('Account — Chill & Grill')
  const { session, logout, orders, ready } = useStore()
  if (!ready) return <div className="px-4 py-16 text-center text-white/60">Loading your account…</div>
  if (!session) return <Navigate to="/login" replace />
  const mine = orders.filter((order) => order.userId === session.id)

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <p className="text-sm font-semibold tracking-[0.16em] text-brand">ACCOUNT</p>
      <h1 className="font-display text-5xl">{session.name}</h1>
      <p className="mt-1 text-white/70">{session.email}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={logout} className="h-10 rounded-full bg-white/10 px-4 text-sm font-semibold">Log out</button>
        {session.role !== 'CUSTOMER' ? <Link to="/admin" className="grid h-10 place-items-center rounded-full bg-brand px-4 text-sm font-bold text-ink">Restaurant desk</Link> : null}
      </div>
      <h2 className="mt-10 font-display text-3xl">Your orders</h2>
      {mine.length === 0 ? (
        <p className="mt-3 text-sm text-white/60">No orders on this account yet. <Link to="/#menu" className="text-brand">Browse the menu</Link>.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {mine.map((order) => (
            <li key={order.id}>
              <Link to={`/track/${order.id}`} className="flex items-center justify-between gap-3 rounded-2xl bg-coal p-4 ring-1 ring-white/10">
                <span>
                  <span className="block font-semibold">{order.id}</span>
                  <span className="text-sm text-white/60">{new Date(order.createdAt).toLocaleString()}</span>
                </span>
                <span className="text-right">
                  <StatusBadge status={order.status} />
                  <span className="mt-1 block text-sm font-semibold">{pkr(order.total)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
