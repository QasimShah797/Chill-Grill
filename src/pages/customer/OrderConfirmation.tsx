import { useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ReceiptSlip, printReceipt } from '../../components/admin/OrderReceipt'
import { useStore } from '../../context/AppState'
import { usePageTitle } from '../../hooks/usePageTitle'
import { formatDateTime, pkr } from '../../utils/format'
import { statusLabel } from '../../utils/orderStatus'

export function OrderConfirmation() {
  const { id } = useParams()
  const { orders, settings } = useStore()
  const order = orders.find((item) => item.id === id)
  const printed = useRef(false)
  usePageTitle(order ? `Order ${order.id} — Chill & Grill` : 'Order — Chill & Grill')
  useEffect(() => {
    if (!order || printed.current) return
    printed.current = true
    printReceipt(order, 'both')
  }, [order])
  if (!order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-display text-5xl">Order not found</h1>
        <Link to="/" className="mt-4 inline-block text-brand">Back to Menu</Link>
      </div>
    )
  }
  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <p className="text-xs font-semibold tracking-[0.18em] text-brand">CHILL & GRILL</p>
      <h1 className="font-display text-6xl">Order Received!</h1>
      <p className="mt-2 text-white/70">Thank you for ordering from Chill & Grill.</p>
      <div className="mt-6 rounded-3xl bg-coal p-5">
        <p className="font-display text-4xl text-brand">{order.id}</p>
        <p className="text-sm text-white/60">{formatDateTime(order.createdAt)}</p>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between"><dt>Name</dt><dd>{order.customerName}</dd></div>
          <div className="flex justify-between"><dt>Type</dt><dd className="capitalize">{order.orderType}</dd></div>
          <div className="flex justify-between"><dt>Status</dt><dd>{statusLabel[order.status]}</dd></div>
          <div className="flex justify-between"><dt>Total</dt><dd className="font-semibold text-brand">{pkr(order.total)}</dd></div>
        </dl>
        <ul className="mt-4 space-y-1 border-t border-white/10 pt-3 text-sm">
          {order.items.map((item, index) => (
            <li key={`${item.productId}-${index}`}>{item.quantity} × {item.productName}{item.variant ? ` (${item.variant})` : ''}</li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-white/65">
          Estimated preparation is about {settings.prepMinutes} minutes. {order.orderType === 'delivery' ? 'Delivery time depends on your area.' : 'We will have it ready for pickup.'}
        </p>
      </div>
      <div className="mt-4 overflow-hidden rounded-3xl">
        <ReceiptSlip order={order} settings={settings} />
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={() => printReceipt(order, 'both')} className="rounded-full bg-white px-5 py-3 text-sm font-bold text-ink">Print receipt</button>
        <Link to={`/track/${order.id}`} className="rounded-full bg-brand px-5 py-3 text-sm font-bold text-ink">Track Order</Link>
        <Link to="/#menu" className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold">Back to Menu</Link>
      </div>
    </div>
  )
}
