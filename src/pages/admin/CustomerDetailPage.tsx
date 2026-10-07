import { Link, useParams } from 'react-router-dom'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { useStore } from '../../context/AppState'
import { usePageTitle } from '../../hooks/usePageTitle'
import { customersFromOrders } from '../../services/customerService'
import { formatDateTime, pkr } from '../../utils/format'

export function CustomerDetailPage() {
  const { id } = useParams()
  const { orders } = useStore()
  const customer = customersFromOrders(orders).find((item) => item.id === id)
  usePageTitle(customer ? customer.name : 'Customer')
  if (!customer) {
    return <div className="rounded-3xl bg-white p-6"><p>No customers yet</p><Link to="/admin/customers">Back</Link></div>
  }
  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/admin/customers" className="text-sm">Back</Link>
      <h1 className="font-display text-5xl">{customer.name}</h1>
      <p className="text-stone-500">{customer.phone}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Stat label="Orders" value={String(customer.orders)} />
        <Stat label="Spent" value={pkr(customer.spent)} />
        <Stat label="Status" value={customer.status} />
      </div>
      <h2 className="mt-6 font-display text-3xl">Order history</h2>
      <div className="mt-3 space-y-2">
        {customer.history.map((order) => (
          <Link key={order.id} to={`/admin/orders/${order.id}`} className="flex items-center justify-between rounded-2xl bg-white p-3 text-sm">
            <span>{order.id} · {formatDateTime(order.createdAt)}</span>
            <span className="flex items-center gap-2">{pkr(order.total)} <StatusBadge status={order.status} /></span>
          </Link>
        ))}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-white p-4"><p className="text-xs text-stone-500">{label}</p><p className="text-xl font-semibold">{value}</p></div>
}
