import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { KitchenSlip, ReceiptSlip, printReceipt } from '../../components/admin/OrderReceipt'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { EmptyState } from '../../components/ui/EmptyState'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { useStore } from '../../context/AppState'
import { usePageTitle } from '../../hooks/usePageTitle'
import { filterOrders, paginate } from '../../services/orderService'
import type { Order, OrderStatus, RestaurantSettings } from '../../types'
import { formatDateTime, phoneHref, pkr, whatsappHref } from '../../utils/format'
import { actionLabel, primaryNext, rejectionReasons, statusLabel } from '../../utils/orderStatus'

const statuses: (OrderStatus | 'all')[] = ['all', 'new', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'completed', 'cancelled']

export function OrdersPage() {
  usePageTitle('Orders — Chill & Grill')
  const { id } = useParams()
  const navigate = useNavigate()
  const { orders, updateOrderStatus, ready, settings } = useStore()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<OrderStatus | 'all'>('all')
  const [orderType, setOrderType] = useState<'all' | 'delivery' | 'pickup'>('all')
  const [sort, setSort] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest')
  const [page, setPage] = useState(1)
  const [rejectFor, setRejectFor] = useState<Order | null>(null)
  const [reason, setReason] = useState(rejectionReasons[0])
  const [custom, setCustom] = useState('')

  const filtered = useMemo(
    () => filterOrders(orders, { search, status, orderType, sort }),
    [orders, search, status, orderType, sort],
  )
  const pageData = paginate(filtered, page, 8)
  const selected = orders.find((order) => order.id === id)

  if (!ready) return <div className="h-40 animate-pulse rounded-3xl bg-white" />

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
      <section>
        <h1 className="font-display text-5xl">Orders</h1>
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {statuses.map((item) => (
            <button key={item} type="button" onClick={() => { setStatus(item); setPage(1) }} className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${status === item ? 'bg-ink text-white' : 'bg-white'}`}>
              {item === 'all' ? 'All' : statusLabel[item]}
            </button>
          ))}
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Order ID, name, or phone" className="h-11 rounded-2xl bg-white px-3" />
          <select value={orderType} onChange={(event) => setOrderType(event.target.value as typeof orderType)} className="h-11 rounded-2xl bg-white px-3">
            <option value="all">All types</option>
            <option value="delivery">Delivery</option>
            <option value="pickup">Pickup</option>
          </select>
          <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} className="h-11 rounded-2xl bg-white px-3">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="highest">Highest value</option>
            <option value="lowest">Lowest value</option>
          </select>
        </div>
        <div className="mt-4 space-y-3">
          {pageData.items.map((order) => (
            <button key={order.id} type="button" onClick={() => navigate(`/admin/orders/${order.id}`)} className="w-full rounded-3xl bg-white p-4 text-left">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{order.id}</p>
                <StatusBadge status={order.status} />
              </div>
              <p className="mt-1 text-sm">{order.customerName} · {order.phone}</p>
              <p className="text-sm text-stone-500">{order.items.reduce((sum, item) => sum + item.quantity, 0)} items · {pkr(order.total)} · <span className="capitalize">{order.area === 'Counter' ? 'Counter' : order.orderType}</span></p>
            </button>
          ))}
          {!pageData.items.length ? <EmptyState title="No new orders" body="Orders placed on the website show up here." /> : null}
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <button type="button" disabled={pageData.page <= 1} className="rounded-full bg-white px-3 py-2 disabled:opacity-40" onClick={() => setPage((value) => value - 1)}>Previous</button>
          <span>{pageData.page} / {pageData.pages}</span>
          <button type="button" disabled={pageData.page >= pageData.pages} className="rounded-full bg-white px-3 py-2 disabled:opacity-40" onClick={() => setPage((value) => value + 1)}>Next</button>
        </div>
      </section>
      {selected ? (
        <OrderPanel
          order={selected}
          settings={settings}
          onClose={() => navigate('/admin/orders')}
          onAdvance={() => {
            const next = primaryNext(selected.status, selected.orderType)
            if (next) updateOrderStatus(selected.id, next)
          }}
          onReject={() => { setRejectFor(selected); setReason(rejectionReasons[0]); setCustom('') }}
        />
      ) : (
        <div className="hidden rounded-3xl bg-white p-6 xl:block">
          <p className="font-display text-3xl">Select an order</p>
          <p className="mt-2 text-sm text-stone-500">Accept, prepare, and complete orders from this panel.</p>
        </div>
      )}
      <ConfirmDialog
        open={Boolean(rejectFor)}
        title={rejectFor ? `Reject ${rejectFor.id}?` : 'Reject order'}
        body="Choose a reason. This will cancel the order."
        confirmLabel="Reject Order"
        danger
        onClose={() => setRejectFor(null)}
        onConfirm={() => {
          if (!rejectFor) return
          updateOrderStatus(rejectFor.id, 'cancelled', reason === 'Other' ? custom || 'Other' : reason)
          setRejectFor(null)
        }}
      >
        <select value={reason} onChange={(event) => setReason(event.target.value)} className="mt-3 h-11 w-full rounded-2xl bg-paper px-3">
          {rejectionReasons.map((item) => <option key={item}>{item}</option>)}
        </select>
        {reason === 'Other' ? <input value={custom} onChange={(event) => setCustom(event.target.value)} placeholder="Custom reason" className="mt-2 h-11 w-full rounded-2xl bg-paper px-3" /> : null}
      </ConfirmDialog>
    </div>
  )
}

function OrderPanel({ order, settings, onClose, onAdvance, onReject }: { order: Order; settings: RestaurantSettings; onClose: () => void; onAdvance: () => void; onReject: () => void }) {
  const next = primaryNext(order.status, order.orderType)
  return (
    <aside className="rounded-3xl bg-white p-4 xl:sticky xl:top-20 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-4xl">{order.id}</h2>
          <p className="text-sm text-stone-500">{formatDateTime(order.createdAt)}</p>
        </div>
        <button type="button" onClick={onClose} className="xl:hidden" aria-label="Close order">Close</button>
      </div>
      <div className="mt-2"><StatusBadge status={order.status} /></div>
      <dl className="mt-4 space-y-1 text-sm">
        <div>{order.customerName}</div>
        <div><a className="font-semibold" href={phoneHref(order.phone)}>{order.phone}</a></div>
        <div className="capitalize">{order.area === 'Counter' ? 'Counter' : order.orderType} · {order.area === 'Counter' ? 'Pay at counter' : order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Pay at Restaurant'}</div>
        {order.orderType === 'delivery' ? <div>{order.address}{order.area ? ` · ${order.area}` : ''}</div> : <div>{order.area === 'Counter' ? 'Served at the counter' : 'Pickup'}</div>}
      </dl>
      {order.phone ? (
        <div className="mt-3 flex gap-2">
          <a href={phoneHref(order.phone)} className="rounded-full bg-ink px-3 py-2 text-sm font-semibold text-white">Call Customer</a>
          <a href={whatsappHref(order.phone)} target="_blank" rel="noreferrer" className="rounded-full border border-line px-3 py-2 text-sm">WhatsApp</a>
        </div>
      ) : null}
      <ul className="mt-4 space-y-3 border-t border-line pt-3">
        {order.items.map((item, index) => (
          <li key={`${item.productId}-${index}`} className="flex gap-3 text-sm">
            {item.image ? <img src={item.image} alt="" className="h-12 w-12 rounded-xl object-cover" /> : <div className="grid h-12 w-12 place-items-center rounded-xl bg-ink text-[10px] font-bold text-brand">CG</div>}
            <div className="flex-1">
              <p className="font-semibold">{item.productName}</p>
              <p className="text-stone-500">{item.variant ? `${item.variant} · ` : ''}Qty {item.quantity}{item.addons.length ? ` · ${item.addons.map((addon) => addon.name).join(', ')}` : ''}</p>
            </div>
            <p>{pkr(item.total)}</p>
          </li>
        ))}
      </ul>
      <div className="mt-3 space-y-1 text-sm">
        <Row label="Subtotal" value={pkr(order.subtotal)} />
        <Row label="Delivery" value={pkr(order.deliveryFee)} />
        {order.discount ? <Row label="Discount" value={pkr(order.discount)} /> : null}
        <Row label="Total" value={pkr(order.total)} />
      </div>
      {order.customerNotes ? <p className="mt-3 rounded-2xl bg-paper p-3 text-sm">Note: {order.customerNotes}</p> : null}
      {order.rejectionReason ? <p className="mt-3 text-sm">Reason: {order.rejectionReason}</p> : null}
      <div className="mt-4 overflow-hidden rounded-2xl border border-line">
        <p className="bg-paper px-3 py-2 text-xs font-semibold tracking-wide text-stone-500">KITCHEN — items and notes only</p>
        <KitchenSlip order={order} />
      </div>
      <div className="mt-3 overflow-hidden rounded-2xl border border-line">
        <p className="bg-paper px-3 py-2 text-xs font-semibold tracking-wide text-stone-500">CUSTOMER RECEIPT</p>
        <ReceiptSlip order={order} settings={settings} />
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <button type="button" onClick={() => printReceipt(order, 'both')} className="h-11 rounded-full bg-ink font-bold text-white">Print</button>
        {next ? <button type="button" onClick={onAdvance} className="h-11 rounded-full bg-brand font-bold">{actionLabel(order.status, order.orderType)}</button> : null}
        {['new', 'accepted', 'preparing', 'ready'].includes(order.status) ? <button type="button" onClick={onReject} className="h-11 rounded-full border border-ember text-ember">Reject</button> : null}
        {order.status === 'completed' ? <p className="text-sm text-stone-500">This order is complete.</p> : null}
        {order.status === 'cancelled' ? <p className="text-sm text-stone-500">No further processing actions.</p> : null}
      </div>
    </aside>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-stone-500">{label}</span><span className="font-semibold">{value}</span></div>
}
