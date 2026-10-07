import type { Order } from '../types'
import { startOfDay } from '../utils/format'

export type RangeKey = 'today' | 'yesterday' | '7d' | '30d' | 'custom'

export function rangeBounds(key: RangeKey, custom?: { from: string; to: string }) {
  const now = new Date()
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)
  if (key === 'custom' && custom?.from && custom?.to) {
    const from = new Date(custom.from)
    const to = new Date(custom.to)
    to.setHours(23, 59, 59, 999)
    return { from, to }
  }
  if (key === 'yesterday') {
    const from = startOfDay(now)
    from.setDate(from.getDate() - 1)
    const to = new Date(from)
    to.setHours(23, 59, 59, 999)
    return { from, to }
  }
  const from = startOfDay(now)
  if (key === '7d') from.setDate(from.getDate() - 6)
  if (key === '30d') from.setDate(from.getDate() - 29)
  return { from, to: end }
}

export function inRange(order: Order, from: Date, to: Date) {
  const time = new Date(order.createdAt).getTime()
  return time >= from.getTime() && time <= to.getTime()
}

export function salesSummary(orders: Order[], from: Date, to: Date) {
  const scoped = orders.filter((order) => inRange(order, from, to))
  const active = scoped.filter((order) => order.status !== 'cancelled')
  const completed = scoped.filter((order) => order.status === 'completed')
  const cancelled = scoped.filter((order) => order.status === 'cancelled')
  const sales = active.reduce((sum, order) => sum + order.total, 0)
  return {
    sales,
    orders: active.length,
    average: active.length ? Math.round(sales / active.length) : 0,
    completed: completed.length,
    cancelled: cancelled.length,
    pending: scoped.filter((order) => !['completed', 'cancelled'].includes(order.status)).length,
  }
}

export function series(orders: Order[], from: Date, to: Date) {
  const days: { label: string; key: string; sales: number; orders: number }[] = []
  const cursor = startOfDay(from)
  const end = startOfDay(to)
  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10)
    const label = cursor.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })
    const dayOrders = orders.filter((order) => order.status !== 'cancelled' && order.createdAt.slice(0, 10) === key)
    days.push({
      key,
      label,
      sales: dayOrders.reduce((sum, order) => sum + order.total, 0),
      orders: dayOrders.length,
    })
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

export function topProducts(orders: Order[], from: Date, to: Date, limit = 5) {
  const counts = new Map<string, { name: string; qty: number; sales: number }>()
  orders
    .filter((order) => order.status !== 'cancelled' && inRange(order, from, to))
    .forEach((order) => {
      order.items.forEach((item) => {
        const current = counts.get(item.productName) ?? { name: item.productName, qty: 0, sales: 0 }
        current.qty += item.quantity
        current.sales += item.total
        counts.set(item.productName, current)
      })
    })
  return [...counts.values()].sort((a, b) => b.qty - a.qty).slice(0, limit)
}

export function toCsv(rows: string[][]) {
  return rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')
}
