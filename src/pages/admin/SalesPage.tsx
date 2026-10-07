import { useMemo, useState } from 'react'
import { EmptyState } from '../../components/ui/EmptyState'
import { SalesChart } from '../../components/admin/SalesChart'
import { useStore } from '../../context/AppState'
import { usePageTitle } from '../../hooks/usePageTitle'
import { rangeBounds, salesSummary, series, topProducts, toCsv, type RangeKey } from '../../services/salesService'
import { formatDate, pkr } from '../../utils/format'

export function SalesPage() {
  usePageTitle('Sales — Chill & Grill')
  const { orders } = useStore()
  const [range, setRange] = useState<RangeKey>('7d')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [mode, setMode] = useState<'sales' | 'orders'>('sales')
  const bounds = rangeBounds(range, { from, to })
  const summary = useMemo(() => salesSummary(orders, bounds.from, bounds.to), [orders, bounds.from, bounds.to])
  const points = series(orders, bounds.from, bounds.to)
  const top = topProducts(orders, bounds.from, bounds.to)
  const empty = summary.orders === 0 && summary.cancelled === 0

  const exportCsv = () => {
    const rows = [['Order', 'Customer', 'Phone', 'Type', 'Status', 'Total', 'Date']]
    orders.filter((order) => new Date(order.createdAt) >= bounds.from && new Date(order.createdAt) <= bounds.to).forEach((order) => {
      rows.push([order.id, order.customerName, order.phone, order.orderType, order.status, String(order.total), formatDate(order.createdAt)])
    })
    const blob = new Blob([toCsv(rows)], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'chill-grill-orders.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-5xl">Sales</h1>
        <button type="button" onClick={exportCsv} className="rounded-full border border-line bg-white px-4 py-2 text-sm">Export orders CSV</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {(['today', 'yesterday', '7d', '30d', 'custom'] as RangeKey[]).map((key) => (
          <button key={key} type="button" onClick={() => setRange(key)} className={`rounded-full px-3 py-1.5 text-sm ${range === key ? 'bg-ink text-white' : 'bg-white'}`}>
            {key === '7d' ? 'Last 7 Days' : key === '30d' ? 'Last 30 Days' : key === 'custom' ? 'Custom Range' : key[0].toUpperCase() + key.slice(1)}
          </button>
        ))}
      </div>
      {range === 'custom' ? (
        <div className="flex gap-2">
          <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="h-11 rounded-2xl bg-white px-3" />
          <input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="h-11 rounded-2xl bg-white px-3" />
        </div>
      ) : null}
      {empty ? <EmptyState title="No sales data for this period" /> : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <Stat label="Total sales" value={pkr(summary.sales)} />
            <Stat label="Total orders" value={String(summary.orders)} />
            <Stat label="Average order" value={pkr(summary.average)} />
            <Stat label="Completed" value={String(summary.completed)} />
            <Stat label="Cancelled" value={String(summary.cancelled)} />
          </div>
          <section className="rounded-3xl bg-white p-4">
            <div className="flex gap-2">
              <button type="button" className={`rounded-full px-3 py-1 text-sm ${mode === 'sales' ? 'bg-ink text-white' : 'bg-paper'}`} onClick={() => setMode('sales')}>Sales over time</button>
              <button type="button" className={`rounded-full px-3 py-1 text-sm ${mode === 'orders' ? 'bg-ink text-white' : 'bg-paper'}`} onClick={() => setMode('orders')}>Orders over time</button>
            </div>
            <div className="mt-4"><SalesChart points={points} mode={mode} /></div>
          </section>
          <section className="rounded-3xl bg-white p-4">
            <h2 className="font-display text-3xl">Top products</h2>
            <ol className="mt-3 space-y-2 text-sm">
              {top.map((item, index) => (
                <li key={item.name} className="flex justify-between"><span>{index + 1}. {item.name}</span><span>{item.qty} sold · {pkr(item.sales)}</span></li>
              ))}
              {!top.length ? <li>No products sold in this period.</li> : null}
            </ol>
          </section>
        </>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return <article className="rounded-3xl bg-white p-4"><p className="text-xs text-stone-500">{label}</p><p className="mt-1 text-xl font-semibold">{value}</p></article>
}
