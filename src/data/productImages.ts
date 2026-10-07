/**
 * Category-appropriate photos. Replace any URL in this map later.
 * A product only receives the key assigned to its category or an explicit override.
 */
const q = 'auto=format&fit=crop&w=900&q=70'

export const productImages: Record<string, string> = {
  roll: `https://images.unsplash.com/photo-1626700051175-6818013e1d4f?${q}`,
  beefRoll: `https://images.unsplash.com/photo-1529006557810-274b9b2fc783?${q}`,
  kababRoll: `https://images.unsplash.com/photo-1603360946369-dc9bb6258143?${q}`,
  burger: `https://images.unsplash.com/photo-1568901346375-23c9450c58cd?${q}`,
  chickenBurger: `https://images.unsplash.com/photo-1606755962773-d324e0a13086?${q}`,
  beefBurger: `https://images.unsplash.com/photo-1550547660-d9450f859349?${q}`,
  shawarma: `https://images.unsplash.com/photo-1529006557810-274b9b2fc783?${q}`,
  sandwich: `https://images.unsplash.com/photo-1528735602780-2552fd46c7af?${q}`,
  friedRice: `https://images.unsplash.com/photo-1603133872878-684f208fb84b?${q}`,
  noodles: `https://images.unsplash.com/photo-1552611052-33e04de08148?${q}`,
  chilliChicken: `https://images.unsplash.com/photo-1525755662778-989d0524087e?${q}`,
  karahi: `https://images.unsplash.com/photo-1585937421612-70a008356fbe?${q}`,
  daal: `https://images.unsplash.com/photo-1546833999-b9f581a1996d?${q}`,
  bbq: `https://images.unsplash.com/photo-1555939594-58d7cb561ad1?${q}`,
  tikka: `https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?${q}`,
  platter: `https://images.unsplash.com/photo-1544025162-d76694265947?${q}`,
  sajji: `https://images.unsplash.com/photo-1598103442097-8b74394b95c6?${q}`,
  pulao: `https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?${q}`,
  kabab: `https://images.unsplash.com/photo-1603360946369-dc9bb6258143?${q}`,
  chaat: `https://images.unsplash.com/photo-1601050690597-df0568f70950?${q}`,
  icecream: `https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?${q}`,
  shake: `https://images.unsplash.com/photo-1572490122747-3968b75cc699?${q}`,
  juice: `https://images.unsplash.com/photo-1600271886742-f049cd451bba?${q}`,
  smoothie: `https://images.unsplash.com/photo-1505252585461-04db1eb84625?${q}`,
  cocktail: `https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?${q}`,
  soda: `https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?${q}`,
  coldDrink: `https://images.unsplash.com/photo-1629203851122-3726ecdf080e?${q}`,
  water: `https://images.unsplash.com/photo-1548839140-29a749e1cf4d?${q}`,
  fries: `https://images.unsplash.com/photo-1573080496219-bb080dd4f877?${q}`,
  soup: `https://images.unsplash.com/photo-1547592166-23ac45744acd?${q}`,
  friedChicken: `https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?${q}`,
  paratha: `https://images.unsplash.com/photo-1631452180519-c014fe946bc7?${q}`,
  bread: `https://images.unsplash.com/photo-1606491956689-2ea866880c84?${q}`,
  coffee: `https://images.unsplash.com/photo-1509042239860-f550ce710b93?${q}`,
  tea: `https://images.unsplash.com/photo-1571934811356-5cc061b6821f?${q}`,
  hero: `https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1600&q=75`,
  fallbackFood: `https://images.unsplash.com/photo-1504674900247-0877df9cc836?${q}`,
}

const categoryKey: Record<string, string> = {
  'chicken-rolls': 'roll',
  'beef-rolls': 'beefRoll',
  'kabab-rolls': 'kababRoll',
  'zinger-rolls': 'roll',
  burgers: 'burger',
  shawarma: 'shawarma',
  sandwich: 'sandwich',
  'tour-of-china': 'friedRice',
  'namkeen-karahi': 'karahi',
  'real-bbq': 'bbq',
  'bbq-platters': 'platter',
  specialities: 'sajji',
  chaat: 'chaat',
  'ice-cream': 'icecream',
  'ice-cream-shake': 'shake',
  'fresh-juice': 'juice',
  'fresh-shakes': 'shake',
  smoothies: 'smoothie',
  cocktail: 'cocktail',
  'soda-water': 'soda',
  'flavour-soda': 'soda',
  'cold-drinks': 'coldDrink',
  'special-fries': 'fries',
  soup: 'soup',
  'side-dishes': 'paratha',
  'coffee-tea': 'tea',
}

export function resolveImage(input: {
  image?: string
  imageKey?: string
  categoryId?: string
}): string {
  if (input.image) return input.image
  if (input.imageKey && productImages[input.imageKey]) return productImages[input.imageKey]
  if (input.categoryId && categoryKey[input.categoryId]) {
    return productImages[categoryKey[input.categoryId]]
  }
  return productImages.fallbackFood
}
