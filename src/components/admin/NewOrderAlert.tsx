import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../../context/AppState'
import { pkr } from '../../utils/format'

export function NewOrderAlert() {
  const { alertOrders, dismissAlert, updateOrderStatus } = useStore()
  const played = useRef<Set<string>>(new Set())

  useEffect(() => {
    alertOrders.forEach((order) => {
      if (played.current.has(order.id)) return
      played.current.add(order.id)
      try {
        const audio = new AudioContext()
        const osc = audio.createOscillator()
        const gain = audio.createGain()
        osc.frequency.value = 740
        gain.gain.value = 0.04
        osc.connect(gain).connect(audio.destination)
        osc.start()
        osc.stop(audio.currentTime + 0.12)
        window.setTimeout(() => void audio.close(), 400)
      } catch {
        /* audio is optional */
      }
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification(`New order ${order.id}`, { body: `${pkr(order.total)} · ${order.items.length} items` })
      }
    })
  }, [alertOrders])

  if (!alertOrders.length) return null
  return (
    <div className="space-y-2">
      {alertOrders.map((order) => (
        <div key={order.id} className="flex flex-wrap items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-white">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold tracking-wide text-brand">NEW ORDER</p>
            <p className="font-semibold">{order.id} · {pkr(order.total)} · {order.items.reduce((sum, item) => sum + item.quantity, 0)} items · {order.orderType}</p>
          </div>
          <Link to={`/admin/orders/${order.id}`} className="rounded-full bg-white/10 px-3 py-2 text-sm" onClick={() => dismissAlert(order.id)}>View Order</Link>
          <button type="button" className="rounded-full bg-brand px-3 py-2 text-sm font-bold text-ink" onClick={() => { updateOrderStatus(order.id, 'accepted'); dismissAlert(order.id) }}>Accept</button>
          <button type="button" className="rounded-full bg-white/10 px-3 py-2 text-sm" onClick={() => dismissAlert(order.id)}>Dismiss</button>
        </div>
      ))}
    </div>
  )
}
