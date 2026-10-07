import type { OrderStatus, OrderType } from '../types'

export const statusLabel: Record<OrderStatus, string> = {
  new: 'New',
  accepted: 'Accepted',
  preparing: 'Preparing',
  ready: 'Ready',
  out_for_delivery: 'Out for Delivery',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const statusTone: Record<OrderStatus, string> = {
  new: 'bg-amber-100 text-amber-900 ring-amber-200',
  accepted: 'bg-sky-100 text-sky-900 ring-sky-200',
  preparing: 'bg-orange-100 text-orange-900 ring-orange-200',
  ready: 'bg-violet-100 text-violet-900 ring-violet-200',
  out_for_delivery: 'bg-indigo-100 text-indigo-900 ring-indigo-200',
  completed: 'bg-emerald-100 text-emerald-900 ring-emerald-200',
  cancelled: 'bg-stone-200 text-stone-700 ring-stone-300',
}

const cancelFrom: OrderStatus[] = ['new', 'accepted', 'preparing', 'ready']

export function nextStatuses(status: OrderStatus, orderType: OrderType): OrderStatus[] {
  if (status === 'new') return ['accepted', 'cancelled']
  if (status === 'accepted') return ['preparing', 'cancelled']
  if (status === 'preparing') return ['ready', 'cancelled']
  if (status === 'ready') {
    return orderType === 'pickup' ? ['completed', 'cancelled'] : ['out_for_delivery', 'cancelled']
  }
  if (status === 'out_for_delivery') return ['completed']
  return []
}

export function canCancel(status: OrderStatus) {
  return cancelFrom.includes(status)
}

export const rejectionReasons = [
  'Restaurant too busy',
  'Item unavailable',
  'Delivery unavailable',
  'Customer request',
  'Other',
]

export function actionLabel(status: OrderStatus, orderType: OrderType) {
  if (status === 'new') return 'Accept Order'
  if (status === 'accepted') return 'Start Preparing'
  if (status === 'preparing') return 'Mark Ready'
  if (status === 'ready') return orderType === 'pickup' ? 'Complete Order' : 'Out for Delivery'
  if (status === 'out_for_delivery') return 'Complete Order'
  return ''
}

export function primaryNext(status: OrderStatus, orderType: OrderType): OrderStatus | null {
  const next = nextStatuses(status, orderType).find((item) => item !== 'cancelled')
  return next ?? null
}
