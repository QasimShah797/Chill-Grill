import type { Order, OrderStatus } from '../types'
import { nextStatuses } from '../utils/orderStatus'
import { uid } from '../utils/format'

export function nextOrderId(orders: Order[]) {
  const numbers = orders.map((order) => Number(order.id.replace(/\D/g, ''))).filter((value) => !Number.isNaN(value))
  const next = Math.max(1042, ...numbers) + 1
  return `CG${next}`
}

export function withStatus(order: Order, status: OrderStatus, reason?: string): Order {
  if (!nextStatuses(order.status, order.orderType).includes(status)) {
    throw new Error('That status change is not allowed.')
  }
  if (status === 'cancelled' && !(reason && reason.trim())) {
    throw new Error('A reason is required.')
  }
  return {
    ...order,
    status,
    updatedAt: new Date().toISOString(),
    rejectionReason: status === 'cancelled' ? reason?.trim() : order.rejectionReason,
  }
}

export function filterOrders(
  orders: Order[],
  query: {
    search?: string
    status?: OrderStatus | 'all'
    orderType?: Order['orderType'] | 'all'
    sort?: 'newest' | 'oldest' | 'highest' | 'lowest'
    from?: string
    to?: string
  },
) {
  const search = (query.search ?? '').trim().toLowerCase()
  let list = orders.filter((order) => {
    if (query.status && query.status !== 'all' && order.status !== query.status) return false
    if (query.orderType && query.orderType !== 'all' && order.orderType !== query.orderType) return false
    if (query.from && new Date(order.createdAt) < new Date(query.from)) return false
    if (query.to) {
      const end = new Date(query.to)
      end.setHours(23, 59, 59, 999)
      if (new Date(order.createdAt) > end) return false
    }
    if (!search) return true
    const blob = `${order.id} ${order.customerName} ${order.phone}`.toLowerCase()
    return blob.includes(search)
  })
  const sort = query.sort ?? 'newest'
  list = [...list].sort((a, b) => {
    if (sort === 'oldest') return +new Date(a.createdAt) - +new Date(b.createdAt)
    if (sort === 'highest') return b.total - a.total
    if (sort === 'lowest') return a.total - b.total
    return +new Date(b.createdAt) - +new Date(a.createdAt)
  })
  return list
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const total = items.length
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const safe = Math.min(Math.max(1, page), pages)
  const start = (safe - 1) * pageSize
  return { items: items.slice(start, start + pageSize), page: safe, pages, total }
}

export function makeLineId() {
  return uid('line')
}
