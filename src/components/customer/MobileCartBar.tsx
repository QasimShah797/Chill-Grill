import { useStore } from '../../context/AppState'
import { pkr } from '../../utils/format'

export function MobileCartBar({ onOpen }: { onOpen: () => void }) {
  const { cartCount, cartSubtotal } = useStore()
  if (!cartCount) return null
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 p-3 md:hidden">
      <button type="button" onClick={onOpen} className="flex w-full items-center justify-between rounded-full bg-brand px-5 py-3 text-sm font-bold text-ink shadow-xl">
        <span>{cartCount} item{cartCount === 1 ? '' : 's'}</span>
        <span>View cart · {pkr(cartSubtotal)}</span>
      </button>
    </div>
  )
}
