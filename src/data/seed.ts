import type { Order, OrderItem, OrderStatus, OrderType, Product } from '../types'
import { products } from './products'
import { deals } from './deals'

function at(dayOffset: number, hour: number) {
  const date = new Date()
  date.setDate(date.getDate() - dayOffset)
  date.setHours(hour, 10 + (dayOffset % 4) * 7, 0, 0)
  return date.toISOString()
}

function findProduct(categoryId: string, name: string) {
  const product = products.find((item) => item.categoryId === categoryId && item.name === name)
  if (!product) throw new Error(`Missing menu item: ${name}`)
  return product
}

function line(product: Product, quantity: number, variantName?: string): OrderItem {
  const variant = variantName ? product.variants?.find((item) => item.name === variantName) : undefined
  const unitPrice = variant?.price ?? product.price
  return {
    productId: product.id,
    productName: product.name,
    variant: variant?.name,
    quantity,
    unitPrice,
    addons: [],
    total: unitPrice * quantity,
  }
}

function dealLine(id: string, quantity = 1): OrderItem {
  const deal = deals.find((item) => item.id === id)
  if (!deal) throw new Error(id)
  return {
    productId: deal.id,
    productName: deal.name,
    quantity,
    unitPrice: deal.price,
    addons: [],
    total: deal.price * quantity,
  }
}

type Draft = {
  id: string
  customerName: string
  phone: string
  address: string
  area: string
  orderType: OrderType
  paymentMethod: 'cod' | 'pay_at_restaurant'
  items: OrderItem[]
  status: OrderStatus
  customerNotes?: string
  rejectionReason?: string
  createdAt: string
  deliveryFee?: number
}

function order(draft: Draft): Order {
  const subtotal = draft.items.reduce((sum, item) => sum + item.total, 0)
  const deliveryFee = draft.orderType === 'delivery' ? (draft.deliveryFee ?? 0) : 0
  return {
    id: draft.id,
    customerName: draft.customerName,
    phone: draft.phone,
    address: draft.address,
    area: draft.area,
    orderType: draft.orderType,
    paymentMethod: draft.paymentMethod,
    items: draft.items,
    subtotal,
    deliveryFee,
    discount: 0,
    total: subtotal + deliveryFee,
    status: draft.status,
    customerNotes: draft.customerNotes ?? '',
    rejectionReason: draft.rejectionReason,
    createdAt: draft.createdAt,
    updatedAt: draft.createdAt,
  }
}

