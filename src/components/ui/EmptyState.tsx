export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-12 text-center">
      <p className="font-display text-3xl text-ink">{title}</p>
      {body ? <p className="mt-2 text-sm text-stone-500">{body}</p> : null}
    </div>
  )
}
