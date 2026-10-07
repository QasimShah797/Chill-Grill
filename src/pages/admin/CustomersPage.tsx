import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../../components/ui/EmptyState'
import { useStore } from '../../context/AppState'
import { useDebounced } from '../../hooks/useDebounced'
import { usePageTitle } from '../../hooks/usePageTitle'
import { customersFromOrders } from '../../services/customerService'
import { formatDate, fuzzyMatch, pkr } from '../../utils/format'

export function CustomersPage() {
  usePageTitle('Customers — Chill & Grill')
  const { orders } = useStore()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'orders' | 'spent' | 'recent'>('recent')
  const query = useDebounced(search)
  const customers = useMemo(() => {
    const list = customersFromOrders(orders).filter((customer) => fuzzyMatch(`${customer.name} ${customer.phone}`, query))
    return [...list].sort((a, b) => {
      if (sort === 'orders') return b.orders - a.orders
      if (sort === 'spent') return b.spent - a.spent
      return +new Date(b.lastOrder) - +new Date(a.lastOrder)
    })
  }, [orders, query, sort])

  return (
    <div>
      <h1 className="font-display text-5xl">Customers</h1>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or phone" className="h-11 rounded-2xl bg-white px-3" />
        <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} className="h-11 rounded-2xl bg-white px-3">
          <option value="recent">Recent order</option>
          <option value="orders">Orders</option>
          <option value="spent">Total spending</option>
        </select>
      </div>
      <div className="mt-4 space-y-3">
        {customers.map((customer) => (
          <Link key={customer.id} to={`/admin/customers/${customer.id}`} className="block rounded-3xl bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold">{customer.name}</p>
              <span className="text-xs font-semibold">{customer.status}</span>
            </div>
            <p className="text-sm text-stone-500">{customer.phone}</p>
            <p className="mt-1 text-sm">{customer.orders} orders · {pkr(customer.spent)} · Last {formatDate(customer.lastOrder)}</p>
          </Link>
        ))}
        {!customers.length ? <EmptyState title="No customers yet" /> : null}
      </div>
    </div>
  )
}
