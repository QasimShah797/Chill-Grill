import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { printReceipt } from '../../components/admin/OrderReceipt'
import { useStore } from '../../context/AppState'
import { useDebounced } from '../../hooks/useDebounced'
import { usePageTitle } from '../../hooks/usePageTitle'
import { addonsForProduct, priceLabel } from '../../services/catalogService'
import type { Deal, Product, SelectedAddon } from '../../types'
import { fuzzyMatch, pkr } from '../../utils/format'

type TicketLine = {
  lineId: string
  productId: string
  name: string
  variant?: string
  quantity: number
  unitPrice: number
  addons: SelectedAddon[]
  image?: string
}

export function CounterOrderPage() {
  usePageTitle('Take order — Chill & Grill')
  const { menuProducts, menuCategories, menuDeals, menuAddons, placeCounterOrder, pushToast } = useStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('all')
  const [ticket, setTicket] = useState<TicketLine[]>([])
  const [picker, setPicker] = useState<Product | null>(null)
  const [variantId, setVariantId] = useState('')
  const [addonIds, setAddonIds] = useState<string[]>([])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const query = useDebounced(search)

  const products = useMemo(
    () => menuProducts.filter((product) => (categoryId === 'all' || product.categoryId === categoryId) && fuzzyMatch(product.name, query)),
    [menuProducts, categoryId, query],
  )
  const deals = useMemo(
    () => (categoryId === 'all' ? menuDeals.filter((deal) => fuzzyMatch(deal.name, query)) : []),
    [menuDeals, categoryId, query],
  )
  const total = ticket.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)
  const pickerAddons = picker ? addonsForProduct(picker, menuAddons) : []

  const pushLine = (line: Omit<TicketLine, 'lineId' | 'quantity'>) => {
    const key = `${line.productId}|${line.variant ?? ''}|${line.addons.map((addon) => addon.id).sort().join(',')}`
    setTicket((current) => {
      const existing = current.find((item) => `${item.productId}|${item.variant ?? ''}|${item.addons.map((addon) => addon.id).sort().join(',')}` === key)
      if (existing) return current.map((item) => (item.lineId === existing.lineId ? { ...item, quantity: item.quantity + 1 } : item))
      return [...current, { ...line, quantity: 1, lineId: crypto.randomUUID() }]
    })
  }

  const openProduct = (product: Product) => {
    if (!product.available || product.priceMissing) return
    const extras = addonsForProduct(product, menuAddons)
    if ((product.variants?.length ?? 0) > 1 || extras.length) {
      setPicker(product)
      setVariantId(product.variants?.[0]?.id ?? '')
      setAddonIds([])
      return
    }
    pushLine({
      productId: product.id,
      name: product.name,
      unitPrice: product.price,
      addons: [],
      image: product.image,
    })
  }

  const confirmPicker = () => {
    if (!picker) return
    const variant = picker.variants?.find((item) => item.id === variantId)
    const addons = pickerAddons.filter((addon) => addonIds.includes(addon.id)).map((addon) => ({ id: addon.id, name: addon.name, price: addon.price }))
    const base = variant?.price ?? picker.price
    pushLine({
      productId: picker.id,
      name: picker.name,
      variant: variant?.name,
      unitPrice: base + addons.reduce((sum, addon) => sum + addon.price, 0),
      addons,
      image: picker.image,
    })
    setPicker(null)
  }

  const addDeal = (deal: Deal) => {
    if (!deal.available) return
    pushLine({ productId: deal.id, name: deal.name, unitPrice: deal.price, addons: [], image: deal.image })
  }

  const submit = () => {
    if (!ticket.length) {
      setError('Add at least one item.')
      return
    }
    if (phone.trim() && phone.replace(/\D/g, '').length < 10) {
      setError('Enter a full phone number, or leave it blank.')
      return
    }
    setBusy(true)
    setError('')
    void (async () => {
      try {
        const order = await placeCounterOrder({ customerName: name, phone, notes, lines: ticket })
        pushToast(`Counter order ${order.id} sent to the kitchen`)
        printReceipt(order, 'both')
        navigate(`/admin/orders/${order.id}`)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to place the order.')
        setBusy(false)
      }
    })()
  }

  return (
    <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="min-w-0">
        <h1 className="font-display text-5xl">Take order</h1>
        <p className="mt-1 text-sm text-stone-500">For a customer at the counter. This is paid at the restaurant and sent straight to the kitchen.</p>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the menu" className="mt-3 h-11 w-full rounded-2xl bg-white px-3" />
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => setCategoryId('all')} className={`rounded-full px-3 py-1.5 text-sm ${categoryId === 'all' ? 'bg-ink text-white' : 'bg-white'}`}>All</button>
          {menuCategories.map((category) => (
            <button key={category.id} type="button" onClick={() => setCategoryId(category.id)} className={`rounded-full px-3 py-1.5 text-sm ${categoryId === category.id ? 'bg-ink text-white' : 'bg-white'}`}>
              {category.name}
            </button>
          ))}
        </div>
        {deals.length ? (
          <div className="mt-4 grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
            {deals.map((deal) => (
              <button key={deal.id} type="button" disabled={!deal.available} onClick={() => addDeal(deal)} className="min-w-0 rounded-2xl bg-white p-3 text-left disabled:opacity-40">
                <span className="block font-semibold break-words">{deal.name}</span>
                <span className="text-sm text-stone-500">{pkr(deal.price)}</span>
              </button>
            ))}
          </div>
        ) : null}
        <div className="mt-4 grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
          {products.map((product) => (
            <button key={product.id} type="button" disabled={!product.available || product.priceMissing} onClick={() => openProduct(product)} className="min-w-0 rounded-2xl bg-white p-3 text-left disabled:opacity-40">
              <span className="block font-semibold break-words">{product.name}</span>
              <span className="text-sm text-stone-500">{product.available ? priceLabel(product) : 'Currently unavailable'}</span>
            </button>
          ))}
        </div>
      </section>
      <aside className="h-fit min-w-0 rounded-3xl bg-white p-4 xl:sticky xl:top-20">
        <h2 className="font-display text-3xl">Counter ticket</h2>
        {ticket.length === 0 ? <p className="mt-3 text-sm text-stone-500">Tap a dish to add it.</p> : (
          <ul className="mt-3 space-y-3">
            {ticket.map((line) => (
              <li key={line.lineId} className="flex items-center gap-2 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{line.name}</p>
                  <p className="text-stone-500">{line.variant ? `${line.variant} · ` : ''}{line.addons.map((addon) => addon.name).join(', ')} {pkr(line.unitPrice * line.quantity)}</p>
                </div>
                <button type="button" className="h-8 w-8 rounded-full bg-paper" aria-label="Decrease quantity" onClick={() => setTicket((current) => current.flatMap((item) => (item.lineId !== line.lineId ? item : item.quantity <= 1 ? [] : [{ ...item, quantity: item.quantity - 1 }])))}>−</button>
                <span className="w-4 text-center">{line.quantity}</span>
                <button type="button" className="h-8 w-8 rounded-full bg-paper" aria-label="Increase quantity" onClick={() => setTicket((current) => current.map((item) => (item.lineId === line.lineId ? { ...item, quantity: item.quantity + 1 } : item)))}>+</button>
              </li>
            ))}
          </ul>
        )}
        <label className="mt-4 block text-sm">
          Customer name
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Walk-in" className="mt-1 h-11 w-full rounded-2xl bg-paper px-3" />
        </label>
        <label className="mt-3 block text-sm">
          Phone, if they give one
          <input value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="tel" className="mt-1 h-11 w-full rounded-2xl bg-paper px-3" />
        </label>
        <label className="mt-3 block text-sm">
          Note for the kitchen
          <input value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-1 h-11 w-full rounded-2xl bg-paper px-3" />
        </label>
        <p className="mt-4 flex justify-between font-semibold"><span>Total</span><span>{pkr(total)}</span></p>
        <p className="text-xs text-stone-500">Pay at the counter. No delivery fee.</p>
        {error ? <p className="mt-2 text-sm text-ember">{error}</p> : null}
        <button type="button" disabled={busy || ticket.length === 0} onClick={submit} className="mt-3 h-12 w-full rounded-full bg-brand font-bold text-ink disabled:opacity-40">
          {busy ? 'Sending…' : 'Send to kitchen'}
        </button>
      </aside>
      {picker ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/50 p-4 sm:place-items-center" onClick={() => setPicker(null)}>
          <div className="w-full max-w-md rounded-3xl bg-white p-4" onClick={(event) => event.stopPropagation()}>
            <h2 className="font-display text-3xl">{picker.name}</h2>
            {picker.variants && picker.variants.length > 1 ? (
              <fieldset className="mt-3">
                <legend className="text-sm font-semibold">Size</legend>
                <div className="mt-2 flex flex-col gap-2">
                  {picker.variants.map((variant) => (
                    <label key={variant.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex items-center gap-2"><input type="radio" checked={variantId === variant.id} onChange={() => setVariantId(variant.id)} />{variant.name}</span>
                      <span>{pkr(variant.price)}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : null}
            {pickerAddons.length ? (
              <fieldset className="mt-3">
                <legend className="text-sm font-semibold">Add-ons</legend>
                <div className="mt-2 flex flex-col gap-2">
                  {pickerAddons.map((addon) => (
                    <label key={addon.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex items-center gap-2">
                        <input type="checkbox" checked={addonIds.includes(addon.id)} onChange={() => setAddonIds((current) => (current.includes(addon.id) ? current.filter((id) => id !== addon.id) : [...current, addon.id]))} />
                        {addon.name}
                      </span>
                      <span>{pkr(addon.price)}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : null}
            <button type="button" onClick={confirmPicker} className="mt-4 h-11 w-full rounded-full bg-brand font-bold text-ink">Add to ticket</button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