/** Sample orders so the dashboard is usable before the first live order. Prices come from the menu. */
export function buildSeedOrders(): Order[] {
  const cheeseRoll = findProduct('chicken-rolls', 'Chicken Cheese Mayo Roll')
  const malai = findProduct('chicken-rolls', 'Chicken Malai Boti Roll')
  const zinger = findProduct('burgers', 'Zinger Burger')
  const zingerMeal = findProduct('burgers', 'Zinger Burger Meal')
  const karahi = findProduct('namkeen-karahi', 'Chicken Karahi')
  const naan = findProduct('side-dishes', 'Naan')
  const shawarma = findProduct('shawarma', 'Chicken Shawarma Cheese (Lrg)')
  const soda = findProduct('soda-water', 'Lemon Soda')
  const fries = findProduct('special-fries', 'Fries Large')
  const specialBurger = findProduct('burgers', 'Chill & Grill Special Burger')
  const sajji = findProduct('specialities', 'Sajji with Rice')
  const rice = findProduct('tour-of-china', 'Chicken Fried rice')
  const tikka = findProduct('real-bbq', 'Chicken Malai Boti Boneless (10 Pcs)')
  const chaat = findProduct('chaat', 'Papri Chaat')
  const shake = findProduct('ice-cream-shake', 'Mango')
  const tea = findProduct('coffee-tea', 'Special Matka Tea')
  const extreme = findProduct('zinger-rolls', 'Zinger Super Boom Boom Roll')
  const club = findProduct('sandwich', 'Club Sandwich')

  return [
    order({
      id: 'CG1042',
      customerName: 'Ali Khan',
      phone: '0300-1112233',
      address: 'Satellite Town, Rawalpindi',
      area: 'Rawalpindi',
      orderType: 'delivery',
      paymentMethod: 'cod',
      status: 'new',
      customerNotes: 'Please make the roll spicy.',
      createdAt: at(0, 13),
      items: [line(cheeseRoll, 2), line(fries, 1)],
    }),
    order({
      id: 'CG1041',
      customerName: 'Hira Ahmed',
      phone: '0321-5550199',
      address: 'Chill & Grill',
      area: 'Rawalpindi',
      orderType: 'pickup',
      paymentMethod: 'pay_at_restaurant',
      status: 'new',
      createdAt: at(0, 12),
      items: [line(zinger, 1), line(zingerMeal, 1)],
    }),
    order({
      id: 'CG1040',
      customerName: 'Usman Raza',
      phone: '0333-7001122',
      address: 'Range Road, Rawalpindi',
      area: 'Rawalpindi',
      orderType: 'delivery',
      paymentMethod: 'cod',
      status: 'preparing',
      customerNotes: 'Extra naan if possible.',
      createdAt: at(0, 11),
      items: [line(karahi, 1, 'Half Kg'), line(naan, 4)],
    }),
    order({
      id: 'CG1039',
      customerName: 'Sana Malik',
      phone: '0345-2223344',
      address: 'Bahria Town Phase 4',
      area: 'Rawalpindi',
      orderType: 'delivery',
      paymentMethod: 'cod',
      status: 'accepted',
      createdAt: at(0, 10),
      items: [dealLine('deal-4-person')],
    }),
    order({
      id: 'CG1038',
      customerName: 'Bilal Hussain',
      phone: '0301-8887766',
      address: 'Saddar, Rawalpindi',
      area: 'Rawalpindi',
      orderType: 'delivery',
      paymentMethod: 'cod',
      status: 'out_for_delivery',
      createdAt: at(0, 9),
      items: [line(shawarma, 2), line(soda, 2)],
    }),
    order({
      id: 'CG1037',
      customerName: 'Ayesha Noor',
      phone: '0312-4445566',
      address: 'Chaklala Scheme 3',
      area: 'Rawalpindi',
      orderType: 'delivery',
      paymentMethod: 'cod',
      status: 'completed',
      createdAt: at(1, 20),
      items: [line(specialBurger, 1), line(fries, 1), line(tea, 2)],
    }),
    order({
      id: 'CG1036',
      customerName: 'Hamza Iqbal',
      phone: '0308-1212121',
      address: 'Commercial Market',
      area: 'Rawalpindi',
      orderType: 'pickup',
      paymentMethod: 'pay_at_restaurant',
      status: 'completed',
      createdAt: at(1, 19),
      items: [line(extreme, 1), line(chaat, 1)],
    }),
    order({
      id: 'CG1035',
      customerName: 'Fatima Zahra',
      phone: '0331-9090909',
      address: 'Westridge',
      area: 'Rawalpindi',
      orderType: 'delivery',
      paymentMethod: 'cod',
      status: 'cancelled',
      rejectionReason: 'Item unavailable',
      createdAt: at(1, 18),
      items: [line(sajji, 1)],
    }),
    order({
      id: 'CG1034',
      customerName: 'Ali Khan',
      phone: '0300-1112233',
      address: 'Satellite Town, Rawalpindi',
      area: 'Rawalpindi',
      orderType: 'delivery',
      paymentMethod: 'cod',
      status: 'completed',
      createdAt: at(2, 21),
      items: [dealLine('deal-2-person'), line(shake, 2)],
    }),
    order({
      id: 'CG1033',
      customerName: 'Omar Farooq',
      phone: '0322-6161616',
      address: 'Peshawar Road',
      area: 'Rawalpindi',
      orderType: 'delivery',
      paymentMethod: 'cod',
      status: 'completed',
      createdAt: at(3, 14),
      items: [line(rice, 1), line(tikka, 1)],
    }),
    order({
      id: 'CG1032',
      customerName: 'Mariam Shah',
      phone: '0341-3030303',
      address: 'Chill & Grill',
      area: 'Rawalpindi',
      orderType: 'pickup',
      paymentMethod: 'pay_at_restaurant',
      status: 'completed',
      createdAt: at(4, 16),
      items: [line(club, 2), line(fries, 1)],
    }),
    order({
      id: 'CG1031',
      customerName: 'Hassan Javed',
      phone: '0305-4545454',
      address: 'Adiala Road',
      area: 'Rawalpindi',
      orderType: 'delivery',
      paymentMethod: 'cod',
      status: 'completed',
      createdAt: at(5, 20),
      items: [dealLine('deal-6-person')],
    }),
    order({
      id: 'CG1030',
      customerName: 'Hira Ahmed',
      phone: '0321-5550199',
      address: 'Bahria Town Phase 4',
      area: 'Rawalpindi',
      orderType: 'delivery',
      paymentMethod: 'cod',
      status: 'completed',
      createdAt: at(6, 13),
      items: [line(malai, 2), line(soda, 1)],
    }),
    order({
      id: 'CG1029',
      customerName: 'Zainab Ali',
      phone: '0315-7878787',
      address: 'Murree Road',
      area: 'Rawalpindi',
      orderType: 'delivery',
      paymentMethod: 'cod',
      status: 'completed',
      createdAt: at(8, 19),
      items: [line(karahi, 1, 'Full 1 Kg'), line(naan, 6)],
    }),
  ]
}
