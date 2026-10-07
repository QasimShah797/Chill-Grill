import { FormEvent, useState, type ReactNode } from 'react'
import { useStore } from '../../context/AppState'
import { usePageTitle } from '../../hooks/usePageTitle'
import type { RestaurantSettings } from '../../types'

export function SettingsPage() {
  usePageTitle('Settings — Chill & Grill')
  const { settings, updateSettings, pushToast } = useStore()
  const [draft, setDraft] = useState<RestaurantSettings>(settings)
  const [areas, setAreas] = useState(settings.deliveryAreas.join('\n'))
  const [error, setError] = useState('')

  const save = (event: FormEvent) => {
    event.preventDefault()
    if (!draft.name.trim() || !draft.address.trim()) {
      setError('Restaurant name and address are required.')
      return
    }
    try {
      updateSettings({
        ...draft,
        deliveryFee: Number(draft.deliveryFee) || 0,
        minimumOrder: Number(draft.minimumOrder) || 0,
        prepMinutes: Number(draft.prepMinutes) || 0,
        deliveryAreas: areas.split('\n').map((line) => line.trim()).filter(Boolean),
        phones: draft.phones.filter((phone) => phone.number.trim()),
      })
      pushToast('Settings saved')
      setError('')
    } catch {
      setError('Settings could not be saved.')
    }
  }

  return (
    <form onSubmit={save} className="mx-auto max-w-3xl space-y-4">
      <h1 className="font-display text-5xl">Restaurant settings</h1>
      <Section title="Restaurant information">
        <Field label="Restaurant name" value={draft.name} onChange={(name) => setDraft({ ...draft, name })} />
        <Field label="Tagline" value={draft.tagline} onChange={(tagline) => setDraft({ ...draft, tagline })} />
        <Field label="Address" value={draft.address} onChange={(address) => setDraft({ ...draft, address })} />
        <Field label="Complaint phone" value={draft.complaintPhone} onChange={(complaintPhone) => setDraft({ ...draft, complaintPhone })} />
      </Section>
      <Section title="Contact information">
        {draft.phones.map((phone, index) => (
          <div key={`${phone.number}-${index}`} className="grid gap-2 md:grid-cols-2">
            <input value={phone.label} onChange={(event) => setDraft({ ...draft, phones: draft.phones.map((item, i) => i === index ? { ...item, label: event.target.value } : item) })} className="h-11 rounded-2xl bg-paper px-3" />
            <input value={phone.number} onChange={(event) => setDraft({ ...draft, phones: draft.phones.map((item, i) => i === index ? { ...item, number: event.target.value } : item) })} className="h-11 rounded-2xl bg-paper px-3" />
          </div>
        ))}
      </Section>
      <Section title="Delivery">
        <Field label="Delivery fee (Rs.)" value={String(draft.deliveryFee)} onChange={(value) => setDraft({ ...draft, deliveryFee: Number(value) })} />
        <p className="text-xs text-stone-500">Not printed on the menu. Leave 0 until you decide a fee.</p>
        <Field label="Minimum order (Rs.)" value={String(draft.minimumOrder)} onChange={(value) => setDraft({ ...draft, minimumOrder: Number(value) })} />
        <label className="block text-sm">Delivery areas
          <textarea value={areas} onChange={(event) => setAreas(event.target.value)} className="mt-1 h-24 w-full rounded-2xl bg-paper px-3 py-2" />
        </label>
      </Section>
      <Section title="Order settings">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.acceptOrders} onChange={(event) => setDraft({ ...draft, acceptOrders: event.target.checked })} /> Accept orders</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.autoAccept} onChange={(event) => setDraft({ ...draft, autoAccept: event.target.checked })} /> Auto accept orders</label>
        <Field label="Estimated preparation time (minutes)" value={String(draft.prepMinutes)} onChange={(value) => setDraft({ ...draft, prepMinutes: Number(value) })} />
        <p className="text-xs text-stone-500">Preparation time is not printed on the menu. This is a working default.</p>
      </Section>
      <Section title="Business hours">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.hoursListed} onChange={(event) => setDraft({ ...draft, hoursListed: event.target.checked })} /> Show hours on the website</label>
        <p className="text-xs text-stone-500">The menu does not list opening hours. Turn this on after you enter them.</p>
        {draft.hours.map((day, index) => (
          <div key={day.day} className="grid grid-cols-[1fr_90px_90px_auto] items-center gap-2 text-sm">
            <span>{day.day}</span>
            <input type="time" value={day.open} onChange={(event) => setDraft({ ...draft, hours: draft.hours.map((item, i) => i === index ? { ...item, open: event.target.value } : item) })} className="h-10 rounded-xl bg-paper px-2" />
            <input type="time" value={day.close} onChange={(event) => setDraft({ ...draft, hours: draft.hours.map((item, i) => i === index ? { ...item, close: event.target.value } : item) })} className="h-10 rounded-xl bg-paper px-2" />
            <label className="flex items-center gap-1"><input type="checkbox" checked={day.closed} onChange={(event) => setDraft({ ...draft, hours: draft.hours.map((item, i) => i === index ? { ...item, closed: event.target.checked } : item) })} /> Closed</label>
          </div>
        ))}
      </Section>
      {error ? (
        <div className="rounded-2xl bg-white p-4 text-sm">
          <p>{error}</p>
          <button type="button" className="mt-2 font-semibold" onClick={() => setError('')}>Try Again</button>
        </div>
      ) : null}
      <button type="submit" className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">Save settings</button>
    </form>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section className="space-y-3 rounded-3xl bg-white p-4"><h2 className="font-display text-3xl">{title}</h2>{children}</section>
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm">{label}
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-11 w-full rounded-2xl bg-paper px-3" />
    </label>
  )
}
