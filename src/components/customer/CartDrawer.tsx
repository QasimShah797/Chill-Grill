import { Link } from 'react-router-dom'
import { useStore } from '../../context/AppState'
import { pkr } from '../../utils/format'
import { CartItem } from './CartItem'

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { cart, setQty, cartSubtotal, settings } = useStore()
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60] bg-black/60" role="dialog" aria-modal="true" aria-label="Your cart">
      <button type="button" className="absolute inset-0" aria-label="Close cart" onClick={onClose} />
      <aside className="absolute top-0 right-0 flex h-full w-full max-w-md flex-col bg-ink shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
          <h2 className="font-display text-3xl">Your Cart</h2>
          <button type="button" onClick={onClose} aria-label="Close cart" className="h-10 w-10 rounded-full bg-white/10">✕</button>
        </div>
        {cart.length === 0 ? (
          <div className="grid flex-1 place-items-center px-6 text-center">
            <div>
              <p className="font-display text-4xl">Cart is empty</p>
              <p className="mt-2 text-sm text-white/55">Add a roll, a platter, or a cold drink.</p>
              <button type="button" onClick={onClose} className="mt-4 rounded-full bg-brand px-4 py-2 text-sm font-bold text-ink">Browse menu</button>
            </div>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-4">
              {cart.map((line) => (
                <CartItem key={line.lineId} line={line} onQty={(quantity) => setQty(line.lineId, quantity)} />
              ))}
            </ul>
            <div className="border-t border-white/10 p-4">
              <Row label="Subtotal" value={pkr(cartSubtotal)} />
              <Row label="Delivery fee" value="At checkout" />
              {settings.minimumOrder > 0 ? <p className="mt-1 text-xs text-white/45">Minimum delivery order {pkr(settings.minimumOrder)}</p> : null}
              <Link to="/checkout" onClick={onClose} className="mt-4 block rounded-full bg-brand py-3 text-center text-sm font-bold text-ink">
                Proceed to Checkout
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-white/60">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}
