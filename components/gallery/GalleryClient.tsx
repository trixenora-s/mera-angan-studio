'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import type { GalleryItem } from '@/types'

const Lightbox = dynamic(
  () => import('yet-another-react-lightbox').then((mod) => mod.default),
  { ssr: false }
)

interface GalleryClientProps {
  items: Array<GalleryItem & { category_name: string }>
}

export default function GalleryClient({ items }: GalleryClientProps) {
  const categories = useMemo(
    () => ['All', ...Array.from(new Set(items.map((item) => item.category_name)))],
    [items]
  )

  const [activeCategory, setActiveCategory] = useState('All')
  const [activeIndex, setActiveIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loadedCount, setLoadedCount] = useState(0)

  useEffect(() => {
    setLoadedCount(0)
  }, [activeCategory])

  const filteredItems = useMemo(
    () =>
      activeCategory === 'All'
        ? items
        : items.filter((item) => item.category_name === activeCategory),
    [activeCategory, items]
  )

  const slides = useMemo(
    () =>
      filteredItems.map((item) => ({
        src: item.image_url,
        title: item.category_name,
        description: item.caption ?? '',
      })),
    [filteredItems]
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              category === activeCategory
                ? 'border-primary-600 bg-primary-600 text-white'
                : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredItems.length === 0 ? (
          <div className="col-span-full rounded-[2rem] border border-dashed border-slate-300 bg-white p-16 text-center text-slate-500">
            No images are available for this category yet.
          </div>
        ) : (
          filteredItems.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveIndex(index)
                setIsOpen(true)
              }}
              className="group overflow-hidden rounded-[2rem] bg-white shadow-lg transition hover:-translate-y-1"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-100">
                <Image
                  src={item.image_url}
                  alt={item.caption ?? item.category_name}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                  onLoadingComplete={() => setLoadedCount((prev) => prev + 1)}
                  sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 text-left text-white opacity-0 transition duration-300 group-hover:opacity-100">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-200">{item.category_name}</p>
                  <p className="mt-2 text-lg font-semibold">{item.caption ?? 'Event décor detail'}</p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {!slides.length ? null : (
        <Lightbox
          open={isOpen}
          close={() => setIsOpen(false)}
          slides={slides}
          index={activeIndex}
        />
      )}
    </div>
  )
}
