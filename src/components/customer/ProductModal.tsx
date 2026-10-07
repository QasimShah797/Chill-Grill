import { useEffect, useMemo, useState } from 'react'
import type { Product } from '../../types'
import { productImage, unitWithAddons, useStore } from '../../context/AppState'
import { addonsForProduct } from '../../services/catalogService'
import { pkr } from '../../utils/format'
import { FoodImage } from '../ui/FoodImage'
import { QuantitySelector } from '../ui/QuantitySelector'

export function ProductModal({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { menuAddons, addToCart } = useStore()
  const [qty, setQty] = useState(1)
  const [variantId, setVariantId] = useState('')
  const [addonIds, setAddonIds] = useState<string[]>([])
  const [notes, setNotes] = useState('')

  useEffect(() => {
    setQty(1)
    setVariantId(product?.variants?.[0]?.id ?? '')
    setAddonIds([])
    setNotes('')
  }, [product])

  const extras = useMemo(() => (product ? addonsForProduct(product, menuAddons) : []), [product, menuAddons])
  if (!product) return null
  const variant = product.variants?.find((item) => item.id === variantId) ?? product.variants?.[0]
  const base = variant?.price ?? product.price
  const selected = extras.filter((addon) => addonIds.includes(addon.id))
  const unit = unitWithAddons(base, selected)
  const total = unit * qty

  const add = () => {
    if (!product.available || product.priceMissing) return
    addToCart({
      productId: product.id,
      name: product.name,
      variant: variant?.name,
      unitPrice: unit,
      addons: selected.map((addon) => ({ id: addon.id, name: addon.name, price: addon.price })),
      notes: notes.trim() || undefined,
      image: productImage(product),
      kind: 'product',
      quantity: qty,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="product-title">
      <button type="button" className="absolute inset-0" aria-label="Close product" onClick={onClose} />
      <div className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-coal sm:max-w-lg sm:rounded-3xl">
        <FoodImage src={productImage(product)} alt={product.name} className="h-56 w-full sm:h-64" />
        <button type="button" className="absolute top-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-ink/80" onClick={onClose} aria-label="Close">✕</button>
        <div className="p-5">
          <h2 id="product-title" className="font-display text-4xl">{product.name}</h2>
          {product.description ? <p className="mt-2 text-sm text-white/65">{product.description}</p> : null}
          <p className="mt-2 text-lg font-semibold text-brand">{product.priceMissing ? 'Price not listed' : pkr(base)}</p>
          {product.variants?.length ? (
            <fieldset className="mt-4">
              <legend className="text-sm font-semibold">Choose</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.variants.map((item) => (
                  <button key={item.id} type="button" onClick={() => setVariantId(item.id)} className={`rounded-full px-3 py-2 text-sm font-semibold ${variant?.id === item.id ? 'bg-brand text-ink' : 'bg-white/10'}`}>
                    {item.name} · {pkr(item.price)}
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm font-semibold">Quantity</span>
            <QuantitySelector value={qty} onChange={(value) => setQty(Math.max(1, value))} />
          </div>
          {extras.length ? (
            <fieldset className="mt-4">
              <legend className="text-sm font-semibold">Add-ons · Rs. 50</legend>
              <div className="mt-2 space-y-2">
                {extras.map((addon) => (
                  <label key={addon.id} className="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-2 text-sm">
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={addonIds.includes(addon.id)}
                        onChange={() => setAddonIds((ids) => (ids.includes(addon.id) ? ids.filter((id) => id !== addon.id) : [...ids, addon.id]))}
                      />
                      {addon.name}
                    </span>
                    <span>{pkr(addon.price)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}
          <label className="mt-4 block text-sm">
            Special instructions
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Any special instructions?" className="mt-1 h-20 w-full resize-none rounded-2xl bg-white/8 px-3 py-2 text-sm outline-none" />
          </label>
          <button type="button" disabled={!product.available || product.priceMissing} onClick={add} className="mt-4 h-12 w-full rounded-full bg-brand text-sm font-bold text-ink disabled:opacity-40">
            {product.available && !product.priceMissing ? `Add to Cart — ${pkr(total)}` : 'Currently unavailable'}
          </button>
        </div>
      </div>
    </div>
  )
}
