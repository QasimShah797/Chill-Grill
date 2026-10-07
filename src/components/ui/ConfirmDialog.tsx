import { useEffect, useRef, type ReactNode } from 'react'

type Props = {
  open: boolean
  title: string
  body: string
  confirmLabel: string
  danger?: boolean
  busy?: boolean
  onConfirm: () => void
  onClose: () => void
  children?: ReactNode
}

export function ConfirmDialog({ open, title, body, confirmLabel, danger, busy, onConfirm, onClose, children }: Props) {
  const ref = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (open) ref.current?.focus()
  }, [open])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[80] grid place-items-end bg-black/60 p-4 sm:place-items-center" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="w-full max-w-md rounded-3xl bg-white p-5 text-ink shadow-2xl">
        <h2 id="confirm-title" className="font-display text-3xl">{title}</h2>
        <p className="mt-2 text-sm text-stone-600">{body}</p>
        {children}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" ref={ref} className="rounded-full px-4 py-2 text-sm font-semibold" onClick={onClose}>Cancel</button>
          <button
            type="button"
            disabled={busy}
            className={`rounded-full px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 ${danger ? 'bg-ember' : 'bg-ink'}`}
            onClick={onConfirm}
          >
            {busy ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
