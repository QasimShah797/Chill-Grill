import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type {
  Addon,
  AuthUser,
  CartLine,
  Category,
  Deal,
  Order,
  OrderStatus,
  PersistedState,
  Product,
  ProductInput,
  RestaurantSettings,
  SelectedAddon,
  ToastMessage,
} from '../types'
import { buildSeedOrders } from '../data/seed'
import { customerCatalog, mergeCatalog } from '../services/catalogService'
import { nextOrderId, withStatus } from '../services/orderService'
import { blankState, loadMyOrders, loadState, rememberMyOrder, saveCart, saveState } from '../services/storage'
import { currentUser, login as authLogin, loginWithGoogle as authGoogle, logout as authLogout, registerCustomer, restoreSession, signInCustomer } from '../services/authService'
import { isSupabaseConfigured, requireSupabase } from '../services/supabaseClient'
import { ensureMenu, fetchOrders, insertOrder, loadRemote, nextOrderCode, saveSettings, setRemoteAvailability, updateOrder, upsertAddon, upsertCategory, upsertDeal, upsertProduct } from '../services/supabaseStore'
import { lineKey, uid } from '../utils/format'
import { resolveImage } from '../data/productImages'

type Store = {
  ready: boolean
  error: string
  clearError: () => void
  reload: () => void
  products: Product[]
  categories: Category[]
  deals: Deal[]
  addons: Addon[]
  menuProducts: Product[]
  menuCategories: Category[]
  menuDeals: Deal[]
  menuAddons: Addon[]
  orders: Order[]
  cart: CartLine[]
  settings: RestaurantSettings
  session: AuthUser | null
  search: string
  setSearch: (value: string) => void
  toasts: ToastMessage[]
  pushToast: (text: string, tone?: 'ok' | 'err') => void
  dismissToast: (id: string) => void
  login: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<boolean>
  loginWithGoogle: () => Promise<void>
  logout: () => void
  addToCart: (line: Omit<CartLine, 'lineId' | 'quantity'> & { quantity?: number }) => void
  setQty: (lineId: string, quantity: number) => void
  removeLine: (lineId: string) => void
  clearCart: () => void
  cartCount: number
  cartSubtotal: number
  placeOrder: (input: {
    customerName: string
    phone: string
    address: string
    area: string
    orderType: 'delivery' | 'pickup'
    paymentMethod: 'cod' | 'pay_at_restaurant'
    customerNotes: string
  }) => Promise<Order>
  placeCounterOrder: (input: {
    customerName: string
    phone: string
    notes: string
    lines: { productId: string; name: string; variant?: string; quantity: number; unitPrice: number; addons: SelectedAddon[]; notes?: string; image?: string }[]
  }) => Promise<Order>
  updateOrderStatus: (id: string, status: OrderStatus, reason?: string) => void
  saveProduct: (input: ProductInput, id?: string) => void
  duplicateProduct: (id: string) => void
  setProductAvailable: (id: string, available: boolean) => void
  archiveProduct: (id: string) => void
  saveCategory: (category: Category) => void
  saveDeal: (deal: Deal, id?: string) => void
  archiveDeal: (id: string) => void
  saveAddon: (addon: Addon) => void
  archiveAddon: (id: string) => void
  updateSettings: (patch: Partial<RestaurantSettings>) => void
  alertOrders: Order[]
  dismissAlert: (id: string) => void
}

const Ctx = createContext<Store | null>(null)

