import type { Order } from '../types'

export type CustomerRecord = {
  id: string
  name: string
  phone: string
  orders: number
  spent: number
  lastOrder: string
  status: 'Active' | 'Inactive'
  history: Order[]
}

export function customersFromOrders(orders: Order[]): CustomerRecord[] {
  const map = new Map<string, CustomerRecord>()
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000
  ;[...orders]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .forEach((order) => {
      const key = order.phone.replace(/\D/g, '') || order.phone
      const existing = map.get(key)
      if (!existing) {
        map.set(key, {
          id: key,
          name: order.customerName,
          phone: order.phone,
          orders: order.status === 'cancelled' ? 0 : 1,
          spent: order.status === 'cancelled' ? 0 : order.total,
          lastOrder: order.createdAt,
          status: new Date(order.createdAt).getTime() >= cutoff ? 'Active' : 'Inactive',
          history: [order],
        })
        return
      }
      existing.history.push(order)
      if (order.status !== 'cancelled') {
        existing.orders += 1
        existing.spent += order.total
      }
      if (new Date(order.createdAt) > new Date(existing.lastOrder)) {
        existing.lastOrder = order.createdAt
        existing.name = order.customerName
      }
      existing.status = existing.history.some((item) => new Date(item.createdAt).getTime() >= cutoff) ? 'Active' : 'Inactive'
    })
  return [...map.values()]
}
