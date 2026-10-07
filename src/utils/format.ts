export function pkr(value: number) {
  return `Rs. ${Math.round(value).toLocaleString('en-PK')}`
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function uid(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`
}

export function phoneHref(number: string) {
  return `tel:${number.replace(/[^\d+]/g, '')}`
}

export function whatsappHref(number: string) {
  const digits = number.replace(/\D/g, '')
  const intl = digits.startsWith('0') ? `92${digits.slice(1)}` : digits
  return `https://wa.me/${intl}`
}

export function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function startOfDay(date: Date) {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-PK', { hour: 'numeric', minute: '2-digit' })
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateTime(iso: string) {
  return `${formatDate(iso)} · ${formatTime(iso)}`
}

function levenshtein(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 2) return 3
  const row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i += 1) {
    let prev = i - 1
    row[0] = i
    for (let j = 1; j <= b.length; j += 1) {
      const temp = row[j]
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1))
      prev = temp
    }
  }
  return row[b.length]
}

export function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

export function fuzzyMatch(haystack: string, query: string) {
  const h = normalize(haystack)
  const q = normalize(query)
  if (!q) return true
  if (h.includes(q)) return true
  const words = q.split(' ').filter(Boolean)
  if (words.every((word) => h.includes(word))) return true
  const tokens = h.split(' ').filter(Boolean)
  return words.every((word) =>
    tokens.some((token) => token.includes(word) || word.includes(token) || levenshtein(token, word) <= 1),
  )
}

export function lineKey(input: { productId: string; variant?: string; addons: { id: string }[]; notes?: string }) {
  const addons = [...input.addons].map((addon) => addon.id).sort().join(',')
  return `${input.productId}|${input.variant ?? ''}|${addons}|${(input.notes ?? '').trim()}`
}

export async function compressImage(file: File, max = 960) {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Image preview failed')
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return canvas.toDataURL('image/jpeg', 0.72)
}
