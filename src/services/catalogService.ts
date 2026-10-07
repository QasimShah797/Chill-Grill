import type { Addon, CatalogOverrides, Category, Deal, Product } from '../types'
import { addons as baseAddons, categories as baseCategories, deals as baseDeals, products as baseProducts } from '../data/menu'

function apply<T extends { id: string }>(base: T[], patches: Record<string, Partial<T>>, custom: T[]): T[] {
  const merged = base.map((item) => ({ ...item, ...(patches[item.id] ?? {}) }))
  const ids = new Set(merged.map((item) => item.id))
  return [...merged, ...custom.filter((item) => !ids.has(item.id))]
}

export function mergeCatalog(overrides: CatalogOverrides) {
  const categories = apply(baseCategories, overrides.categories, overrides.customCategories).sort((a, b) => a.order - b.order)
  const products = apply(baseProducts, overrides.products, overrides.customProducts)
  const deals = apply(baseDeals, overrides.deals, overrides.customDeals)
  const addons = apply(baseAddons, overrides.addons, overrides.customAddons)
  return { categories, products, deals, addons }
}

export function customerCatalog(overrides: CatalogOverrides) {
  const catalog = mergeCatalog(overrides)
  const enabled = new Set(catalog.categories.filter((category) => category.enabled).map((category) => category.id))
  return {
    categories: catalog.categories.filter((category) => category.enabled),
    products: catalog.products.filter((product) => !product.archived && enabled.has(product.categoryId)),
    deals: catalog.deals.filter((deal) => !deal.archived && deal.available && enabled.has(deal.categoryId)),
    addons: catalog.addons.filter((addon) => !addon.archived && addon.available),
  }
}

export function addonsForProduct(product: Product, addons: Addon[]) {
  return addons.filter((addon) => {
    if (!addon.available || addon.archived) return false
    if (!addon.applicableCategoryIds.includes(product.categoryId)) return false
    if (addon.skipIfNameIncludes && product.name.toLowerCase().includes(addon.skipIfNameIncludes)) return false
    if (addon.id === 'spicy' && product.variants?.some((variant) => variant.name.toLowerCase() === 'spicy')) return false
    return true
  })
}

export function priceLabel(product: Pick<Product, 'price' | 'variants' | 'priceMissing'>) {
  if (product.priceMissing) return 'Price not listed'
  if (product.variants && product.variants.length > 1) {
    const prices = product.variants.map((variant) => variant.price)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    return min === max ? `Rs. ${min.toLocaleString('en-PK')}` : `From Rs. ${min.toLocaleString('en-PK')}`
  }
  return `Rs. ${Math.round(product.price).toLocaleString('en-PK')}`
}

export type { Category, Deal, Product }
