import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../../context/AppState'

const links = [
  { href: '/#home', label: 'Home' },
  { href: '/#menu', label: 'Menu' },
  { href: '/#deals', label: 'Deals' },
  { href: '/#about', label: 'About' },
  { href: '/#contact', label: 'Contact' },
]

export function Navbar({ onCart }: { onCart: () => void }) {
  const { cartCount, search, setSearch, settings, session } = useStore()
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname, location.hash])

  const submitSearch = (value: string) => {
    setSearch(value)
    if (location.pathname !== '/') navigate('/#menu')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <button type="button" className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 md:hidden" aria-label="Open menu" onClick={() => setOpen(true)}>
          <span className="block h-0.5 w-4 bg-white shadow-[0_6px_0_#fff,0_-6px_0_#fff]" />
        </button>
        <Link to="/#home" className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand font-display text-xl text-ink">CG</span>
          <span className="leading-none">
            <span className="block font-display text-2xl text-white">{settings.name}</span>
            <span className="block text-[10px] font-semibold tracking-[0.18em] text-brand">{settings.tagline.toUpperCase()}</span>
          </span>
        </Link>
        <nav className="ml-6 hidden items-center gap-5 md:flex" aria-label="Primary">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="text-sm font-medium text-white/80 hover:text-brand">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <label className="hidden items-center rounded-full bg-white/10 px-3 lg:flex">
            <span className="sr-only">Search menu</span>
            <input
              value={search}
              onChange={(event) => submitSearch(event.target.value)}
              placeholder="Search rolls, BBQ, karahi…"
              className="h-10 w-52 bg-transparent text-sm outline-none placeholder:text-white/40"
            />
          </label>
          <button type="button" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 lg:hidden" aria-label="Search" onClick={() => setSearchOpen((value) => !value)}>
            ⌕
          </button>
          <Link to={session ? '/account' : '/login'} className="rounded-full border border-white/15 px-3 py-2 text-xs font-semibold text-white/80 hover:text-brand">
            {session ? session.name.split(' ')[0] : 'Log in'}
          </Link>
          <button type="button" className="relative grid h-10 w-10 place-items-center rounded-full bg-brand text-ink" aria-label={`Open cart, ${cartCount} items`} onClick={onCart}>
            <CartIcon />
            {cartCount > 0 ? <span className="badge-pop absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-ember px-1 text-[11px] font-bold text-white">{cartCount}</span> : null}
          </button>
          <Link to="/admin" className="hidden rounded-full border border-white/15 px-3 py-2 text-xs font-semibold text-white/80 hover:text-brand sm:inline">
            Admin
          </Link>
        </div>
      </div>
      {searchOpen ? (
        <div className="px-4 pb-3 lg:hidden">
          <input
            autoFocus
            value={search}
            onChange={(event) => submitSearch(event.target.value)}
            placeholder="Search the menu"
            className="h-11 w-full rounded-full bg-white/10 px-4 text-sm outline-none"
          />
        </div>
      ) : null}
      {open ? (
        <div className="fixed inset-0 z-50 bg-black/70 md:hidden" onClick={() => setOpen(false)}>
          <nav className="h-full w-[min(84vw,320px)] bg-ink p-5" onClick={(event) => event.stopPropagation()} aria-label="Mobile">
            <div className="mb-6 flex items-center justify-between">
              <p className="font-display text-3xl">Menu</p>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="h-10 w-10 rounded-full bg-white/10">✕</button>
            </div>
            <div className="flex flex-col gap-2">
              {links.map((link) => (
                <a key={link.href} href={link.href} className="rounded-2xl px-3 py-3 text-lg hover:bg-white/5">
                  {link.label}
                </a>
              ))}
              <Link to={session ? '/account' : '/login'} className="rounded-2xl px-3 py-3 text-lg">{session ? 'Account' : 'Log in'}</Link>
              <Link to="/admin" className="rounded-2xl px-3 py-3 text-lg text-brand">Admin</Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  )
}

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6h15l-1.5 9h-12L5 3H2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="20" r="1.4" fill="currentColor" />
      <circle cx="18" cy="20" r="1.4" fill="currentColor" />
    </svg>
  )
}
