import { useEffect, useMemo, useState } from 'react'
import { CategoryNavigation } from '../../components/customer/CategoryNavigation'
import { CategorySection } from '../../components/customer/CategorySection'
import { DealCard } from '../../components/customer/DealCard'
import { HeroSection } from '../../components/customer/HeroSection'
import { ProductModal } from '../../components/customer/ProductModal'
import { SearchResults } from '../../components/customer/SearchResults'
import { Skeleton } from '../../components/ui/Skeleton'
import { useStore } from '../../context/AppState'
import { usePageTitle } from '../../hooks/usePageTitle'
import type { Product } from '../../types'
import { phoneHref, whatsappHref } from '../../utils/format'

export function HomePage() {
  usePageTitle('Chill & Grill — Order Food Online')
  const { ready, menuCategories, menuProducts, menuDeals, search, settings, error, reload } = useStore()
  const [active, setActive] = useState('all')
  const [product, setProduct] = useState<Product | null>(null)
  const grouped = useMemo(() => {
    return menuCategories
      .map((category) => ({ category, products: menuProducts.filter((item) => item.categoryId === category.id) }))
      .filter((section) => section.products.length)
  }, [menuCategories, menuProducts])

  useEffect(() => {
    const nodes = document.querySelectorAll('[data-group]')
    if (!nodes.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        const group = visible?.target.getAttribute('data-group')
        if (group) setActive(group === 'platters' ? 'deals' : group)
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0.15, 0.4] },
    )
    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [ready, search, grouped.length])

  const select = (id: string) => {
    setActive(id)
    const target = id === 'all' ? 'menu' : id === 'deals' || id === 'platters' ? 'deals' : `group-${id}`
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <HeroSection />
      <CategoryNavigation active={active} onSelect={select} />
      <div id="menu" className="section-anchor mx-auto flex max-w-6xl flex-col gap-12 px-4 py-8">
        {!ready ? (
          <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-64" />)}
          </div>
        ) : null}
        {error ? (
          <div className="rounded-3xl bg-coal p-6">
            <p>{error}</p>
            <button type="button" className="mt-3 rounded-full bg-brand px-4 py-2 text-sm font-bold text-ink" onClick={reload}>Try Again</button>
          </div>
        ) : null}
        {ready && search.trim() ? <SearchResults onOpen={setProduct} /> : null}
        {ready && !search.trim() ? (
          <>
            <section id="deals" data-group="platters" className="section-anchor">
              <p className="text-xs font-semibold tracking-[0.18em] text-brand">B.B.Q PLATTERS</p>
              <h2 className="font-display text-5xl">Deals</h2>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {menuDeals.map((deal) => <DealCard key={deal.id} deal={deal} />)}
              </div>
            </section>
            {grouped.map(({ category, products }, index) => (
              <div key={category.id} id={index === grouped.findIndex((item) => item.category.group === category.group) ? `group-${category.group}` : undefined}>
                <CategorySection category={category} products={products} onOpen={setProduct} />
              </div>
            ))}
            <About settingsName={settings.name} address={settings.address} about={settings.about} phones={settings.phones} complaint={settings.complaintPhone} hoursListed={settings.hoursListed} hours={settings.hours} />
          </>
        ) : null}
      </div>
      <ProductModal product={product} onClose={() => setProduct(null)} />
    </>
  )
}

function About({
  settingsName,
  address,
  about,
  phones,
  complaint,
  hoursListed,
  hours,
}: {
  settingsName: string
  address: string
  about: string[]
  phones: { label: string; number: string; whatsapp?: boolean }[]
  complaint: string
  hoursListed: boolean
  hours: { day: string; open: string; close: string; closed: boolean }[]
}) {
  return (
    <>
      <section id="about" className="section-anchor grid gap-6 rounded-[2rem] bg-coal p-5 md:grid-cols-2 md:p-8">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-brand">THE RESTAURANT</p>
          <h2 className="font-display text-5xl">{settingsName}</h2>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            {about.map((line) => <li key={line}>{line}</li>)}
          </ul>
        </div>
        <img src="/brand-cover.png" alt="Chill & Grill menu cover" className="h-72 w-full rounded-3xl object-cover" />
      </section>
      <section id="contact" className="section-anchor rounded-[2rem] border border-white/10 p-5 md:p-8">
        <h2 className="font-display text-5xl">Contact</h2>
        <p className="mt-2 text-white/75">{address}</p>
        <ul className="mt-4 space-y-2 text-sm">
          {phones.map((phone) => (
            <li key={phone.number} className="flex flex-wrap gap-3">
              <a className="font-semibold text-brand" href={phoneHref(phone.number)}>{phone.label} {phone.number}</a>
              {phone.whatsapp ? <a className="text-white/60 underline" href={whatsappHref(phone.number)} target="_blank" rel="noreferrer">WhatsApp</a> : null}
            </li>
          ))}
          <li>Complaints: <a className="text-brand" href={phoneHref(complaint)}>{complaint}</a></li>
        </ul>
        <div className="mt-4 text-sm text-white/70">
          <p className="font-semibold text-white">Hours</p>
          {hoursListed ? (
            <ul className="mt-1">
              {hours.map((day) => (
                <li key={day.day}>{day.day}: {day.closed || !day.open ? 'Closed' : `${day.open} – ${day.close}`}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-1">Opening hours are not printed on the menu. Call the restaurant to confirm.</p>
          )}
        </div>
      </section>
    </>
  )
}
