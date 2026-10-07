import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useStore } from '../../context/AppState'
import type { Order, RestaurantSettings } from '../../types'
import { formatDateTime, pkr } from '../../utils/format'

export function ReceiptSlip({ order, settings }: { order: Order; settings: RestaurantSettings }) {
  const kind = order.area === 'Counter' ? 'Counter' : order.orderType === 'delivery' ? 'Delivery' : 'Pickup'
  const payment = order.area === 'Counter' ? 'Pay at counter' : order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Pay at Restaurant'
  return (
    <article className="bg-white p-4 text-black">
      <header className="text-center">
        <p className="font-display text-4xl">{settings.name}</p>
        <p className="text-xs tracking-[0.16em]">{settings.tagline.toUpperCase()}</p>
        <p className="mt-2 text-xs">{settings.address}</p>
        <p className="text-xs">{settings.phones.map((phone) => phone.number).join(' · ')}</p>
      </header>
      <hr className="my-3 border-dashed border-black" />
      <p className="text-sm font-semibold">{order.id}</p>
      <p className="text-xs">{formatDateTime(order.createdAt)}</p>
      <p className="mt-2 text-sm">{order.customerName}</p>
      {order.phone ? <p className="text-sm">{order.phone}</p> : null}
      <p className="text-sm">{kind} · {payment}</p>
      {order.orderType === 'delivery' ? <p className="text-xs">{order.address}{order.area ? ` · ${order.area}` : ''}</p> : null}
      <hr className="my-3 border-dashed border-black" />
      <ul className="space-y-2 text-sm">
        {order.items.map((item, index) => (
          <li key={`${item.productId}-${index}`} className="flex justify-between gap-3">
            <span>
              {item.quantity} × {item.productName}
              {item.variant ? ` (${item.variant})` : ''}
              {item.addons.length ? <span className="block text-xs">{item.addons.map((addon) => addon.name).join(', ')}</span> : null}
              {item.notes ? <span className="block text-xs">{item.notes}</span> : null}
            </span>
            <span className="shrink-0">{pkr(item.total)}</span>
          </li>
        ))}
      </ul>
      <hr className="my-3 border-dashed border-black" />
      <p className="flex justify-between text-sm"><span>Subtotal</span><span>{pkr(order.subtotal)}</span></p>
      {order.deliveryFee ? <p className="flex justify-between text-sm"><span>Delivery</span><span>{pkr(order.deliveryFee)}</span></p> : null}
      {order.discount ? <p className="flex justify-between text-sm"><span>Discount</span><span>{pkr(order.discount)}</span></p> : null}
      <p className="mt-1 flex justify-between text-base font-bold"><span>Total</span><span>{pkr(order.total)}</span></p>
      {order.customerNotes ? <p className="mt-3 text-xs">Note: {order.customerNotes}</p> : null}
      <p className="mt-4 text-center text-xs">Thank you</p>
    </article>
  )
}

export function KitchenSlip({ order }: { order: Order }) {
  return (
    <article className="bg-white p-4 text-black">
      <p className="text-center font-display text-4xl">Kitchen</p>
      <p className="text-center text-sm font-semibold">{order.id}</p>
      <hr className="my-3 border-dashed border-black" />
      <ul className="space-y-3 text-sm">
        {order.items.map((item, index) => (
          <li key={`${item.productId}-${index}`}>
            <p className="font-semibold">{item.quantity} × {item.productName}{item.variant ? ` (${item.variant})` : ''}</p>
            {item.addons.length ? <p>{item.addons.map((addon) => addon.name).join(', ')}</p> : null}
            {item.notes ? <p>Note: {item.notes}</p> : null}
          </li>
        ))}
      </ul>
      {order.customerNotes ? <p className="mt-3 text-sm">Note: {order.customerNotes}</p> : null}
    </article>
  )
}

export function OrderReceipt({ order, settings, kind }: { order: Order; settings: RestaurantSettings; kind: 'both' | 'kitchen' | 'customer' }) {
  return createPortal(
    <div id="order-receipt" className="hidden">
      {kind !== 'customer' ? <div className={kind === 'both' ? 'break-after-page' : ''}><KitchenSlip order={order} /></div> : null}
      {kind !== 'kitchen' ? <ReceiptSlip order={order} settings={settings} /> : null}
    </div>,
    document.body,
  )
}

export function printReceipt(order: Order, kind: 'both' | 'kitchen' | 'customer' = 'customer') {
  window.dispatchEvent(new CustomEvent('cg-print-receipt', { detail: { order, kind } }))
}

export function ReceiptPrinter() {
  const { orders, settings, session, ready } = useStore()
  const [slip, setSlip] = useState<{ order: Order; kind: 'both' | 'kitchen' | 'customer' } | null>(null)
  const known = useRef<Set<string> | null>(null)

  useLayoutEffect(() => {
    const onPrint = (event: Event) => {
      const detail = (event as CustomEvent<{ order: Order; kind: 'both' | 'kitchen' | 'customer' }>).detail
      setSlip(detail)
      window.setTimeout(() => window.print(), 250)
    }
    window.addEventListener('cg-print-receipt', onPrint)
    return () => window.removeEventListener('cg-print-receipt', onPrint)
  }, [])

  useEffect(() => {
    if (!ready) return
    const desk = Boolean(session && session.role !== 'CUSTOMER')
    if (!desk) {
      known.current = null
      return
    }
    if (known.current === null) {
      known.current = new Set(orders.map((order) => order.id))
      return
    }
    const arrived = orders.filter((order) => !known.current?.has(order.id) && order.area !== 'Counter' && order.status !== 'cancelled')
    orders.forEach((order) => known.current?.add(order.id))
    if (!arrived.length) return
    setSlip({ order: arrived[0], kind: 'both' })
    window.setTimeout(() => window.print(), 400)
  }, [orders, ready, session])

  if (!slip) return null
  return <OrderReceipt order={slip.order} settings={settings} kind={slip.kind} />
}
