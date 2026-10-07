export type Role = 'ADMIN' | 'STAFF' | 'SALESMAN' | 'CUSTOMER'

export type MenuGroup =
  | 'rolls'
  | 'burgers'
  | 'shawarma'
  | 'sandwiches'
  | 'chinese'
  | 'karahi'
  | 'bbq'
  | 'platters'
  | 'specials'
  | 'chaat'
  | 'desserts'
  | 'drinks'
  | 'sides'

export type Variant = {
  id: string
  name: string
  price: number
}

export type Category = {
  id: string
  name: string
  description: string
  group: MenuGroup
  order: number
  enabled: boolean
}

export type Product = {
  id: string
  name: string
  categoryId: string
  price: number
  variants?: Variant[]
  description: string
  imageKey: string
  image?: string
  gallery?: string[]
  available: boolean
  featured: boolean
  popular: boolean
  archived?: boolean
  /** Printed on the menu without a price. */
  priceMissing?: boolean
}

export type Deal = {
  id: string
  name: string
  items: string[]
  price: number
  imageKey: string
  image?: string
  available: boolean
  badge?: 'Popular' | 'Best Value'
  archived?: boolean
  categoryId: string
}

export type Addon = {
  id: string
  name: string
  price: number
  applicableCategoryIds: string[]
  available: boolean
  archived?: boolean
  /** Hide when the product name already includes this word. */
  skipIfNameIncludes?: string
}

export type OrderStatus =
  | 'new'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled'

export type OrderType = 'delivery' | 'pickup'
export type PaymentMethod = 'cod' | 'pay_at_restaurant'

export type SelectedAddon = {
  id: string
  name: string
  price: number
}

export type OrderItem = {
  productId: string
  productName: string
  variant?: string
  quantity: number
  unitPrice: number
  addons: SelectedAddon[]
  notes?: string
  total: number
  image?: string
}

export type Order = {
  id: string
  customerName: string
  phone: string
  address: string
  area: string
  orderType: OrderType
  paymentMethod: PaymentMethod
  items: OrderItem[]
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
  status: OrderStatus
  customerNotes: string
  rejectionReason?: string
  createdAt: string
  updatedAt: string
  userId?: string
}

export type CartLine = {
  lineId: string
  productId: string
  name: string
  variant?: string
  quantity: number
  unitPrice: number
  addons: SelectedAddon[]
  notes?: string
  image?: string
  kind: 'product' | 'deal'
}

export type DayHours = {
  day: string
  open: string
  close: string
  closed: boolean
}

export type RestaurantSettings = {
  name: string
  tagline: string
  address: string
  phones: { label: string; number: string; whatsapp?: boolean }[]
  complaintPhone: string
  deliveryFee: number
  minimumOrder: number
  deliveryAreas: string[]
  acceptOrders: boolean
  autoAccept: boolean
  prepMinutes: number
  /** False when the printed menu does not list hours. */
  hoursListed: boolean
  hours: DayHours[]
  about: string[]
}

export type AuthUser = {
  id: string
  name: string
  email: string
  role: Role
}

export type CatalogOverrides = {
  products: Record<string, Partial<Product>>
  categories: Record<string, Partial<Category>>
  deals: Record<string, Partial<Deal>>
  addons: Record<string, Partial<Addon>>
  customProducts: Product[]
  customCategories: Category[]
  customDeals: Deal[]
  customAddons: Addon[]
}

export type PersistedState = {
  version: 1
  orders: Order[]
  cart: CartLine[]
  overrides: CatalogOverrides
  settings: RestaurantSettings
  seeded: boolean
}

export type ToastMessage = {
  id: string
  text: string
  tone?: 'ok' | 'err'
}

export type ProductInput = {
  name: string
  categoryId: string
  description: string
  price: number
  image?: string
  gallery?: string[]
  available: boolean
  featured: boolean
  popular: boolean
  variants: Variant[]
  imageKey?: string
}
