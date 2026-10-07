import { useState } from 'react'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { useStore } from '../../context/AppState'
import { usePageTitle } from '../../hooks/usePageTitle'
import type { Category } from '../../types'

export function CategoriesPage() {
  usePageTitle('Categories — Chill & Grill')
  const { categories, saveCategory } = useStore()
  const [disable, setDisable] = useState<Category | null>(null)
  const sorted = [...categories].sort((a, b) => a.order - b.order)

  return (
    <div>
      <h1 className="font-display text-5xl">Categories</h1>
      <p className="mt-1 text-sm text-stone-500">Names and order come from the printed menu. Disabling a category hides it on the website.</p>
      <div className="mt-4 space-y-3">
        {sorted.map((category) => (
          <CategoryRow key={category.id} category={category} onSave={saveCategory} onDisable={() => setDisable(category)} />
        ))}
      </div>
      <ConfirmDialog
        open={Boolean(disable)}
        title={disable?.enabled ? `Disable ${disable.name}?` : 'Update category'}
        body="Products in a disabled category are hidden from customers."
        confirmLabel={disable?.enabled ? 'Disable category' : 'Enable category'}
        danger={Boolean(disable?.enabled)}
        onClose={() => setDisable(null)}
        onConfirm={() => {
          if (disable) saveCategory({ ...disable, enabled: !disable.enabled })
          setDisable(null)
        }}
      />
    </div>
  )
}

function CategoryRow({ category, onSave, onDisable }: { category: Category; onSave: (category: Category) => void; onDisable: () => void }) {
  const [name, setName] = useState(category.name)
  const [order, setOrder] = useState(String(category.order))
  return (
    <article className="grid gap-2 rounded-3xl bg-white p-4 md:grid-cols-[1fr_90px_auto_auto] md:items-center">
      <input value={name} onChange={(event) => setName(event.target.value)} className="h-11 rounded-2xl bg-paper px-3" />
      <input value={order} onChange={(event) => setOrder(event.target.value)} className="h-11 rounded-2xl bg-paper px-3" aria-label="Display order" />
      <button type="button" className="rounded-full bg-ink px-4 py-2 text-sm text-white" onClick={() => onSave({ ...category, name: name.trim() || category.name, order: Number(order) || category.order })}>Save</button>
      <button type="button" className="rounded-full border border-line px-4 py-2 text-sm" onClick={onDisable}>{category.enabled ? 'Enabled' : 'Disabled'}</button>
    </article>
  )
}
