import { useState } from 'react'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { useStore } from '../../context/AppState'
import { usePageTitle } from '../../hooks/usePageTitle'
import type { Addon } from '../../types'
import { pkr, uid } from '../../utils/format'

export function AddonsPage() {
  usePageTitle('Add-ons — Chill & Grill')
  const { addons, categories, saveAddon, archiveAddon } = useStore()
  const [editing, setEditing] = useState<Addon | null>(null)
  const [removeId, setRemoveId] = useState<string | null>(null)
  const visible = addons.filter((addon) => !addon.archived)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-5xl">Add-ons</h1>
          <p className="text-sm text-stone-500">Extra charges printed on the menu are Rs. 50. They are not applied to every product.</p>
        </div>
        <button type="button" className="rounded-full bg-ink px-4 py-2 text-sm text-white" onClick={() => setEditing({ id: uid('addon'), name: '', price: 50, applicableCategoryIds: [], available: true })}>Add add-on</button>
      </div>
      <div className="mt-4 space-y-3">
        {visible.map((addon) => (
          <article key={addon.id} className="rounded-3xl bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-semibold">{addon.name}</h2>
                <p className="text-sm text-stone-500">{pkr(addon.price)} · {addon.available ? 'Available' : 'Unavailable'}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" className="rounded-full border border-line px-3 py-2 text-sm" onClick={() => setEditing(addon)}>Edit</button>
                <button type="button" className="rounded-full border border-line px-3 py-2 text-sm" onClick={() => saveAddon({ ...addon, available: !addon.available })}>{addon.available ? 'Disable' : 'Enable'}</button>
                <button type="button" className="rounded-full border border-ember px-3 py-2 text-sm text-ember" onClick={() => setRemoveId(addon.id)}>Delete</button>
              </div>
            </div>
            <p className="mt-2 text-xs text-stone-500">{addon.applicableCategoryIds.map((id) => categories.find((category) => category.id === id)?.name ?? id).join(', ') || 'No categories selected'}</p>
          </article>
        ))}
      </div>
      {editing ? <AddonEditor addon={editing} categories={categories.map((category) => ({ id: category.id, name: category.name }))} onClose={() => setEditing(null)} onSave={(addon) => { saveAddon(addon); setEditing(null) }} /> : null}
      <ConfirmDialog open={Boolean(removeId)} title="Remove this add-on?" body="It will no longer be offered on products." confirmLabel="Delete" danger onClose={() => setRemoveId(null)} onConfirm={() => { if (removeId) archiveAddon(removeId); setRemoveId(null) }} />
    </div>
  )
}

function AddonEditor({ addon, categories, onClose, onSave }: { addon: Addon; categories: { id: string; name: string }[]; onClose: () => void; onSave: (addon: Addon) => void }) {
  const [draft, setDraft] = useState(addon)
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/50 p-4 sm:place-items-center">
      <form className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-5" onSubmit={(event) => { event.preventDefault(); onSave({ ...draft, price: Number(draft.price) }) }}>
        <h2 className="font-display text-4xl">Add-on</h2>
        <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Add-on name" className="mt-3 h-11 w-full rounded-2xl bg-paper px-3" required />
        <input value={draft.price} onChange={(event) => setDraft({ ...draft, price: Number(event.target.value) })} className="mt-2 h-11 w-full rounded-2xl bg-paper px-3" />
        <div className="mt-3 grid max-h-52 grid-cols-2 gap-2 overflow-y-auto text-sm">
          {categories.map((category) => (
            <label key={category.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={draft.applicableCategoryIds.includes(category.id)}
                onChange={() => setDraft({
                  ...draft,
                  applicableCategoryIds: draft.applicableCategoryIds.includes(category.id)
                    ? draft.applicableCategoryIds.filter((id) => id !== category.id)
                    : [...draft.applicableCategoryIds, category.id],
                })}
              />
              {category.name}
            </label>
          ))}
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.available} onChange={(event) => setDraft({ ...draft, available: event.target.checked })} /> Available</label>
        <div className="mt-4 flex gap-2">
          <button type="submit" className="rounded-full bg-ink px-4 py-2 text-sm text-white">Save</button>
          <button type="button" onClick={onClose} className="rounded-full border border-line px-4 py-2 text-sm">Cancel</button>
        </div>
      </form>
    </div>
  )
}
