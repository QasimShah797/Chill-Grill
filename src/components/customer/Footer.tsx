import { useStore } from '../../context/AppState'
import { phoneHref } from '../../utils/format'

export function Footer() {
  const { settings } = useStore()
  return (
    <footer className="mt-16 border-t border-white/10 bg-black">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="font-display text-4xl text-brand">{settings.name}</p>
          <p className="text-sm tracking-[0.16em] text-white/60">{settings.tagline.toUpperCase()}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-white/50">Visit</p>
          <p className="mt-2 text-sm">{settings.address}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-white/50">Contact</p>
          <ul className="mt-2 space-y-1 text-sm">
            {settings.phones.map((phone) => (
              <li key={phone.number}>
                <a className="hover:text-brand" href={phoneHref(phone.number)}>{phone.label}: {phone.number}</a>
              </li>
            ))}
            <li>Complaints: {settings.complaintPhone}</li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
