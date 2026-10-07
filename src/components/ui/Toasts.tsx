import { useStore } from '../../context/AppState'

export function Toasts() {
  const { toasts, dismissToast } = useStore()
  if (!toasts.length) return null
  return (
    <div className="fixed bottom-20 left-1/2 z-[70] flex w-[min(92vw,380px)] -translate-x-1/2 flex-col gap-2 md:bottom-6 md:left-auto md:right-6 md:translate-x-0">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          onClick={() => dismissToast(toast.id)}
          className={`rounded-2xl px-4 py-3 text-left text-sm font-semibold shadow-xl ${toast.tone === 'err' ? 'bg-ember text-white' : 'bg-brand text-ink'}`}
        >
          {toast.text}
        </button>
      ))}
    </div>
  )
}
