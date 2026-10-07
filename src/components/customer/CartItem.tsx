import type { CartLine } from '../../types'
import { pkr } from '../../utils/format'
import { FoodImage } from '../ui/FoodImage'
import { QuantitySelector } from '../ui/QuantitySelector'

export function CartItem({ line, onQty }: { line: CartLine; onQty: (quantity: number) => void }) {
  return (
    <li className="flex gap-3 border-b border-white/10 py-3">
      <FoodImage src={line.image} alt="" className="h-16 w-16 shrink-0 rounded-2xl" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold leading-tight">{line.name}</p>
        {line.variant ? <p className="text-xs text-white/55">{line.variant}</p> : null}
        {line.addons.length ? <p className="text-xs text-white/55">{line.addons.map((addon) => addon.name).join(', ')}</p> : null}
        {line.notes ? <p className="text-xs text-white/45">“{line.notes}”</p> : null}
        <div className="mt-2 flex items-center justify-between">
          <QuantitySelector value={line.quantity} onChange={onQty} />
          <p className="text-sm font-semibold text-brand">{pkr(line.unitPrice * line.quantity)}</p>
        </div>
      </div>
    </li>
  )
}
