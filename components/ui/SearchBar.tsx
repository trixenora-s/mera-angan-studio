'use client'

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface EventCategoryResult {
  id: string
  slug: string
  name: string
  cover_image_url: string | null
}

interface ProductResult {
  id: string
  name: string
  price: number
  discounted_price: number | null
  images: string[]
}

interface SearchResult {
  eventCategories: EventCategoryResult[]
  products: ProductResult[]
}

export function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult>({ eventCategories: [], products: [] })
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<number>()

  useEffect(() => {
    if (!query.trim()) {
      setResults({ eventCategories: [], products: [] })
      setIsOpen(false)
      return
    }

    setLoading(true)
    window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(async () => {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
      const data = await response.json()
      setResults({
        eventCategories: data.eventCategories || [],
        products: data.products || [],
      })
      setLoading(false)
      setIsOpen(true)
    }, 300)

    return () => window.clearTimeout(debounceRef.current)
  }, [query])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const resultsList = useMemo(
    () => [
      ...results.eventCategories.map((category) => ({
        id: category.id,
        label: category.name,
        href: `/events/${category.slug}`,
        thumbnail: category.cover_image_url || '/images/category-placeholder.png',
        meta: 'Category',
      })),
      ...results.products.map((product) => ({
        id: product.id,
        label: product.name,
        href: `/product/${product.id}`,
        thumbnail: product.images?.[0] || '/images/product-placeholder.png',
        meta: `₹${(product.discounted_price || product.price).toFixed(0)}`,
      })),
    ],
    [results]
  )

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!query.trim()) return
    router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    setIsOpen(false)
  }

  const handleSelect = (href: string) => {
    router.push(href)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative max-w-full">
      <form onSubmit={submitSearch} className="relative">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search decorations, events, packages..."
          className="w-full rounded-full border border-slate-200 bg-white/95 px-12 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
        />
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          🔍
        </span>
      </form>

      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
          <div className="space-y-3 p-4">
            {loading && <p className="text-sm text-slate-500">Searching…</p>}
            {!loading && resultsList.length === 0 && <p className="text-sm text-slate-500">No results found.</p>}
            {resultsList.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.href)}
                className="flex w-full items-center gap-3 rounded-3xl px-3 py-3 text-left transition hover:bg-slate-50"
              >
                <img src={item.thumbnail} alt={item.label} className="h-12 w-12 rounded-2xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{item.label}</p>
                  <p className="truncate text-xs text-slate-500">{item.meta}</p>
                </div>
              </button>
            ))}
            {resultsList.length > 0 && (
              <button
                type="button"
                onClick={() => handleSelect(`/search?q=${encodeURIComponent(query.trim())}`)}
                className="w-full rounded-3xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                See all results for “{query}”
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
