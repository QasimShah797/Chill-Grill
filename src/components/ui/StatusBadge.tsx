import type { OrderStatus } from '../../types'
import { statusLabel, statusTone } from '../../utils/orderStatus'

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusTone[status]}`}>{statusLabel[status]}</span>
}
