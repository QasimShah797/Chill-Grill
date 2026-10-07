import type { Product, Variant } from '../types'

type Spec = {
  name: string
  price?: number
  variants?: [string, number][]
  description?: string
  imageKey?: string
  featured?: boolean
  popular?: boolean
  available?: boolean
  priceMissing?: boolean
}

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function build(categoryId: string, rows: Spec[]): Product[] {
  return rows.map((row) => {
    const variants: Variant[] | undefined = row.variants?.map(([name, price]) => ({
      id: slug(name),
      name,
      price,
    }))
    const price = variants?.length
      ? Math.min(...variants.map((variant) => variant.price))
      : (row.price ?? 0)
    return {
      id: `${categoryId}--${slug(row.name)}`,
      name: row.name,
      categoryId,
      price,
      variants,
      description: row.description ?? '',
      imageKey: row.imageKey ?? '',
      available: row.available ?? true,
      featured: row.featured ?? false,
      popular: row.popular ?? false,
      priceMissing: row.priceMissing,
    }
  })
}

const extreme = (prefix: string): Spec[] => [
  { name: 'Chill & Grill Extreme Roll Paratha', price: 1000, popular: true, imageKey: prefix },
  { name: 'Chill & Grill Extreme Roll Paratha with Cheese', price: 1200, featured: true, imageKey: prefix },
]

