import type { Category, Product } from '../../types'
import { ProductCard } from './ProductCard'

export function CategorySection({ category, products, onOpen }: { category: Category; products: Product[]; onOpen: (product: Product) => void }) {
  if (!products.length) return null
  return (
    <section id={`cat-${category.id}`} data-group={category.group} className="section-anchor scroll-mt-36">
      <h2 className="font-display text-4xl text-white sm:text-5xl">{category.name}</h2>
      {category.description ? <p className="mt-1 max-w-xl text-sm text-white/55">{category.description}</p> : null}
      <div className="mt-4 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onOpen={onOpen} />
        ))}
      </div>
    </section>
  )
}
