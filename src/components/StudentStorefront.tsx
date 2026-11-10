import * as React from 'react'
import SkateDeckRail, { type SkateDeck } from '@/components/ui/skate-deck-rail'

type Listing = {
  id: string
  name: string
  category: string
  price: number
  description?: string
  stock?: string
}

const palette: Record<string, [string, string, string]> = {
  Textbooks: ['#e7bb76', '#4c6277', '#fff4dd'],
  'Notes & study guides': ['#d6c7f0', '#6662a1', '#fff8e9'],
  Stationery: ['#f2c7a6', '#e77f68', '#fff1dc'],
  Electronics: ['#a9d8c3', '#3b8b79', '#e9fff5'],
  'Project kits': ['#a9c9e5', '#39718f', '#eef7ff'],
  'Campus essentials': ['#e8b9cb', '#8e5978', '#fff0f5'],
}

const deckOutline = 'M3,150 C3,46 53,4 119,4 C185,4 235,46 235,150 L235,850 C235,954 185,996 119,996 C53,996 3,954 3,850 Z'

function xml(value: string) {
  return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]!)
}

function coverArt(product: Listing, side: 'front' | 'back') {
  const [base, ink, paper] = palette[product.category] || palette['Campus essentials']
  const title = product.name.trim().split(/\s+/).slice(0, 3)
  const titleSvg = title.map((word, index) => `<text x="119" y="${435 + index * 43}" text-anchor="middle" fill="${paper}" font-family="Arial,sans-serif" font-size="25" font-weight="700">${xml(word.toUpperCase())}</text>`).join('')
  const front = side === 'front'
  const graphic = front
    ? `<circle cx="119" cy="290" r="69" fill="${ink}" opacity=".92"/><circle cx="119" cy="290" r="51" fill="none" stroke="${paper}" stroke-width="2" opacity=".8"/><path d="M75 290h88M119 246v88" stroke="${paper}" stroke-width="2" opacity=".45"/><text x="119" y="304" text-anchor="middle" font-family="Arial,sans-serif" font-size="38">✦</text>${titleSvg}<text x="119" y="580" text-anchor="middle" fill="${paper}" opacity=".9" font-family="Arial,sans-serif" font-size="18" letter-spacing="1">${xml(product.category.toUpperCase())}</text><text x="119" y="748" text-anchor="middle" fill="${paper}" font-family="Arial,sans-serif" font-size="32" font-weight="700">${xml(new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(product.price))}</text>`
    : `<rect x="48" y="218" width="142" height="550" rx="34" fill="${paper}" opacity=".08"/><text x="119" y="315" text-anchor="middle" fill="${paper}" font-family="Arial,sans-serif" font-size="18" font-weight="700" letter-spacing="2">STUDENT MART</text><path d="M72 355h94" stroke="${paper}" opacity=".65"/><text x="119" y="417" text-anchor="middle" fill="${paper}" font-family="Arial,sans-serif" font-size="18" letter-spacing="1">${xml(product.category.toUpperCase())}</text>${titleSvg}<text x="119" y="595" text-anchor="middle" fill="${paper}" opacity=".9" font-family="Arial,sans-serif" font-size="18">${xml(product.stock || 'Available')}</text><text x="119" y="748" text-anchor="middle" fill="${paper}" font-family="Arial,sans-serif" font-size="32" font-weight="700">${xml(new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(product.price))}</text>`
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 238 1000"><defs><linearGradient id="paint" x1="0" x2="1" y1="0" y2="1"><stop stop-color="${base}"/><stop offset="1" stop-color="${ink}"/></linearGradient></defs><path d="${deckOutline}" fill="url(#paint)"/><path d="M17 153C17 61 60 20 119 20s102 41 102 133v694c0 92-43 133-102 133S17 939 17 847Z" fill="none" stroke="${paper}" stroke-opacity=".32" stroke-width="2"/>${graphic}</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function AddToCollection({ price }: { price: string }) {
  const [added, setAdded] = React.useState(false)
  return <button type="button" aria-pressed={added} onClick={() => setAdded(value => !value)} className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background shadow-sm outline-none transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none">
    {added ? <><svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5l3.2 3L13 4.5" /></svg>Added to collection</> : <>Add to collection · {price}</>}
  </button>
}

export default function StudentStorefront({ products, onAdd }: { products: Listing[]; onAdd: () => void }) {
  const items = React.useMemo<SkateDeck[]>(() => products.map(product => {
    const tag = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(product.price)
    const image = coverArt(product, 'front')
    return {
      id: product.id,
      name: product.name,
      series: product.category,
      tag,
      description: product.description || `A student marketplace listing in ${product.category.toLowerCase()}.`,
      image,
      gripImage: coverArt(product, 'back'),
      details: [product.category, product.stock || 'Available', 'Student Mart listing'],
    }
  }), [products])

  if (!items.length) return <div className="market-empty"><span>🔎</span><b>No matching items on this shelf.</b><p>Clear your search or add the first listing.</p><button className="outline-button" onClick={onAdd}>Add a listing</button></div>

  return <div data-student-storefront className="flex min-h-[620px] w-full items-center justify-center bg-background text-foreground">
    <SkateDeckRail
      items={items}
      eyebrow="Student Mart · Campus collection"
      heading="Find your next campus essential."
      caption="Browse textbooks, notes and everyday essentials on the rail. Open an item to see its details and price in rupees."
      autoplay
      interval={2800}
      labels={{ graphic: 'Front', grip: 'Back', close: 'Close', open: 'View item' }}
      detailAction={deck => <AddToCollection key={deck.id} price={deck.tag || ''} />}
      action={<button type="button" onClick={onAdd} className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background shadow-sm outline-none transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none">Add a listing</button>}
    />
  </div>
}
