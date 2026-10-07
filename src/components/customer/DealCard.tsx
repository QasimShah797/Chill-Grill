import type { Deal } from '../../types'
import { productImage, useStore } from '../../context/AppState'
import { pkr } from '../../utils/format'
import { FoodImage } from '../ui/FoodImage'
import { QuantitySelector } from '../ui/QuantitySelector'

export function DealCard({ deal }: { deal: Deal }) {
  const { addToCart, cart, setQty } = useStore()
  const line = cart.find((item) => item.productId === deal.id && item.kind === 'deal')
  return (
    <article className="overflow-hidden rounded-[1.7rem] bg-coal ring-1 ring-brand/30">
      <div className="grid sm:grid-cols-[180px_1fr]">
        <FoodImage src={deal.image || productImage({ imageKey: deal.imageKey, categoryId: deal.categoryId })} alt={deal.name} className="h-40 w-full sm:h-full" />
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-3xl">{deal.name}</h3>
            {deal.badge ? <span className="rounded-full bg-brand px-2 py-1 text-[11px] font-bold text-ink">{deal.badge}</span> : null}
          </div>
          <ul className="mt-2 space-y-1 text-sm text-white/70">
            {deal.items.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="font-display text-3xl text-brand">{pkr(deal.price)}</p>
            {!deal.available ? (
              <p className="text-sm text-white/50">Currently unavailable</p>
            ) : line ? (
              <QuantitySelector value={line.quantity} onChange={(value) => setQty(line.lineId, value)} />
            ) : (
              <button
                type="button"
                className="rounded-full bg-brand px-4 py-2 text-sm font-bold text-ink"
                onClick={() => addToCart({ productId: deal.id, name: deal.name, unitPrice: deal.price, addons: [], image: deal.image || productImage({ imageKey: deal.imageKey }), kind: 'deal' })}
              >
                Add Deal
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
