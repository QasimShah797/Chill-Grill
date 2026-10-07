import { useState } from 'react'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { FoodImage } from '../../components/ui/FoodImage'
import { productImage, useStore } from '../../context/AppState'
import { usePageTitle } from '../../hooks/usePageTitle'
import type { Deal } from '../../types'
import { pkr } from '../../utils/format'
import { compressImage } from '../../utils/format'

export function DealsPage() {
  usePageTitle('Deals — Chill & Grill')
  const { deals, saveDeal, archiveDeal } = useStore()
  const [editing, setEditing] = useState<Deal | null>(null)
  const [removeId, setRemoveId] = useState<string | null>(null)
  const visible = deals.filter((deal) => !deal.archived)

  return (
    <div>
      <h1 className="font-display text-5xl">Deals</h1>
      <p className="mt-1 text-sm text-stone-500">BBQ person deals from the menu. Contents stay as printed unless you edit them.</p>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {visible.map((deal) => (
          <article key={deal.id} className="rounded-3xl bg-white p-4">
            <div className="flex gap-3">
              <FoodImage src={deal.image || productImage({ imageKey: deal.imageKey, categoryId: deal.categoryId })} alt="" className="h-20 w-20 rounded-2xl" />
              <div>
                <h2 className="font-semibold">{deal.name}</h2>
                <p className="text-brand">{pkr(deal.price)}</p>
                <p className="text-sm text-stone-500">{deal.available ? 'Available' : 'Unavailable'}</p>
              </div>
            </div>
            <ul className="mt-3 text-sm text-stone-600">{deal.items.map((item) => <li key={item}>• {item}</li>)}</ul>
            <div className="mt-3 flex gap-2">
              <button type="button" className="rounded-full bg-ink px-3 py-2 text-sm text-white" onClick={() => setEditing(deal)}>Edit</button>
              <button type="button" className="rounded-full border border-line px-3 py-2 text-sm" onClick={() => saveDeal({ ...deal, available: !deal.available }, deal.id)}>{deal.available ? 'Disable' : 'Enable'}</button>
              <button type="button" className="rounded-full border border-ember px-3 py-2 text-sm text-ember" onClick={() => setRemoveId(deal.id)}>Delete</button>
            </div>
          </article>
        ))}
      </div>
      {editing ? <DealEditor deal={editing} onClose={() => setEditing(null)} onSave={(deal) => { saveDeal(deal, deal.id); setEditing(null) }} /> : null}
      <ConfirmDialog open={Boolean(removeId)} title="Archive this deal?" body="Customers will no longer see it." confirmLabel="Delete" danger onClose={() => setRemoveId(null)} onConfirm={() => { if (removeId) archiveDeal(removeId); setRemoveId(null) }} />
    </div>
  )
}

function DealEditor({ deal, onClose, onSave }: { deal: Deal; onClose: () => void; onSave: (deal: Deal) => void }) {
  const [draft, setDraft] = useState(deal)
  const [itemsText, setItemsText] = useState(deal.items.join('\n'))
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/50 p-4 sm:place-items-center">
      <form className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-5" onSubmit={(event) => { event.preventDefault(); onSave({ ...draft, items: itemsText.split('\n').map((line) => line.trim()).filter(Boolean), price: Number(draft.price) }) }}>
        <h2 className="font-display text-4xl">Edit deal</h2>
        <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className="mt-3 h-11 w-full rounded-2xl bg-paper px-3" />
        <input value={draft.price} onChange={(event) => setDraft({ ...draft, price: Number(event.target.value) })} className="mt-2 h-11 w-full rounded-2xl bg-paper px-3" />
        <textarea value={itemsText} onChange={(event) => setItemsText(event.target.value)} className="mt-2 h-40 w-full rounded-2xl bg-paper px-3 py-2" />
        <input type="file" accept="image/*" className="mt-2 text-sm" onChange={(event) => {
          const file = event.target.files?.[0]
          if (!file) return
          void compressImage(file).then((image) => setDraft({ ...draft, image }))
        }} />
        <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.available} onChange={(event) => setDraft({ ...draft, available: event.target.checked })} /> Available</label>
        <div className="mt-4 flex gap-2">
          <button type="submit" className="rounded-full bg-ink px-4 py-2 text-sm text-white">Save</button>
          <button type="button" onClick={onClose} className="rounded-full border border-line px-4 py-2 text-sm">Cancel</button>
        </div>
      </form>
    </div>
  )
}
