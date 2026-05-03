import { notFound } from 'next/navigation'
import { createClientServer } from '@/lib/supabase'
import ProductGrid from '@/components/events/ProductGrid'
import FilterSidebar from '@/components/events/FilterSidebar'
import Breadcrumb from '@/components/ui/Breadcrumb'
import { EventCategory, Product } from '@/types'
import Image from 'next/image'

interface CategoryPageProps {
  params: { category: string }
  searchParams: { 
    page?: string 
    sort?: string 
    minPrice?: string 
    maxPrice?: string 
    rating?: string 
  }
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const supabase = createClientServer()
  const { data: category } = await supabase
    .from('event_categories')
    .select('name, description, cover_image_url')
    .eq('slug', params.category)
    .single()

  if (!category) return { title: 'Event Decorations' }

  return {
    title: `${category.name} Decoration Packages | EventDecor`,
    description: category.description || `Premium ${category.name.toLowerCase()} decoration packages`,
    openGraph: {
      images: [category.cover_image_url || '/og-image.jpg']
    }
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const supabase = createClientServer()
  
  // Fetch category
  const { data: category } = await supabase
    .from('event_categories')
    .select('*')
    .eq('slug', params.category)
    .eq('is_active', true)
    .single()

  if (!category) {
    notFound()
  }

  // Fetch products with reviews
  let query = supabase
    .from('products')
    .select(`
      *,
      reviews (
        rating,
        created_at
      )
    `)
    .eq('category_id', category.id)
    .eq('is_available', true)
    .order('created_at', { ascending: false })

  // Apply filters from search params
  if (searchParams.minPrice) {
    query = query.gte('price', Number(searchParams.minPrice))
  }
  if (searchParams.maxPrice) {
    query = query.lte('price', Number(searchParams.maxPrice))
  }

  const { data: products, count } = await query

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero Banner */}
      <div className="relative h-64 md:h-96 overflow-hidden bg-gradient-to-r from-primary-500 to-purple-600">
        <Image
          src={category.cover_image_url || '/hero-placeholder.jpg'}
          alt={category.name}
          fill
          className="object-cover scale-110"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <Breadcrumb 
              items={[
                { name: 'Home', href: '/' },
                { name: 'Events', href: '/events' },
                { name: category.name, href: `#` }
              ]} 
            />
            <h1 className="text-4xl md:text-6xl font-black mt-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              {category.name}
            </h1>
            <p className="text-xl mt-4 max-w-2xl mx-auto opacity-90">
              {category.description || 'Premium decoration packages for your special occasion'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filter Sidebar */}
          <FilterSidebar 
            categoryId={category.id}
            initialFilters={searchParams}
          />
          
          {/* Product Grid */}
          <div className="lg:col-span-3">
            <ProductGrid 
              products={products || []} 
              totalCount={count || 0}
              categorySlug={params.category}
              filters={searchParams}
            />
          </div>
        </div>
      </div>
    </div>
  )
}