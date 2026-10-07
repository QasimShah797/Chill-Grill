import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { SalesChart } from '../../components/admin/SalesChart'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { useStore } from '../../context/AppState'
import { usePageTitle } from '../../hooks/usePageTitle'
import { rangeBounds, salesSummary, series } from '../../services/salesService'
import { formatTime, pkr, sameDay } from '../../utils/format'

export function DashboardPage() {
  usePageTitle('Dashboard — Chill & Grill')
  const { orders, ready } = useStore()
  const [range, setRange] = useState<'today' | '7d' | '30d'>('7d')
  const today = useMemo(() => {
    const now = new Date()
    return orders.filter((order) => sameDay(new Date(order.createdAt), now))
  }, [orders])
  const todaySales = today.filter((order) => order.status !== 'cancelled').reduce((sum, order) => sum + order.total, 0)
  const pending = today.filter((order) => !['completed', 'cancelled'].includes(order.status)).length
  const completed = today.filter((order) => order.status === 'completed').length
  const bounds = rangeBounds(range)
  const summary = salesSummary(orders, bounds.from, bounds.to)
  const points = series(orders, bounds.from, bounds.to)
  const recent = [...orders].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 6)

  if (!ready) return <div className="grid gap-3 md:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-white" />)}</div>

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-5xl">Dashboard</h1>
        <button
          type="button"
          className="rounded-full border border-line bg-white px-3 py-2 text-sm"
          onClick={() => {
            if (typeof Notification === 'undefined') return
            void Notification.requestPermission()
          }}
        >
          Enable order alerts
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Today's orders" value={String(today.length)} />
        <Stat label="Today's sales" value={pkr(todaySales)} />
        <Stat label="Pending" value={String(pending)} />
        <Stat label="Completed" value={String(completed)} />
      </div>
      <section className="rounded-3xl bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-3xl">Sales overview</h2>
          <div className="flex gap-2">
            {(['today', '7d', '30d'] as const).map((key) => (
              <button key={key} type="button" onClick={() => setRange(key)} className={`rounded-full px-3 py-1 text-sm ${range === key ? 'bg-ink text-white' : 'bg-paper'}`}>
                {key === 'today' ? 'Today' : key === '7d' ? '7 Days' : '30 Days'}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Mini label="Total sales" value={pkr(summary.sales)} />
          <Mini label="Orders" value={String(summary.orders)} />
          <Mini label="Average order" value={pkr(summary.average)} />
        </div>
        <div className="mt-4">{points.every((point) => point.orders === 0) ? <p className="text-sm text-stone-500">No sales data for this period.</p> : <SalesChart points={points} mode="sales" />}</div>
        <p className="mt-2 text-xs text-stone-500">Sales exclude cancelled orders.</p>
      </section>
      <section className="rounded-3xl bg-white p-4">
        <h2 className="font-display text-3xl">Recent orders</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs text-stone-500">
              <tr>
                <th className="py-2">Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Type</th><th>Status</th><th>Time</th><th></th>
              </tr>
            </thead>
            <tbody>
              {recent.map((order) => (
                <tr key={order.id} className="border-t border-line">
                  <td className="py-3 font-semibold">{order.id}</td>
                  <td>{order.customerName}</td>
                  <td>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                  <td>{pkr(order.total)}</td>
                  <td className="capitalize">{order.orderType}</td>
                  <td><StatusBadge status={order.status} /></td>
                  <td>{formatTime(order.createdAt)}</td>
                  <td><Link className="font-semibold" to={`/admin/orders/${order.id}`}>View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!recent.length ? <p className="py-8 text-center text-sm text-stone-500">No new orders</p> : null}
        </div>
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-3xl bg-white p-4">
      <p className="text-xs font-semibold tracking-wide text-stone-500">{label.toUpperCase()}</p>
      <p className="mt-2 font-display text-4xl">{value}</p>
    </article>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-paper px-3 py-2">
      <p className="text-xs text-stone-500">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  )
}
