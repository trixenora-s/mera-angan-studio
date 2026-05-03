import { createClientBrowser } from './supabase'
import { Product } from '@/types'

export const searchProducts = async (query: string, category?: string): Promise<Product[]> => {
  const supabase = createClientBrowser()

  let queryBuilder = supabase
    .from('products')
    .select(`
      *,
      event_categories!inner(name)
    `)
    .eq('is_available', true)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)

  if (category) {
    queryBuilder = queryBuilder.eq('event_categories.slug', category)
  }

  const { data, error } = await queryBuilder

  if (error) {
    console.error('Search error:', error)
    return []
  }

  return data || []
}

export const getProductsByCategory = async (categorySlug: string): Promise<Product[]> => {
  const supabase = createClientBrowser()

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      event_categories!inner(slug)
    `)
    .eq('event_categories.slug', categorySlug)
    .eq('is_available', true)

  if (error) {
    console.error('Category products error:', error)
    return []
  }

  return data || []
}

export const getFeaturedProducts = async (): Promise<Product[]> => {
  const supabase = createClientBrowser()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_available', true)
    .limit(8)

  if (error) {
    console.error('Featured products error:', error)
    return []
  }

  return data || []
}