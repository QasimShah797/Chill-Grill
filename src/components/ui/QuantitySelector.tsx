type Props = {
  value: number
  onChange: (value: number) => void
  label?: string
}

export function QuantitySelector({ value, onChange, label = 'Quantity' }: Props) {
  return (
    <div className="inline-flex items-center rounded-full border border-white/15 bg-black/40" role="group" aria-label={label}>
      <button type="button" className="h-10 w-10 rounded-full text-lg text-white" onClick={() => onChange(value - 1)} aria-label="Decrease quantity">
        −
      </button>
      <span className="min-w-6 text-center text-sm font-semibold">{value}</span>
      <button type="button" className="h-10 w-10 rounded-full text-lg text-white" onClick={() => onChange(value + 1)} aria-label="Increase quantity">
        +
      </button>
    </div>
  )
}
