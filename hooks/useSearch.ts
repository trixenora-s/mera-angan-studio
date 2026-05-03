import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { searchProducts } from '@/lib/search'
import { Product } from '@/types'

export const useSearch = (initialQuery = '') => {
  const [query, setQuery] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const { data: results, isLoading, error } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchProducts(debouncedQuery),
    enabled: debouncedQuery.length > 0,
  })

  return {
    query,
    setQuery,
    results: results || [],
    isLoading,
    error,
  }
}

export const useCategoryProducts = (categorySlug: string) => {
  return useQuery({
    queryKey: ['category-products', categorySlug],
    queryFn: () => import('@/lib/search').then(m => m.getProductsByCategory(categorySlug)),
  })
}

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ['featured-products'],
    queryFn: () => import('@/lib/search').then(m => m.getFeaturedProducts()),
  })
}