import { addons as baseAddons, categories as baseCategories, deals as baseDeals, products as baseProducts } from '../data/menu'
import { defaultSettings } from '../data/restaurant'
import type { Addon, CatalogOverrides, Category, Deal, Order, PersistedState, Product, RestaurantSettings } from '../types'
import { emptyOverrides } from './storage'
import { isSupabaseConfigured, requireSupabase } from './supabaseClient'

type Row = Record<string, unknown>

function fail(error: { message: string; code?: string } | null, fallback: string): asserts error is null {
  if (!error) return
  if (error.code === '42P01' || /does not exist|schema cache/i.test(error.message)) {
    throw new Error('Supabase is connected, but the tables are missing. Run supabase/schema.sql in the SQL editor.')
  }
  throw new Error(fallback)
}

function num(value: unknown) {
  return Number(value ?? 0)
}

function productFromRow(row: Row): Product {
  const variants = Array.isArray(row.variants) ? (row.variants as Product['variants']) : undefined
  return {
    id: String(row.id),
    name: String(row.name),
    categoryId: String(row.category_id),
    price: num(row.price),
    variants: variants?.length ? variants : undefined,
    description: String(row.description ?? ''),
    imageKey: String(row.image_key ?? ''),
    image: row.image ? String(row.image) : undefined,
    gallery: Array.isArray(row.gallery) ? (row.gallery as string[]) : [],
    available: Boolean(row.available),
    featured: Boolean(row.featured),
    popular: Boolean(row.popular),
    archived: Boolean(row.archived),
    priceMissing: Boolean(row.price_missing),
  }
}

function productToRow(product: Product) {
  return {
    id: product.id,
    name: product.name,
    category_id: product.categoryId,
    price: product.price,
    description: product.description ?? '',
    image_key: product.imageKey ?? '',
    image: product.image || null,
    gallery: product.gallery ?? [],
    available: product.available,
    featured: product.featured,
    popular: product.popular,
    archived: Boolean(product.archived),
    price_missing: Boolean(product.priceMissing),
    variants: product.variants ?? null,
  }
}

function categoryFromRow(row: Row): Category {
  return {
    id: String(row.id),
    name: String(row.name),
    description: String(row.description ?? ''),
    group: row.group as Category['group'],
    order: num(row.sort_order),
    enabled: Boolean(row.enabled),
  }
}

function categoryToRow(category: Category) {
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    group: category.group,
    sort_order: category.order,
    enabled: category.enabled,
  }
}

function dealFromRow(row: Row): Deal {
  return {
    id: String(row.id),
    name: String(row.name),
    items: (row.items as string[]) ?? [],
    price: num(row.price),
    imageKey: String(row.image_key ?? 'platter'),
    image: row.image ? String(row.image) : undefined,
    available: Boolean(row.available),
    badge: (row.badge as Deal['badge']) || undefined,
    archived: Boolean(row.archived),
    categoryId: String(row.category_id),
  }
}

function dealToRow(deal: Deal) {
  return {
    id: deal.id,
    name: deal.name,
    items: deal.items,
    price: deal.price,
    image_key: deal.imageKey,
    image: deal.image || null,
    available: deal.available,
    badge: deal.badge ?? null,
    archived: Boolean(deal.archived),
    category_id: deal.categoryId,
  }
}

function addonFromRow(row: Row): Addon {
  return {
    id: String(row.id),
    name: String(row.name),
    price: num(row.price),
    applicableCategoryIds: (row.applicable_category_ids as string[]) ?? [],
    available: Boolean(row.available),
    archived: Boolean(row.archived),
    skipIfNameIncludes: row.skip_if_name_includes ? String(row.skip_if_name_includes) : undefined,
  }
}

function addonToRow(addon: Addon) {
  return {
    id: addon.id,
    name: addon.name,
    price: addon.price,
    applicable_category_ids: addon.applicableCategoryIds,
    available: addon.available,
    archived: Boolean(addon.archived),
    skip_if_name_includes: addon.skipIfNameIncludes ?? null,
  }
}

function orderFromRow(row: Row): Order {
  return {
    id: String(row.id),
    customerName: String(row.customer_name),
    phone: String(row.phone),
    address: String(row.address ?? ''),
    area: String(row.area ?? ''),
    orderType: row.order_type as Order['orderType'],
    paymentMethod: row.payment_method as Order['paymentMethod'],
    items: (row.items as Order['items']) ?? [],
    subtotal: num(row.subtotal),
    deliveryFee: num(row.delivery_fee),
    discount: num(row.discount),
    total: num(row.total),
    status: row.status as Order['status'],
    customerNotes: String(row.customer_notes ?? ''),
    rejectionReason: row.rejection_reason ? String(row.rejection_reason) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    userId: row.user_id ? String(row.user_id) : undefined,
  }
}

function orderToRow(order: Order) {
  return {
    id: order.id,
    customer_name: order.customerName,
    phone: order.phone,
    address: order.address,
    area: order.area,
    order_type: order.orderType,
    payment_method: order.paymentMethod,
    items: order.items,
    subtotal: order.subtotal,
    delivery_fee: order.deliveryFee,
    discount: order.discount,
    total: order.total,
    status: order.status,
    customer_notes: order.customerNotes,
    rejection_reason: order.rejectionReason ?? null,
    created_at: order.createdAt,
    updated_at: order.updatedAt,
    user_id: order.userId ?? null,
  }
}