function patchRecord<T>(record: Record<string, Partial<T>>, id: string, patch: Partial<T>) {
  return { ...record, [id]: { ...(record[id] ?? {}), ...patch } }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState | null>(null)
  const [session, setSession] = useState<AuthUser | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [seenAlerts, setSeenAlerts] = useState<string[]>([])
  const [alertsPrimed, setAlertsPrimed] = useState(false)

  const boot = async () => {
    try {
      if (isSupabaseConfigured()) {
        const user = await restoreSession()
        setSession(user)
        const staff = Boolean(user && user.role !== 'CUSTOMER')
        const remote = await loadRemote(staff)
        const local = loadState()
        const orders = staff ? remote.orders : user ? await fetchOrders().catch(() => loadMyOrders()) : loadMyOrders()
        setState({
          ...remote,
          cart: local?.cart ?? [],
          orders,
        })
      } else {
        const loaded = loadState()
        if (loaded) setState(loaded)
        else {
          const seeded = blankState(buildSeedOrders())
          saveState(seeded)
          setState(seeded)
        }
        setSession(currentUser())
      }
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load restaurant data.')
    } finally {
      setReady(true)
    }
  }

  useEffect(() => {
    void boot()
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'cg.v1' && !isSupabaseConfigured()) void boot()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured() || !session) return
    const client = requireSupabase()
    const channel = client
      .channel('orders-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        void fetchOrders()
          .then((orders) => setState((current) => (current ? { ...current, orders } : current)))
          .catch(() => undefined)
      })
      .subscribe()
    return () => {
      void client.removeChannel(channel)
    }
  }, [session])

  useEffect(() => {
    if (!state || alertsPrimed) return
    setSeenAlerts(state.orders.filter((order) => order.status === 'new').map((order) => order.id))
    setAlertsPrimed(true)
  }, [state, alertsPrimed])

  const commit = (recipe: (current: PersistedState) => PersistedState) => {
    setState((current) => {
      if (!current) return current
      const next = recipe(current)
      try {
        if (isSupabaseConfigured()) saveCart(next.cart)
        else saveState(next)
        setError('')
      } catch {
        setError('Unable to save changes. Browser storage may be full.')
      }
      return next
    })
  }

  const pushToast = (text: string, tone: 'ok' | 'err' = 'ok') => {
    const id = uid('toast')
    setToasts((list) => [...list, { id, text, tone }])
    window.setTimeout(() => setToasts((list) => list.filter((item) => item.id !== id)), 2800)
  }

  const publish = (work: () => Promise<void>, seed = false) => {
    if (!isSupabaseConfigured()) return
    void (async () => {
      try {
        if (seed) await ensureMenu()
        await work()
      } catch (err) {
        pushToast(err instanceof Error ? err.message : 'Unable to save changes.', 'err')
      }
    })()
  }

  const catalog = useMemo(() => (state ? mergeCatalog(state.overrides) : { products: [], categories: [], deals: [], addons: [] }), [state])
  const menu = useMemo(() => (state ? customerCatalog(state.overrides) : { products: [], categories: [], deals: [], addons: [] }), [state])

  const cart = state?.cart ?? []
  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0)
  const cartSubtotal = cart.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)

  const value: Store = {
    ready,
    error,
    clearError: () => setError(''),
    reload: () => {
      void boot()
    },
    products: catalog.products,
    categories: catalog.categories,
    deals: catalog.deals,
    addons: catalog.addons,
    menuProducts: menu.products,
    menuCategories: menu.categories,
    menuDeals: menu.deals,
    menuAddons: menu.addons,
    orders: state?.orders ?? [],
    cart,
    settings: state?.settings ?? blankState().settings,
    session,
    search,
    setSearch,
    toasts,
    pushToast,
    dismissToast: (id) => setToasts((list) => list.filter((item) => item.id !== id)),
    login: async (email, password) => {
      const user = await authLogin(email, password)
      setSession(user)
      if (isSupabaseConfigured()) {
        const remote = await loadRemote(true)
        setState((current) => ({ ...remote, cart: current?.cart ?? [], orders: remote.orders }))
      }
    },
    signIn: async (email, password) => {
      const user = await signInCustomer(email, password)
      setSession(user)
      if (isSupabaseConfigured()) {
        const orders = await fetchOrders().catch(() => loadMyOrders())
        setState((current) => (current ? { ...current, orders } : current))
      }
    },
    register: async (name, email, password) => {
      const result = await registerCustomer(name, email, password)
      if (result.user) setSession(result.user)
      return result.confirm
    },
    loginWithGoogle: () => authGoogle(),
    logout: () => {
      void authLogout()
      setSession(null)
      if (isSupabaseConfigured()) {
        setState((current) => (current ? { ...current, orders: loadMyOrders() } : current))
      }
    },
    addToCart: (line) => {
      commit((current) => {
        const quantity = line.quantity ?? 1
        const key = lineKey({ productId: line.productId, variant: line.variant, addons: line.addons, notes: line.notes })
        const existing = current.cart.find(
          (item) => lineKey({ productId: item.productId, variant: item.variant, addons: item.addons, notes: item.notes }) === key,
        )
        const cartNext = existing
          ? current.cart.map((item) => (item.lineId === existing.lineId ? { ...item, quantity: item.quantity + quantity } : item))
          : [...current.cart, { ...line, quantity, lineId: uid('line') }]
        return { ...current, cart: cartNext }
      })
      pushToast(`${line.name} added to cart`)
    },
    setQty: (lineId, quantity) => {
      commit((current) => ({
        ...current,
        cart: quantity <= 0 ? current.cart.filter((line) => line.lineId !== lineId) : current.cart.map((line) => (line.lineId === lineId ? { ...line, quantity } : line)),
      }))
    },
    removeLine: (lineId) => commit((current) => ({ ...current, cart: current.cart.filter((line) => line.lineId !== lineId) })),
    clearCart: () => commit((current) => ({ ...current, cart: [] })),
    cartCount,
    cartSubtotal,
    placeOrder: async (input) => {
      if (!state) throw new Error('Unable to place the order.')
      if (!state.settings.acceptOrders) throw new Error('The restaurant is not accepting orders right now.')
      if (state.cart.length === 0) throw new Error('Your cart is empty.')
      const subtotal = state.cart.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)
      if (input.orderType === 'delivery' && state.settings.minimumOrder > 0 && subtotal < state.settings.minimumOrder) {
        throw new Error(`Minimum order is Rs. ${state.settings.minimumOrder}.`)
      }
      const deliveryFee = input.orderType === 'delivery' ? state.settings.deliveryFee : 0
      const order: Order = {
        id: isSupabaseConfigured() ? await nextOrderCode() : nextOrderId(state.orders),
        customerName: input.customerName.trim(),
        phone: input.phone.trim(),
        address: input.orderType === 'pickup' ? state.settings.address : input.address.trim(),
        area: input.area.trim(),
        orderType: input.orderType,
        paymentMethod: input.paymentMethod,
        items: state.cart.map((line) => ({
          productId: line.productId,
          productName: line.name,
          variant: line.variant,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          addons: line.addons,
          notes: line.notes,
          total: line.unitPrice * line.quantity,
          image: line.image,
        })),
        subtotal,
        deliveryFee,
        discount: 0,
        total: subtotal + deliveryFee,
        status: state.settings.autoAccept ? 'accepted' : 'new',
        customerNotes: input.customerNotes.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: session?.id,
      }
      if (isSupabaseConfigured()) {
        await insertOrder(order)
        rememberMyOrder(order)
      }
      commit((current) => ({ ...current, orders: [order, ...current.orders.filter((item) => item.id !== order.id)], cart: [] }))
      return order
    },
    placeCounterOrder: async (input) => {
      if (!state) throw new Error('Unable to place the order.')
      if (input.lines.length === 0) throw new Error('Add at least one item.')
      const subtotal = input.lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)
      const order: Order = {
        id: isSupabaseConfigured() ? await nextOrderCode() : nextOrderId(state.orders),
        customerName: input.customerName.trim() || 'Walk-in',
        phone: input.phone.trim(),
        address: state.settings.address,
        area: 'Counter',
        orderType: 'pickup',
        paymentMethod: 'pay_at_restaurant',
        items: input.lines.map((line) => ({
          productId: line.productId,
          productName: line.name,
          variant: line.variant,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          addons: line.addons,
          notes: line.notes,
          total: line.unitPrice * line.quantity,
          image: line.image,
        })),
        subtotal,
        deliveryFee: 0,
        discount: 0,
        total: subtotal,
        status: 'accepted',
        customerNotes: input.notes.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: session?.id,
      }
      if (isSupabaseConfigured()) await insertOrder(order)
      commit((current) => ({ ...current, orders: [order, ...current.orders.filter((item) => item.id !== order.id)] }))
      return order
    },
    updateOrderStatus: async (id, status, reason) => {
      const order = state?.orders.find((item) => item.id === id)
      if (!order) {
        pushToast('Unable to update order status.', 'err')
        return
      }
      try {
        const next = withStatus(order, status, reason)
        if (isSupabaseConfigured()) await updateOrder(next)
        commit((current) => ({ ...current, orders: current.orders.map((item) => (item.id === id ? next : item)) }))
        pushToast(status === 'cancelled' ? 'Order cancelled' : 'Order updated')
      } catch (err) {
        pushToast(err instanceof Error ? err.message : 'Unable to update order status.', 'err')
      }
    },
    saveProduct: (input, id) => {
      commit((current) => {
        const existing = id ? mergeCatalog(current.overrides).products.find((product) => product.id === id) : undefined
        const isCustom = existing ? current.overrides.customProducts.some((product) => product.id === id) : false
        const nextProduct: Product = {
          id: id ?? uid('product'),
          name: input.name.trim(),
          categoryId: input.categoryId,
          description: input.description.trim(),
          price: input.variants.length ? Math.min(...input.variants.map((variant) => variant.price)) : input.price,
          variants: input.variants.length ? input.variants : undefined,
          imageKey: input.imageKey || existing?.imageKey || '',
          image: input.image || existing?.image,
          gallery: input.gallery ?? existing?.gallery ?? [],
          available: input.available,
          featured: input.featured,
          popular: input.popular,
          archived: existing?.archived,
        }
        publish(() => upsertProduct(nextProduct), true)
        if (!id || isCustom) {
          const customProducts = id
            ? current.overrides.customProducts.map((product) => (product.id === id ? nextProduct : product))
            : [...current.overrides.customProducts, nextProduct]
          return { ...current, overrides: { ...current.overrides, customProducts } }
        }
        return {
          ...current,
          overrides: {
            ...current.overrides,
            products: patchRecord(current.overrides.products, id, nextProduct),
          },
        }
      })
    },
    duplicateProduct: (id) => {
      const source = catalog.products.find((product) => product.id === id)
      if (!source) return
      const copy: Product = { ...source, id: uid('product'), name: `${source.name} Copy`, archived: false }
      publish(() => upsertProduct(copy), true)
      commit((current) => ({
        ...current,
        overrides: { ...current.overrides, customProducts: [...current.overrides.customProducts, copy] },
      }))
    },
    setProductAvailable: (id, available) => {
      const product = catalog.products.find((item) => item.id === id)
      if (product) publish(() => setRemoteAvailability(id, available))
      commit((current) => {
        if (current.overrides.customProducts.some((product) => product.id === id)) {
          return {
            ...current,
            overrides: {
              ...current.overrides,
              customProducts: current.overrides.customProducts.map((product) => (product.id === id ? { ...product, available } : product)),
            },
          }
        }
        return { ...current, overrides: { ...current.overrides, products: patchRecord(current.overrides.products, id, { available }) } }
      })
    },
    archiveProduct: (id) => {
      const product = catalog.products.find((item) => item.id === id)
      if (product) publish(() => upsertProduct({ ...product, archived: true, available: false }), true)
      commit((current) => {
        if (current.overrides.customProducts.some((product) => product.id === id)) {
          return {
            ...current,
            overrides: {
              ...current.overrides,
              customProducts: current.overrides.customProducts.map((product) => (product.id === id ? { ...product, archived: true, available: false } : product)),
            },
          }
        }
        return {
          ...current,
          overrides: { ...current.overrides, products: patchRecord(current.overrides.products, id, { archived: true, available: false }) },
        }
      })
    },
    saveCategory: (category) => {
      publish(() => upsertCategory(category), true)
      commit((current) => {
        const custom = current.overrides.customCategories.some((item) => item.id === category.id)
        if (custom) {
          return {
            ...current,
            overrides: {
              ...current.overrides,
              customCategories: current.overrides.customCategories.map((item) => (item.id === category.id ? category : item)),
            },
          }
        }
        const known = mergeCatalog(current.overrides).categories.some((item) => item.id === category.id)
        if (!known) {
          return { ...current, overrides: { ...current.overrides, customCategories: [...current.overrides.customCategories, category] } }
        }
        return { ...current, overrides: { ...current.overrides, categories: patchRecord(current.overrides.categories, category.id, category) } }
      })
    },
    saveDeal: (deal, id) => {
      publish(() => upsertDeal(deal), true)
      commit((current) => {
        const dealId = id ?? deal.id
        const custom = current.overrides.customDeals.some((item) => item.id === dealId)
        if (!id) {
          return { ...current, overrides: { ...current.overrides, customDeals: [...current.overrides.customDeals, deal] } }
        }
        if (custom) {
          return {
            ...current,
            overrides: { ...current.overrides, customDeals: current.overrides.customDeals.map((item) => (item.id === dealId ? deal : item)) },
          }
        }
        return { ...current, overrides: { ...current.overrides, deals: patchRecord(current.overrides.deals, dealId, deal) } }
      })
    },
    archiveDeal: (id) => {
      const deal = catalog.deals.find((item) => item.id === id)
      if (deal) publish(() => upsertDeal({ ...deal, archived: true, available: false }), true)
      commit((current) => {
        if (current.overrides.customDeals.some((deal) => deal.id === id)) {
          return {
            ...current,
            overrides: {
              ...current.overrides,
              customDeals: current.overrides.customDeals.map((deal) => (deal.id === id ? { ...deal, archived: true, available: false } : deal)),
            },
          }
        }
        return { ...current, overrides: { ...current.overrides, deals: patchRecord(current.overrides.deals, id, { archived: true, available: false }) } }
      })
    },
    saveAddon: (addon) => {
      publish(() => upsertAddon(addon), true)
      commit((current) => {
        const custom = current.overrides.customAddons.some((item) => item.id === addon.id)
        if (custom) {
          return {
            ...current,
            overrides: { ...current.overrides, customAddons: current.overrides.customAddons.map((item) => (item.id === addon.id ? addon : item)) },
          }
        }
        const known = mergeCatalog(current.overrides).addons.some((item) => item.id === addon.id)
        if (!known) {
          return { ...current, overrides: { ...current.overrides, customAddons: [...current.overrides.customAddons, addon] } }
        }
        return { ...current, overrides: { ...current.overrides, addons: patchRecord(current.overrides.addons, addon.id, addon) } }
      })
    },
    archiveAddon: (id) => {
      const addon = catalog.addons.find((item) => item.id === id)
      if (addon) publish(() => upsertAddon({ ...addon, archived: true, available: false }), true)
      commit((current) => {
        if (current.overrides.customAddons.some((addon) => addon.id === id)) {
          return {
            ...current,
            overrides: {
              ...current.overrides,
              customAddons: current.overrides.customAddons.map((addon) => (addon.id === id ? { ...addon, archived: true, available: false } : addon)),
            },
          }
        }
        return { ...current, overrides: { ...current.overrides, addons: patchRecord(current.overrides.addons, id, { archived: true, available: false }) } }
      })
    },
    updateSettings: (patch) => {
      if (state) publish(() => saveSettings({ ...state.settings, ...patch }))
      commit((current) => ({ ...current, settings: { ...current.settings, ...patch } }))
    },
    alertOrders: (state?.orders ?? []).filter((order) => order.status === 'new' && !seenAlerts.includes(order.id)).slice(0, 3),
    dismissAlert: (id) => setSeenAlerts((list) => [...list, id]),
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('Store missing')
  return ctx
}

export function unitWithAddons(price: number, addons: SelectedAddon[]) {
  return price + addons.reduce((sum, addon) => sum + addon.price, 0)
}

export function productImage(product: { image?: string; imageKey?: string; categoryId?: string }) {
  return resolveImage(product)
}
