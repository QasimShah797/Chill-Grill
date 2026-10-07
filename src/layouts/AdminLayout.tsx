import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import { NewOrderAlert } from '../components/admin/NewOrderAlert'
import { Toasts } from '../components/ui/Toasts'
import { useStore } from '../context/AppState'
import { canAccess } from '../services/authService'
import { useState } from 'react'

const links = [
  { to: '/admin', label: 'Dashboard', area: 'dashboard', end: true },
  { to: '/admin/orders', label: 'Orders', area: 'orders' },
  { to: '/admin/counter', label: 'Take order', area: 'orders' },
  { to: '/admin/products', label: 'Products', area: 'products' },
  { to: '/admin/categories', label: 'Categories', area: 'categories' },
  { to: '/admin/deals', label: 'Deals', area: 'deals' },
  { to: '/admin/addons', label: 'Add-ons', area: 'addons' },
  { to: '/admin/customers', label: 'Customers', area: 'customers' },
  { to: '/admin/sales', label: 'Sales', area: 'sales' },
  { to: '/admin/settings', label: 'Restaurant Settings', area: 'settings' },
]

export function AdminLayout() {
  const { session, logout, ready } = useStore()
  const [open, setOpen] = useState(false)
  const location = useLocation()
  if (!ready) return <div className="grid min-h-screen place-items-center bg-paper text-ink">Loading dashboard…</div>
  if (!session || session.role === 'CUSTOMER') return <Navigate to={session ? '/account' : '/admin/login'} replace />
  const area = links.find((link) => (link.end ? location.pathname === link.to : location.pathname.startsWith(link.to)))?.area ?? 'dashboard'
  const allowed = canAccess(session.role, area)

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="flex min-h-screen">
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-ink text-white transition-transform md:static md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex h-full flex-col p-4">
            <div>
              <p className="font-display text-3xl text-brand">Chill & Grill</p>
              <p className="text-xs text-white/50">Restaurant desk</p>
            </div>
            <nav className="mt-6 flex flex-1 flex-col gap-1">
              {links.filter((link) => canAccess(session.role, link.area)).map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => `rounded-xl px-3 py-2 text-sm font-medium ${isActive ? 'bg-brand text-ink' : 'text-white/80 hover:bg-white/5'}`}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <div className="border-t border-white/10 pt-3">
              <p className="text-sm font-semibold">{session.name}</p>
              <p className="text-xs text-white/50">{session.role === 'ADMIN' ? 'Admin' : session.role === 'SALESMAN' ? 'Salesman' : 'Staff'}</p>
              <button type="button" onClick={logout} className="mt-3 text-sm text-brand">Logout</button>
            </div>
          </div>
        </aside>
        {open ? <button type="button" className="fixed inset-0 z-30 bg-black/50 md:hidden" aria-label="Close menu" onClick={() => setOpen(false)} /> : null}
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-paper/95 px-4 py-3 backdrop-blur">
            <button type="button" className="grid h-10 w-10 place-items-center rounded-xl border border-line md:hidden" aria-label="Open dashboard menu" onClick={() => setOpen(true)}>☰</button>
            <p className="text-sm text-stone-500">Orders, menu, and restaurant settings</p>
            <a href="/" className="ml-auto text-sm font-semibold">View website</a>
          </header>
          <div className="min-w-0 space-y-4 overflow-x-hidden p-4 md:p-6">
            <NewOrderAlert />
            {allowed ? <Outlet /> : (
              <div className="rounded-2xl bg-white p-6">
                <h1 className="font-display text-4xl">Admin access required</h1>
                <p className="mt-2 text-sm text-stone-600">Salesmen can manage orders, customers, sales, and product availability.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Toasts />
    </div>
  )
}
