import { FormEvent, useState, type ReactNode } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../../context/AppState'
import { canEditCatalog } from '../../services/authService'
import { usePageTitle } from '../../hooks/usePageTitle'
import { compressImage, uid } from '../../utils/format'
import type { Variant } from '../../types'

export function ProductFormPage() {
  const { id } = useParams()
  return <Editor key={id ?? 'new'} />
}

function Editor() {
  usePageTitle('Edit product — Chill & Grill')
  const { id } = useParams()
  const navigate = useNavigate()
  const { products, categories, saveProduct, pushToast, session } = useStore()
  const existing = id ? products.find((product) => product.id === id) : undefined
  const [name, setName] = useState(existing?.name ?? '')
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? categories[0]?.id ?? '')
  const [description, setDescription] = useState(existing?.description ?? '')
  const [price, setPrice] = useState(existing && !existing.variants?.length ? String(existing.price) : '')
  const [available, setAvailable] = useState(existing?.available ?? true)
  const [featured, setFeatured] = useState(existing?.featured ?? false)
  const [popular, setPopular] = useState(existing?.popular ?? false)
  const [image, setImage] = useState(existing?.image ?? '')
  const [gallery, setGallery] = useState<string[]>(existing?.gallery ?? [])
  const [variants, setVariants] = useState<Variant[]>(existing?.variants ?? [])
  const [error, setError] = useState('')
  const [preview, setPreview] = useState('')

  if (session && !canEditCatalog(session.role)) return <Navigate to="/admin/products" replace />

  if (id && !existing) {
    return <div className="rounded-3xl bg-white p-6"><p>Product could not be saved.</p><p className="text-sm text-stone-500">That product was not found.</p><Link to="/admin/products">Back</Link></div>
  }

  const onFile = async (file: File, galleryMode = false) => {
    try {
      const data = await compressImage(file)
      setPreview(data)
      if (galleryMode) setGallery((items) => [...items, data].slice(0, 4))
      else setImage(data)
    } catch {
      setError('Image could not be prepared. Try a smaller photo.')
    }
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const numeric = Number(price)
    if (!name.trim() || !categoryId) {
      setError('Product could not be saved. Name and category are required.')
      return
    }
    if (!variants.length && (!Number.isFinite(numeric) || numeric < 0)) {
      setError('Enter a valid price.')
      return
    }
    if (variants.some((variant) => !variant.name.trim() || variant.price < 0)) {
      setError('Each variant needs a name and price.')
      return
    }
    try {
      saveProduct({
        name,
        categoryId,
        description,
        price: variants.length ? Math.min(...variants.map((variant) => variant.price)) : numeric,
        image,
        gallery,
        available,
        featured,
        popular,
        variants,
        imageKey: existing?.imageKey,
      }, existing?.id)
      pushToast('Product saved')
      navigate('/admin/products')
    } catch {
      setError('Product could not be saved.')
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl rounded-3xl bg-white p-5">
      <h1 className="font-display text-5xl">{existing ? 'Edit product' : 'Add product'}</h1>
      <Label text="Product name"><input value={name} onChange={(event) => setName(event.target.value)} className="field" /></Label>
      <Label text="Category">
        <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="field">
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
      </Label>
      <Label text="Description"><textarea value={description} onChange={(event) => setDescription(event.target.value)} className="field h-24" /></Label>
      {!variants.length ? <Label text="Price"><input inputMode="numeric" value={price} onChange={(event) => setPrice(event.target.value)} className="field" /></Label> : null}
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Variants</p>
          <button type="button" className="text-sm font-semibold" onClick={() => setVariants((items) => [...items, { id: uid('var'), name: '', price: 0 }])}>Add variant</button>
        </div>
        {variants.map((variant, index) => (
          <div key={variant.id} className="mt-2 grid grid-cols-[1fr_120px_auto] gap-2">
            <input value={variant.name} onChange={(event) => setVariants((items) => items.map((item, i) => i === index ? { ...item, name: event.target.value } : item))} className="field" placeholder="Name" />
            <input inputMode="numeric" value={variant.price} onChange={(event) => setVariants((items) => items.map((item, i) => i === index ? { ...item, price: Number(event.target.value) } : item))} className="field" />
            <button type="button" onClick={() => setVariants((items) => items.filter((_, i) => i !== index))} aria-label="Remove variant">✕</button>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <p className="text-sm font-semibold">Primary image</p>
        {image || preview ? <img src={preview || image} alt="Preview" className="mt-2 h-40 w-full rounded-2xl object-cover" /> : null}
        <input type="file" accept="image/*" className="mt-2 text-sm" onChange={(event) => { const file = event.target.files?.[0]; if (file) void onFile(file) }} />
        {image ? <button type="button" className="mt-2 text-sm text-ember" onClick={() => { setImage(''); setPreview('') }}>Remove image</button> : null}
      </div>
      <div className="mt-4">
        <p className="text-sm font-semibold">Gallery</p>
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {gallery.map((src, index) => (
            <button type="button" key={src.slice(0, 24) + index} onClick={() => setGallery((items) => items.filter((_, i) => i !== index))} className="shrink-0">
              <img src={src} alt="" className="h-20 w-20 rounded-xl object-cover" />
            </button>
          ))}
        </div>
        <input type="file" accept="image/*" className="mt-2 text-sm" onChange={(event) => { const file = event.target.files?.[0]; if (file) void onFile(file, true) }} />
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={available} onChange={(event) => setAvailable(event.target.checked)} /> Available</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} /> Featured</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={popular} onChange={(event) => setPopular(event.target.checked)} /> Popular</label>
      </div>
      {error ? <p className="mt-3 text-sm text-ember">{error}</p> : null}
      <div className="mt-5 flex gap-2">
        <button type="submit" className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">Save product</button>
        <Link to="/admin/products" className="rounded-full border border-line px-5 py-3 text-sm">Cancel</Link>
      </div>
      <style>{`.field{margin-top:0.25rem;height:2.75rem;width:100%;border-radius:1rem;background:#f4f0e6;padding:0 0.75rem} textarea.field{height:6rem;padding-top:0.5rem}`}</style>
    </form>
  )
}

function Label({ text, children }: { text: string; children: ReactNode }) {
  return <label className="mt-3 block text-sm">{text}{children}</label>
}
