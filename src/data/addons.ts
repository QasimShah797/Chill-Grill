import type { Addon } from '../types'

const rolls = ['chicken-rolls', 'beef-rolls', 'kabab-rolls', 'zinger-rolls']

/** Extra charges printed on the menu. Rs. 50 each. Not attached to every item. */
export const addons: Addon[] = [
  {
    id: 'extra-mayo',
    name: 'Extra Mayo',
    price: 50,
    applicableCategoryIds: rolls,
    available: true,
  },
  {
    id: 'mayo',
    name: 'Mayo',
    price: 50,
    applicableCategoryIds: ['burgers', 'shawarma', 'sandwich', 'special-fries'],
    available: true,
  },
  {
    id: 'spicy',
    name: 'Spicy',
    price: 50,
    applicableCategoryIds: ['burgers', 'shawarma', 'sandwich', ...rolls],
    available: true,
    skipIfNameIncludes: 'spicy',
  },
  {
    id: 'green-chatni',
    name: 'Green Chatni',
    price: 50,
    applicableCategoryIds: ['real-bbq', 'bbq-platters', 'chaat', ...rolls],
    available: true,
  },
  {
    id: 'slice-cheese',
    name: 'Slice Cheese',
    price: 50,
    applicableCategoryIds: ['burgers', 'shawarma', 'sandwich', ...rolls],
    available: true,
    skipIfNameIncludes: 'cheese',
  },
]
