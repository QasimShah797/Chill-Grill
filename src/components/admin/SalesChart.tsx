export function SalesChart({ points, mode }: { points: { label: string; sales: number; orders: number }[]; mode: 'sales' | 'orders' }) {
  const max = Math.max(1, ...points.map((point) => (mode === 'sales' ? point.sales : point.orders)))
  if (!points.length) return <p className="text-sm text-stone-500">No sales data for this period.</p>
  return (
    <div className="flex h-48 items-end gap-2">
      {points.map((point) => {
        const value = mode === 'sales' ? point.sales : point.orders
        const height = Math.max(6, Math.round((value / max) * 100))
        return (
          <div key={point.label + point.sales} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div className="flex h-36 w-full items-end">
              <div className="w-full rounded-t-lg bg-ink" style={{ height: `${height}%` }} title={`${point.label}: ${value}`} />
            </div>
            <span className="truncate text-[10px] text-stone-500">{point.label}</span>
          </div>
        )
      })}
    </div>
  )
}
