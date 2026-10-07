import { Link, useParams } from 'react-router-dom'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { useStore } from '../../context/AppState'
import { usePageTitle } from '../../hooks/usePageTitle'
import { pkr } from '../../utils/format'
import { statusLabel } from '../../utils/orderStatus'
import type { OrderStatus } from '../../types'

const flow: OrderStatus[] = ['new', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'completed']

export function TrackOrderPage() {
  const { id } = useParams()
  const { orders } = useStore()
  const order = orders.find((item) => item.id === id)
  usePageTitle(order ? `Track ${order.id}` : 'Track order')
  if (!order) {
    return <div className="px-4 py-16 text-center"><h1 className="font-display text-5xl">Order not found</h1></div>
  }
  const steps = order.orderType === 'pickup' ? flow.filter((step) => step !== 'out_for_delivery') : flow
  const index = steps.indexOf(order.status)
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="font-display text-5xl">Track {order.id}</h1>
      <div className="mt-3"><StatusBadge status={order.status} /></div>
      {order.status === 'cancelled' ? <p className="mt-4 text-sm">Cancelled{order.rejectionReason ? `: ${order.rejectionReason}` : ''}</p> : (
        <ol className="mt-6 space-y-3">
          {steps.map((step, stepIndex) => (
            <li key={step} className={`rounded-2xl px-4 py-3 text-sm ${stepIndex <= index ? 'bg-brand text-ink' : 'bg-white/8'}`}>
              {statusLabel[step]}
            </li>
          ))}
        </ol>
      )}
      <p className="mt-4 text-sm text-white/60">Total {pkr(order.total)}</p>
      <Link to="/#menu" className="mt-6 inline-block text-brand">Back to Menu</Link>
    </div>
  )
}
