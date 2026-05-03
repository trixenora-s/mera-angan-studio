'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ProductCard } from '@/components/events/ProductCard'

interface Product {
  id: string
  name: string
  price: number
  discounted_price: number | null
  images: string[]
  category_id: string
  event_categories: {
    name: string
  }
  reviews: Array<{ rating: number }>
}

export default function FeaturedPackages() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        const response = await fetch('/api/products/featured')
        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error('Failed to fetch featured products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  if (loading) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Packages</h2>
          </div>
          <div className="flex space-x-6 overflow-x-auto pb-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-80">
                <div className="bg-gray-200 rounded-lg aspect-[4/3] animate-pulse mb-4" />
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return null
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Popular Packages</h2>
          <Link
            href="/events"
            className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            View All →
          </Link>
        </div>

        <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
          {products.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-80">
              <ProductCard
                product={{
                  ...product,
                  category_name: product.event_categories.name,
                  avgRating: product.reviews.length > 0
                    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
                    : null,
                  reviewCount: product.reviews.length
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
