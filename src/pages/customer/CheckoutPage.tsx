import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../context/AppState'
import { usePageTitle } from '../../hooks/usePageTitle'
import { pkr } from '../../utils/format'

export function CheckoutPage() {
  usePageTitle('Checkout — Chill & Grill')
  const { cart, cartSubtotal, settings, placeOrder, pushToast, session } = useStore()
  const navigate = useNavigate()
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery')
  const [payment, setPayment] = useState<'cod' | 'pay_at_restaurant'>('cod')
  const [name, setName] = useState(session?.name ?? '')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [area, setArea] = useState(settings.deliveryAreas[0] ?? '')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    if (session?.name) setName((current) => current || session.name)
  }, [session])
  const deliveryFee = orderType === 'delivery' ? settings.deliveryFee : 0
  const total = cartSubtotal + deliveryFee

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim() || phone.replace(/\D/g, '').length < 10) {
      setError('Enter your name and a valid phone number.')
      return
    }
    if (orderType === 'delivery' && (!address.trim() || !area.trim())) {
      setError('Delivery needs an address and area.')
      return
    }
    setBusy(true)
    void (async () => {
      try {
        const order = await placeOrder({
          customerName: name,
          phone,
          address,
          area: orderType === 'pickup' ? 'Pickup' : area,
          orderType,
          paymentMethod: payment,
          customerNotes: notes,
        })
        navigate(`/order/${order.id}`)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to place the order.'
        setError(message)
        pushToast(message, 'err')
        setBusy(false)
      }
    })()
  }

  if (!cart.length) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-display text-5xl">Your cart is empty</h1>
        <a href="/#menu" className="mt-4 inline-block rounded-full bg-brand px-5 py-3 text-sm font-bold text-ink">Back to Menu</a>
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 lg:grid-cols-[1.1fr_0.9fr]">
      <form onSubmit={submit} className="rounded-3xl bg-coal p-5">
        <h1 className="font-display text-5xl">Checkout</h1>
        {session ? null : <p className="mt-2 text-sm text-white/60"><a href="/login" className="font-semibold text-brand">Log in</a> to keep this order on your account. Guests can still order.</p>}
        {!settings.acceptOrders ? <p className="mt-3 rounded-2xl bg-ember/20 px-3 py-2 text-sm">The restaurant is not accepting orders right now.</p> : null}
        <Field label="Customer name" value={name} onChange={setName} />
        <Field label="Phone number" value={phone} onChange={setPhone} type="tel" />
        <fieldset className="mt-4">
          <legend className="text-sm font-semibold">Order type</legend>
          <div className="mt-2 flex gap-3 text-sm">
            <label className="flex items-center gap-2"><input type="radio" checked={orderType === 'delivery'} onChange={() => setOrderType('delivery')} /> Delivery</label>
            <label className="flex items-center gap-2"><input type="radio" checked={orderType === 'pickup'} onChange={() => setOrderType('pickup')} /> Pickup</label>
          </div>
        </fieldset>
        {orderType === 'delivery' ? (
          <>
            <Field label="Delivery address" value={address} onChange={setAddress} />
            <label className="mt-3 block text-sm">
              Area
              <select value={area} onChange={(event) => setArea(event.target.value)} className="mt-1 h-11 w-full rounded-2xl bg-white/8 px-3">
                {settings.deliveryAreas.length ? settings.deliveryAreas.map((item) => <option key={item}>{item}</option>) : <option value="">Add areas in settings</option>}
                <option value={area && !settings.deliveryAreas.includes(area) ? area : 'Other'}>Other</option>
              </select>
            </label>
            {!settings.deliveryAreas.includes(area) ? <Field label="Area name" value={area} onChange={setArea} /> : null}
          </>
        ) : (
          <p className="mt-3 text-sm text-white/60">Pickup from {settings.address}</p>
        )}
        <fieldset className="mt-4">
          <legend className="text-sm font-semibold">Payment</legend>
          <div className="mt-2 flex flex-col gap-2 text-sm">
            <label className="flex items-center gap-2"><input type="radio" checked={payment === 'cod'} onChange={() => setPayment('cod')} /> Cash on Delivery</label>
            <label className="flex items-center gap-2"><input type="radio" checked={payment === 'pay_at_restaurant'} onChange={() => setPayment('pay_at_restaurant')} /> Pay at Restaurant</label>
          </div>
        </fieldset>
        <label className="mt-4 block text-sm">
          Order notes
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-1 h-24 w-full rounded-2xl bg-white/8 px-3 py-2" />
        </label>
        {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
        <button type="submit" disabled={busy || !settings.acceptOrders} className="mt-5 h-12 w-full rounded-full bg-brand text-sm font-bold text-ink disabled:opacity-40">
          {busy ? 'Placing order…' : 'Place Order'}
        </button>
      </form>
      <aside className="h-fit rounded-3xl bg-white p-5 text-ink">
        <h2 className="font-display text-4xl">Order summary</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {cart.map((line) => (
            <li key={line.lineId} className="flex justify-between gap-3">
              <span>{line.quantity} × {line.name}{line.variant ? ` (${line.variant})` : ''}</span>
              <span className="font-semibold">{pkr(line.unitPrice * line.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1 border-t border-line pt-3 text-sm">
          <Row label="Subtotal" value={pkr(cartSubtotal)} />
          <Row label="Delivery" value={orderType === 'pickup' ? 'Pickup' : pkr(deliveryFee)} />
          {orderType === 'delivery' && deliveryFee === 0 ? <p className="text-xs text-stone-500">Delivery fee is not printed on the menu. It is Rs. 0 until set in restaurant settings.</p> : null}
          <Row label="Total" value={pkr(total)} strong />
        </div>
      </aside>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="mt-3 block text-sm">
      {label}
      <input required={type !== 'text' ? false : undefined} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-11 w-full rounded-2xl bg-white/8 px-3 outline-none" />
    </label>
  )
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? 'text-base font-bold' : ''}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}
