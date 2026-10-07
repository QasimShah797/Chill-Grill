import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { CartDrawer } from '../components/customer/CartDrawer'
import { Footer } from '../components/customer/Footer'
import { MobileCartBar } from '../components/customer/MobileCartBar'
import { Navbar } from '../components/customer/Navbar'
import { Toasts } from '../components/ui/Toasts'
import { useStore } from '../context/AppState'

export function CustomerLayout() {
  const [cartOpen, setCartOpen] = useState(false)
  const { cartCount } = useStore()
  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white">
      <Navbar onCart={() => setCartOpen(true)} />
      <main className={cartCount ? 'pb-24 md:pb-0' : ''}>
        <Outlet />
      </main>
      <Footer />
      <MobileCartBar onOpen={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <Toasts />
    </div>
  )
}
