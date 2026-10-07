import type { Addon, Product } from '../../types'
import { productImage, useStore } from '../../context/AppState'
import { addonsForProduct, priceLabel } from '../../services/catalogService'
import { FoodImage } from '../ui/FoodImage'
import { QuantitySelector } from '../ui/QuantitySelector'

export function ProductCard({ product, onOpen }: { product: Product; onOpen: (product: Product) => void }) {
  const { cart, addToCart, setQty, menuAddons } = useStore()
  const extras = addonsForProduct(product, menuAddons as Addon[])
  const quick = !product.variants?.length && extras.length === 0 && !product.priceMissing
  const line = cart.find((item) => item.productId === product.id && !item.variant && item.addons.length === 0 && !item.notes)
  const count = cart.filter((item) => item.productId === product.id).reduce((sum, item) => sum + item.quantity, 0)

  return (
    <article className="flex flex-col overflow-hidden rounded-3xl bg-coal ring-1 ring-white/8">
      <button type="button" className="relative block text-left" onClick={() => onOpen(product)}>
        <FoodImage src={productImage(product)} alt={product.name} className="aspect-[4/3] w-full" />
        {product.popular ? <span className="absolute top-3 left-3 rounded-full bg-brand px-2 py-1 text-[11px] font-bold text-ink">Popular</span> : null}
        {product.featured && !product.popular ? <span className="absolute top-3 left-3 rounded-full bg-white px-2 py-1 text-[11px] font-bold text-ink">Special</span> : null}
      </button>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-semibold leading-snug">{product.name}</h3>
        {product.description ? <p className="mt-1 text-sm text-white/55">{product.description}</p> : null}
        <p className="mt-2 font-semibold text-brand">{priceLabel(product)}</p>
        <div className="mt-auto pt-3">
          {!product.available ? (
            <p className="text-sm font-medium text-white/50">Currently unavailable</p>
          ) : quick && line ? (
            <QuantitySelector value={line.quantity} onChange={(value) => setQty(line.lineId, value)} />
          ) : (
            <button type="button" className="h-11 w-full rounded-full bg-brand text-sm font-bold text-ink" onClick={() => (quick ? addToCart({ productId: product.id, name: product.name, unitPrice: product.price, addons: [], image: productImage(product), kind: 'product' }) : onOpen(product))}>
              {count > 0 ? `Add · ${count} in cart` : '+ Add'}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
