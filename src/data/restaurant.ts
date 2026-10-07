import type { RestaurantSettings } from '../types'

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

/** Facts taken from the printed menu. Hours and delivery fee are not printed. */
export const defaultSettings: RestaurantSettings = {
  name: 'Chill & Grill',
  tagline: 'The Perfect Combo',
  address: 'Range Road, Adjacent Farid Family Hospital, Rawalpindi.',
  phones: [
    { label: 'Phone', number: '051-8777801' },
    { label: 'WhatsApp', number: '0311-5786018', whatsapp: true },
    { label: 'WhatsApp', number: '0345-9594285', whatsapp: true },
    { label: 'Mobile', number: '0333-1133275' },
  ],
  complaintPhone: '0345-9594285',
  deliveryFee: 0,
  minimumOrder: 0,
  deliveryAreas: ['Rawalpindi'],
  acceptOrders: true,
  autoAccept: false,
  prepMinutes: 35,
  hoursListed: false,
  hours: days.map((day) => ({ day, open: '', close: '', closed: false })),
  about: [
    'We are B.B.Q caterers for outdoor barbeque events, large or small.',
    'From a party in your garden to weddings, schools, and colleges.',
    'Caterers you can trust for your special occasion.',
    'Call for home delivery.',
  ],
}
