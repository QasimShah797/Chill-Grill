import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { EmptyState } from '../../components/ui/EmptyState'
import { FoodImage } from '../../components/ui/FoodImage'
import { productImage, useStore } from '../../context/AppState'
import { useDebounced } from '../../hooks/useDebounced'
import { usePageTitle } from '../../hooks/usePageTitle'
import { canEditCatalog } from '../../services/authService'
import { priceLabel } from '../../services/catalogService'
import { paginate } from '../../services/orderService'
import { fuzzyMatch } from '../../utils/format'

export function ProductsPage() {
  usePageTitle('Products — Chill & Grill')
  const { products, categories, session, setProductAvailable, archiveProduct, duplicateProduct } = useStore()
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('all')
  const [availability, setAvailability] = useState<'all' | 'available' | 'unavailable'>('all')
  const [sort, setSort] = useState<'name' | 'price' | 'category'>('name')
  const [showArchived, setShowArchived] = useState(false)
  const [page, setPage] = useState(1)
  const [removeId, setRemoveId] = useState<string | null>(null)
  const query = useDebounced(search)
  const editable = session ? canEditCatalog(session.role) : false
  const nameOf = (id: string) => categories.find((category) => category.id === id)?.name ?? 'Category'

  const rows = useMemo(() => {
    const list = products.filter((product) => {
      if (!showArchived && product.archived) return false
      if (categoryId !== 'all' && product.categoryId !== categoryId) return false
      if (availability === 'available' && !product.available) return false
      if (availability === 'unavailable' && product.available) return false
      return fuzzyMatch(`${product.name} ${nameOf(product.categoryId)}`, query)
    })
    return [...list].sort((a, b) => {
      if (sort === 'price') return a.price - b.price
      if (sort === 'category') return nameOf(a.categoryId).localeCompare(nameOf(b.categoryId))
      return a.name.localeCompare(b.name)
    })
  }, [products, query, categoryId, availability, sort, showArchived, categories])
  const pageData = paginate(rows, page, 12)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-5xl">Products</h1>
        {editable ? <Link to="/admin/products/new" className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">Add product</Link> : null}
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-4">
        <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search product name" className="h-11 rounded-2xl bg-white px-3" />
        <select value={categoryId} onChange={(event) => { setCategoryId(event.target.value); setPage(1) }} className="h-11 rounded-2xl bg-white px-3">
          <option value="all">All categories</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
        <select value={availability} onChange={(event) => setAvailability(event.target.value as typeof availability)} className="h-11 rounded-2xl bg-white px-3">
          <option value="all">Any availability</option>
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>
        <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} className="h-11 rounded-2xl bg-white px-3">
          <option value="name">Name</option>
          <option value="price">Price</option>
          <option value="category">Category</option>
        </select>
      </div>
      <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={showArchived} onChange={(event) => setShowArchived(event.target.checked)} /> Show archived</label>
      <div className="mt-4 space-y-3">
        {pageData.items.map((product) => (
          <article key={product.id} className="flex flex-wrap items-center gap-3 rounded-3xl bg-white p-3">
            <FoodImage src={productImage(product)} alt="" className="h-16 w-16 rounded-2xl" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{product.name}</p>
              <p className="text-sm text-stone-500">{nameOf(product.categoryId)} · {priceLabel(product)}</p>
              {product.archived ? <p className="text-xs text-stone-400">Archived</p> : null}
            </div>
            <button type="button" onClick={() => setProductAvailable(product.id, !product.available)} className={`rounded-full px-3 py-2 text-sm font-semibold ${product.available ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'}`}>
              {product.available ? 'Available' : 'Unavailable'}
            </button>
            {editable ? (
              <div className="flex gap-2 text-sm">
                <Link to={`/admin/products/${product.id}`} className="rounded-full border border-line px-3 py-2">Edit</Link>
                <button type="button" className="rounded-full border border-line px-3 py-2" onClick={() => duplicateProduct(product.id)}>Duplicate</button>
                <button type="button" className="rounded-full border border-ember px-3 py-2 text-ember" onClick={() => setRemoveId(product.id)}>Delete</button>
              </div>
            ) : null}
          </article>
        ))}
        {!pageData.items.length ? <EmptyState title="No products found" /> : null}
      </div>
      <div className="mt-3 flex justify-between text-sm">
        <button type="button" className="rounded-full bg-white px-3 py-2" disabled={pageData.page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button>
        <span>{pageData.total} products</span>
        <button type="button" className="rounded-full bg-white px-3 py-2" disabled={pageData.page >= pageData.pages} onClick={() => setPage((value) => value + 1)}>Next</button>
      </div>
      <ConfirmDialog
        open={Boolean(removeId)}
        title="Archive this product?"
        body="It will disappear from the menu. You can still find it with Show archived."
        confirmLabel="Delete"
        danger
        onClose={() => setRemoveId(null)}
        onConfirm={() => {
          if (removeId) archiveProduct(removeId)
          setRemoveId(null)
        }}
      />
    </div>
  )
}