function asOverrides(categories: Category[], products: Product[], deals: Deal[], addons: Addon[]): CatalogOverrides {
  const categoryIds = new Set(baseCategories.map((item) => item.id))
  const productIds = new Set(baseProducts.map((item) => item.id))
  const dealIds = new Set(baseDeals.map((item) => item.id))
  const addonIds = new Set(baseAddons.map((item) => item.id))
  const overrides = emptyOverrides()
  categories.forEach((item) => {
    if (categoryIds.has(item.id)) overrides.categories[item.id] = item
    else overrides.customCategories.push(item)
  })
  products.forEach((item) => {
    if (productIds.has(item.id)) overrides.products[item.id] = item
    else overrides.customProducts.push(item)
  })
  deals.forEach((item) => {
    if (dealIds.has(item.id)) overrides.deals[item.id] = item
    else overrides.customDeals.push(item)
  })
  addons.forEach((item) => {
    if (addonIds.has(item.id)) overrides.addons[item.id] = item
    else overrides.customAddons.push(item)
  })
  return overrides
}

export async function fetchOrders(): Promise<Order[]> {
  const client = requireSupabase()
  const { data, error } = await client.from('orders').select('*').order('created_at', { ascending: false }).limit(500)
  fail(error, 'Unable to load orders.')
  return (data ?? []).map((row) => orderFromRow(row as Row))
}

export async function loadRemote(includeOrders: boolean): Promise<PersistedState> {
  const client = requireSupabase()
  const [categoriesRes, productsRes, dealsRes, addonsRes, settingsRes] = await Promise.all([
    client.from('categories').select('*').order('sort_order'),
    client.from('products').select('*'),
    client.from('deals').select('*'),
    client.from('addons').select('*'),
    client.from('restaurant_settings').select('data').eq('id', 1).maybeSingle(),
  ])
  fail(categoriesRes.error, 'Unable to load the menu.')
  fail(productsRes.error, 'Unable to load the menu.')
  fail(dealsRes.error, 'Unable to load deals.')
  fail(addonsRes.error, 'Unable to load add-ons.')
  fail(settingsRes.error, 'Unable to load restaurant settings.')

  const categories = (categoriesRes.data ?? []).map((row) => categoryFromRow(row as Row))
  const settings = (settingsRes.data?.data as RestaurantSettings | undefined) ?? structuredClone(defaultSettings)
  const orders = includeOrders ? await fetchOrders() : []

  if (!categories.length) {
    return {
      version: 1,
      orders,
      cart: [],
      overrides: emptyOverrides(),
      settings,
      seeded: false,
    }
  }

  return {
    version: 1,
    orders,
    cart: [],
    overrides: asOverrides(
      categories,
      (productsRes.data ?? []).map((row) => productFromRow(row as Row)),
      (dealsRes.data ?? []).map((row) => dealFromRow(row as Row)),
      (addonsRes.data ?? []).map((row) => addonFromRow(row as Row)),
    ),
    settings,
    seeded: true,
  }
}

export async function ensureMenu() {
  if (!isSupabaseConfigured()) return
  const client = requireSupabase()
  const { count, error } = await client.from('categories').select('id', { count: 'exact', head: true })
  fail(error, 'Unable to check the menu.')
  if (count && count > 0) return
  const categoryResult = await client.from('categories').upsert(baseCategories.map(categoryToRow))
  fail(categoryResult.error, 'The printed menu could not be published.')
  const productResult = await client.from('products').upsert(baseProducts.map(productToRow))
  fail(productResult.error, 'The printed menu could not be published.')
  const dealResult = await client.from('deals').upsert(baseDeals.map(dealToRow))
  fail(dealResult.error, 'Deals could not be published.')
  const addonResult = await client.from('addons').upsert(baseAddons.map(addonToRow))
  fail(addonResult.error, 'Add-ons could not be published.')
  const settingsResult = await client.from('restaurant_settings').upsert({ id: 1, data: defaultSettings })
  fail(settingsResult.error, 'Restaurant settings could not be published.')
}

export async function nextOrderCode() {
  const client = requireSupabase()
  const { data, error } = await client.rpc('next_order_code')
  fail(error, 'Unable to create an order number.')
  return String(data)
}

export async function insertOrder(order: Order) {
  const client = requireSupabase()
  const { error } = await client.from('orders').insert(orderToRow(order))
  fail(error, 'Unable to place the order.')
}

export async function updateOrder(order: Order) {
  const client = requireSupabase()
  const { error } = await client.from('orders').update({
    status: order.status,
    rejection_reason: order.rejectionReason ?? null,
    updated_at: order.updatedAt,
  }).eq('id', order.id)
  fail(error, 'Unable to update order status.')
}

export async function setRemoteAvailability(id: string, available: boolean) {
  const client = requireSupabase()
  const { error } = await client.from('products').update({ available }).eq('id', id)
  fail(error, 'Availability could not be saved.')
}

export async function upsertProduct(product: Product) {
  const client = requireSupabase()
  const { error } = await client.from('products').upsert(productToRow(product))
  fail(error, 'Product could not be saved.')
}

export async function upsertCategory(category: Category) {
  const client = requireSupabase()
  const { error } = await client.from('categories').upsert(categoryToRow(category))
  fail(error, 'Category could not be saved.')
}

export async function upsertDeal(deal: Deal) {
  const client = requireSupabase()
  const { error } = await client.from('deals').upsert(dealToRow(deal))
  fail(error, 'Deal could not be saved.')
}

export async function upsertAddon(addon: Addon) {
  const client = requireSupabase()
  const { error } = await client.from('addons').upsert(addonToRow(addon))
  fail(error, 'Add-on could not be saved.')
}

export async function saveSettings(settings: RestaurantSettings) {
  const client = requireSupabase()
  const { error } = await client.from('restaurant_settings').upsert({ id: 1, data: settings })
  fail(error, 'Settings could not be saved.')
}
