import { productImages } from '../../data/productImages'
import { useStore } from '../../context/AppState'

export function HeroSection() {
  const { settings } = useStore()
  return (
    <section id="home" className="section-anchor mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 md:grid-cols-[1.05fr_0.95fr] md:py-16">
      <div>
        <p className="text-xs font-semibold tracking-[0.22em] text-brand">RAWALPINDI · HOME DELIVERY</p>
        <h1 className="mt-3 font-display text-6xl leading-[0.9] text-white sm:text-7xl md:text-8xl">
          THE PERFECT
          <span className="block text-brand">COMBO.</span>
        </h1>
        <p className="mt-4 max-w-md text-base text-white/70 sm:text-lg">
          Paratha rolls, real BBQ, namkeen karahi, and cold drinks from {settings.name}. Order for delivery or pick it up on Range Road.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="#menu" className="rounded-full bg-brand px-6 py-3 text-sm font-bold text-ink">Order Now</a>
          <a href="#menu" className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white">View Menu</a>
        </div>
      </div>
      <div className="relative">
        <img src={productImages.hero} alt="Grilled barbecue from Chill & Grill" className="h-[320px] w-full rounded-[2rem] object-cover object-[center_62%] ring-1 ring-brand/40 sm:h-[420px]" />
        <div className="absolute bottom-4 left-4 rounded-2xl bg-ink/85 px-4 py-3 backdrop-blur">
          <p className="font-display text-2xl text-brand">Call for home delivery</p>
          <p className="text-sm text-white/80">{settings.phones[0]?.number}</p>
        </div>
      </div>
    </section>
  )
}
