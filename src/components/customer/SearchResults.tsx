import type { Product } from '../../types'
import { useStore } from '../../context/AppState'
import { fuzzyMatch } from '../../utils/format'
import { ProductCard } from './ProductCard'

export function SearchResults({ onOpen }: { onOpen: (product: Product) => void }) {
  const { search, menuProducts, menuCategories, menuDeals } = useStore()
  const categoryName = (id: string) => menuCategories.find((category) => category.id === id)?.name ?? ''
  const products = menuProducts.filter((product) =>
    fuzzyMatch(`${product.name} ${product.description} ${categoryName(product.categoryId)}`, search),
  )
  const deals = menuDeals.filter((deal) => fuzzyMatch(`${deal.name} ${deal.items.join(' ')}`, search))
  const total = products.length + deals.length
  return (
    <section className="section-anchor" aria-live="polite">
      <h2 className="font-display text-4xl">{total} result{total === 1 ? '' : 's'} for “{search.trim()}”</h2>
      {total === 0 ? <p className="mt-3 text-white/60">No products found. Try chicken, zinger, karahi, or BBQ.</p> : null}
      <div className="mt-4 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <div key={product.id}>
            <p className="mb-2 text-xs font-semibold tracking-wide text-brand">{categoryName(product.categoryId)}</p>
            <ProductCard product={product} onOpen={onOpen} />
          </div>
        ))}
      </div>
      {deals.length ? <p className="mt-6 text-sm text-white/70">{deals.length} matching deal{deals.length === 1 ? '' : 's'} in the deals section.</p> : null}
    </section>
  )
}