export const products: Product[] = [
  ...build('chicken-rolls', [
    { name: 'Chicken Mayo Roll Paratha', price: 300 },
    { name: 'Chicken Cheese Mayo Roll', price: 350 },
    { name: 'Chicken Malai Boti Roll', price: 300, popular: true },
    { name: 'Chicken Malai Boti Cheese Roll', price: 350 },
    { name: 'Chicken Jumbo Roll', price: 450 },
    { name: 'Chicken Jumbo Cheese Roll', price: 500 },
    { name: 'Boom Boom Roll', price: 550 },
    { name: 'Boom Boom Roll with Cheese', price: 600 },
    { name: 'Boom Boom Malai Boti Roll', price: 550 },
    { name: 'Super Boom Boom Roll', price: 800 },
    { name: 'Super Boom Boom Roll with Cheese', price: 900 },
    ...extreme('roll'),
  ]),
  ...build('beef-rolls', [
    { name: 'Beef Roll', price: 350, imageKey: 'beefRoll' },
    { name: 'Beef Cheese Roll', price: 400, imageKey: 'beefRoll' },
    { name: 'Beef Jumbo Roll', price: 500, imageKey: 'beefRoll' },
    { name: 'Beef Cheese Jumbo Roll', price: 550, imageKey: 'beefRoll' },
    { name: 'Beef Boom Boom Roll', price: 600, imageKey: 'beefRoll' },
    { name: 'Beef Boom Boom Cheese Roll', price: 650, imageKey: 'beefRoll' },
    { name: 'Beef Super Boom Boom Roll', price: 900, imageKey: 'beefRoll' },
    { name: 'Beef Super Boom Boom Roll Cheese', price: 1000, imageKey: 'beefRoll' },
    ...extreme('beefRoll'),
  ]),
  ...build('kabab-rolls', [
    { name: 'Kabab Roll', price: 300, imageKey: 'kababRoll' },
    { name: 'Kabab Cheese Roll', price: 350, imageKey: 'kababRoll' },
    { name: 'Kabab Jumbo Roll', price: 450, imageKey: 'kababRoll' },
    { name: 'Kabab Cheese Jumbo Roll', price: 500, imageKey: 'kababRoll' },
    { name: 'Kabab Boom Boom Roll', price: 550, imageKey: 'kababRoll' },
    { name: 'Kabab Boom Boom Cheese Roll', price: 600, imageKey: 'kababRoll' },
    { name: 'Kabab Super Boom Boom Roll', price: 800, imageKey: 'kababRoll' },
    { name: 'Kabab Super Boom Boom Roll Cheese', price: 900, imageKey: 'kababRoll', featured: true },
    ...extreme('kababRoll'),
  ]),
  ...build('zinger-rolls', [
    {
      name: 'Zinger Roll (Normal/Spicy)',
      variants: [
        ['Normal', 300],
        ['Spicy', 300],
      ],
      description: 'Printed as Normal/Spicy at one price.',
      popular: true,
    },
    { name: 'Zinger Jumbo Roll', price: 450 },
    { name: 'Zinger Boom Boom Roll', price: 550 },
    { name: 'Zinger Super Boom Boom Roll', price: 800, featured: true },
    ...extreme('roll'),
  ]),
  ...build('burgers', [
    { name: 'Chicken Burger', price: 350, imageKey: 'chickenBurger' },
    { name: 'Chicken Burger Cheese', price: 400, imageKey: 'chickenBurger' },
    { name: 'Chicken Burger Spicy', price: 350, imageKey: 'chickenBurger' },
    { name: 'Chicken Burger Spicy with Cheese', price: 400, imageKey: 'chickenBurger' },
    { name: 'Chicken Supreme Burger', price: 500, imageKey: 'chickenBurger' },
    { name: 'Chicken Supreme Burger with Cheese', price: 600, imageKey: 'chickenBurger' },
    { name: 'Beef Burger', price: 400, imageKey: 'beefBurger' },
    { name: 'Beef Burger Cheese', price: 450, imageKey: 'beefBurger' },
    { name: 'Beef Burger Spicy', price: 400, imageKey: 'beefBurger' },
    { name: 'Beef Burger Spicy with Cheese', price: 450, imageKey: 'beefBurger' },
    { name: 'Beef Supreme Burger', price: 700, imageKey: 'beefBurger' },
    { name: 'Beef Supreme Burger with Cheese', price: 800, imageKey: 'beefBurger' },
    { name: 'Zinger Burger', price: 400, imageKey: 'chickenBurger', popular: true },
    { name: 'Zinger Burger Meal', price: 500, imageKey: 'chickenBurger', featured: true },
    { name: 'Zinger Extereme', price: 600, imageKey: 'chickenBurger' },
    { name: 'Chill & Grill Special Burger', price: 800, imageKey: 'burger', popular: true },
  ]),
  ...build('shawarma', [
    { name: 'Chicken Shawarma (Sml)', price: 200 },
    { name: 'Chicken Shawarma Cheese (Sml)', price: 250 },
    { name: 'Chicken Shawarma (Lrg)', price: 250, popular: true },
    { name: 'Chicken Shawarma Cheese (Lrg)', price: 300 },
    { name: 'Chicken Shawarma (Platter)', price: 600, featured: true },
  ]),
  ...build('sandwich', [
    { name: 'Chicken Sandwich', price: 450 },
    { name: 'Club Sandwich', price: 500 },
    { name: 'Bar BQ Sandwich', price: 500 },
    { name: 'Chill & Grill Sandwich (Special)', price: 600, featured: true },
  ]),
  ...build('tour-of-china', [
    { name: 'Chicken Fried rice', price: 550, imageKey: 'friedRice' },
    { name: 'Egg Fried Rice', price: 450, imageKey: 'friedRice' },
    { name: 'Vegetable fried Rice', price: 400, imageKey: 'friedRice' },
    { name: 'Masala Rice', price: 700, imageKey: 'friedRice' },
    { name: 'Chill & Grill Fried Rice (Special)', price: 800, imageKey: 'friedRice', featured: true },
    { name: 'Chicken Chowmin', price: 600, imageKey: 'noodles' },
    { name: 'Chicken Manchurian', price: 700, imageKey: 'chilliChicken' },
    { name: 'Chicken Chili Dry', price: 800, imageKey: 'chilliChicken' },
    { name: 'Chicken Shashlik with Rice', price: 700, imageKey: 'friedRice' },
    { name: 'Chicken Sesame Chilli with Rice', price: 1000, imageKey: 'chilliChicken', featured: true },
  ]),
  ...build('namkeen-karahi', [
    { name: 'Chicken Karahi', variants: [['Full 1 Kg', 1800], ['Half Kg', 1000]], popular: true },
    { name: 'Chicken Karahi White', variants: [['Full 1 Kg', 2000], ['Half Kg', 1150]] },
    { name: 'Chicken Karahi Makhni', variants: [['Full 1 Kg', 2200], ['Half Kg', 1350]] },
    { name: 'Chicken Karahi Achari', variants: [['Full 1 Kg', 2000], ['Half Kg', 1150]] },
    { name: 'Chicken Handi Boneless', variants: [['Full 1 Kg', 2500], ['Half Kg', 1350]] },
    { name: 'Chicken Handi White Boneless', variants: [['Full 1 Kg', 2800], ['Half Kg', 1500]], featured: true },
    { name: 'Chicken Karahi Kabab', variants: [['8 Pcs', 1500], ['4 Pcs', 1000]] },
    { name: 'Beef karahi Kabab', variants: [['8 Pcs', 1800], ['4 Pcs', 1100]], imageKey: 'kabab' },
    { name: 'Daal Mash Makhani Fry', variants: [['Full 1 Kg', 1000], ['Half Kg', 500]], imageKey: 'daal' },
    { name: 'Chicken Tikka Boneless Fry', price: 900, imageKey: 'tikka' },
    { name: 'ChickenTikka Malai Boti Boneless Fry', price: 1000, imageKey: 'tikka' },
    { name: 'Chicken Jalfarezi', price: 800 },
    { name: 'Chicken Ginger', price: 800 },
  ]),
  ...build('real-bbq', [
    { name: 'Chicken Tikka (Leg Piece)', price: 350, imageKey: 'tikka' },
    { name: 'Chicken Tikka Green (Leg Piece)', price: 400, imageKey: 'tikka' },
    { name: 'Chicken Tikka (Chest Piece)', price: 400, imageKey: 'tikka' },
    { name: 'Chicken Tikka Green (Chest Piece)', price: 450, imageKey: 'tikka' },
    { name: 'Chicken Boneless Boti (10 Pcs)', price: 450, imageKey: 'bbq', popular: true },
    { name: 'Chicken Malai Boti Boneless (10 Pcs)', price: 500, imageKey: 'bbq' },
    { name: 'Chicken Reshmi Kabab (4 Pcs)', price: 480, imageKey: 'kabab' },
    { name: 'Beef Seekh Kabab (4 Pcs)', price: 600, imageKey: 'kabab' },
    { name: 'Beef Boti (10 Pcs)', price: 600, imageKey: 'bbq' },
  ]),
  ...build('specialities', [
    { name: 'Sajji with Rice', price: 1500, imageKey: 'sajji', popular: true },
    { name: 'Simple Sajji', price: 1000, imageKey: 'sajji' },
    { name: 'Kabli Pulao', price: 700, imageKey: 'pulao' },
    { name: 'Simple Pulao', price: 400, imageKey: 'pulao' },
    {
      name: 'Chappal Kabab',
      imageKey: 'kabab',
      featured: true,
      variants: [
        ['Single pc', 250],
        ['1/2 KG', 1000],
        ['1 KG', 1800],
      ],
    },
  ]),
  ...build('chaat', [
    { name: 'Dahi Bhallay', price: 200 },
    { name: 'Channa Chaat', price: 200 },
    { name: 'Papri Chaat', price: 200 },
    { name: 'Cream Chaat', price: 250 },
    { name: 'Fruit Salad', price: 250 },
    { name: 'Gol Gappy per Plate (sweet/Sour)', price: 200 },
    { name: 'Gol Gappy 12p (sweet/Sour)', price: 350 },
  ]),
  ...build('ice-cream', [
    {
      name: 'Ice Cream',
      variants: [
        ['2 Scope', 250],
        ['3 Scope', 350],
        ['Half Litter', 600],
        ['1 Litter', 1200],
      ],
    },
  ]),
  ...build('ice-cream-shake', [
    { name: 'Mango', price: 400 },
    { name: 'Vanilla', price: 400 },
    { name: 'Strawberry', price: 400 },
    { name: 'Qulfa', price: 400 },
    { name: 'Chocolate', price: 400 },
    { name: 'Cold Coffee', price: 450, imageKey: 'coffee' },
  ]),
  ...build('fresh-juice', [
    { name: 'Apple', price: 400 },
    { name: 'Mango', price: 300 },
    { name: 'Strawberry', price: 300 },
    { name: 'Peach', price: 300 },
    { name: 'Pineapple', price: 400 },
    { name: 'Orange', price: 300 },
    {
      name: 'M/M/K',
      price: 0,
      available: false,
      priceMissing: true,
      description: 'Listed on the menu without a price.',
    },
    { name: 'Aalu Bukhara', price: 300 },
    { name: 'Falsa', price: 300 },
    { name: 'Pomegranate', price: 800 },
    { name: 'Gray Fruit', price: 300 },
  ]),
  ...build('fresh-shakes', [
    { name: 'Mango', price: 300 },
    { name: 'Banana', price: 300 },
    { name: 'Apple', price: 300 },
    { name: 'Pineapple', price: 400 },
    { name: 'Strawberry', price: 300 },
    { name: 'Peach', price: 300 },
    { name: 'Khajoor/Badam', price: 500 },
  ]),
  ...build('smoothies', [
    { name: 'Mango', price: 300 },
    { name: 'Banana', price: 300 },
    { name: 'Apple', price: 300 },
    { name: 'Strawberry', price: 300 },
    { name: 'Peach', price: 300 },
  ]),
  ...build('cocktail', [
    { name: 'Pina Colada', price: 500 },
    { name: 'Fruit Punch', price: 500 },
    { name: 'Frozen Colada', price: 500 },
    { name: 'Mexican Sunrise', price: 500 },
  ]),
  ...build('soda-water', [
    { name: 'Lemon Soda', price: 150 },
    { name: 'Doodh Soda', price: 200 },
    { name: 'Ice Cream Soda', price: 300, imageKey: 'shake' },
    { name: '7up Soda', price: 200, imageKey: 'coldDrink' },
    { name: 'Lemonate', price: 200 },
  ]),
  ...build('flavour-soda', [
    { name: 'Aalu Bukhara', price: 200 },
    { name: 'Falsa', price: 200 },
    { name: 'Peach', price: 200 },
    { name: 'Imli', price: 200 },
    { name: 'Mirchi', price: 200 },
    { name: 'Mint Soda', price: 200 },
    { name: 'Mint Margarita', price: 400 },
  ]),
  ...build('cold-drinks', [
    { name: 'NR', price: 100 },
    { name: '1/2 Litter', price: 130 },
    { name: '1 Litter', price: 180 },
    { name: '1.5 Litter', price: 220 },
    { name: 'Sml Water', price: 50, imageKey: 'water' },
    { name: 'Lrg Water', price: 100, imageKey: 'water' },
  ]),
  ...build('special-fries', [
    { name: 'Fries Small', price: 200 },
    { name: 'Fries Large', price: 250, popular: true },
    { name: 'Mayo Fries with NR Drink', price: 400, featured: true },
  ]),
  ...build('soup', [
    { name: 'Chicken Corn Soup', variants: [['Family Bowl', 1000], ['Single', 300]] },
    { name: 'Hot & Sour Soup (Fish Craker)', variants: [['Family Bowl', 1500], ['Single', 500]] },
    { name: 'Fish Craker', price: 500 },
  ]),
  ...build('side-dishes', [
    { name: 'Fried Chicken (Leg)', price: 400, imageKey: 'friedChicken' },
    { name: 'Fried Chicken (Chest)', price: 500, imageKey: 'friedChicken' },
    { name: 'Simple Paratha', price: 50, imageKey: 'paratha' },
    { name: 'Double Paratha', price: 100, imageKey: 'paratha' },
    { name: 'Roti', price: 20, imageKey: 'bread' },
    { name: 'Naan', price: 30, imageKey: 'bread' },
  ]),
  ...build('coffee-tea', [
    { name: 'Cappuccino', imageKey: 'coffee', variants: [['Small', 200], ['Large', 300]] },
    { name: 'Black Coffee', imageKey: 'coffee', variants: [['Small', 200], ['Large', 300]] },
    { name: 'Hot Chocolate', imageKey: 'coffee', variants: [['Small', 200], ['Large', 300]] },
    { name: 'Hot Chocolate Coffee', imageKey: 'coffee', variants: [['Small', 200], ['Large', 300]] },
    { name: 'Pink Kashmiri Tea', variants: [['Small', 150], ['Large', 200]] },
    { name: 'Green Tea', price: 100 },
    { name: 'Tea', price: 100 },
    { name: 'Special Matka Tea', price: 150 },
  ]),
]
