import type { CatalogOverrides, Order, PersistedState, RestaurantSettings } from '../types'
import { defaultSettings } from '../data/restaurant'

const KEY = 'cg.v1'

export const emptyOverrides = (): CatalogOverrides => ({
  products: {},
  categories: {},
  deals: {},
  addons: {},
  customProducts: [],
  customCategories: [],
  customDeals: [],
  customAddons: [],
})

export function blankState(orders: Order[] = []): PersistedState {
  return {
    version: 1,
    orders,
    cart: [],
    overrides: emptyOverrides(),
    settings: structuredClone(defaultSettings),
    seeded: orders.length > 0,
  }
}

export function loadState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedState
    if (parsed.version !== 1) return null
    return {
      ...blankState(),
      ...parsed,
      settings: { ...structuredClone(defaultSettings), ...parsed.settings },
      overrides: { ...emptyOverrides(), ...parsed.overrides },
    }
  } catch {
    return null
  }
}

export function saveState(state: PersistedState) {
  localStorage.setItem(KEY, JSON.stringify(state))
  window.dispatchEvent(new CustomEvent('cg-state'))
}

const MY_ORDERS = 'cg.my-orders'

export function loadMyOrders(): Order[] {
  try {
    const raw = localStorage.getItem(MY_ORDERS)
    return raw ? (JSON.parse(raw) as Order[]) : []
  } catch {
    return []
  }
}

export function rememberMyOrder(order: Order) {
  const orders = [order, ...loadMyOrders().filter((item) => item.id !== order.id)].slice(0, 30)
  localStorage.setItem(MY_ORDERS, JSON.stringify(orders))
}

export function saveCart(cart: PersistedState['cart']) {
  const current = loadState() ?? blankState()
  saveState({ ...current, cart })
}

export function mergeSettings(current: RestaurantSettings, patch: Partial<RestaurantSettings>): RestaurantSettings {
  return { ...current, ...patch }
}
