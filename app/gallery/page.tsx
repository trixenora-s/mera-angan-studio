import { createClientServer } from '@/lib/supabase'
import GalleryClient from '@/components/gallery/GalleryClient'
import type { GalleryItem } from '@/types'

export const revalidate = 3600

export default async function GalleryPage() {
  const supabase = createClientServer()
  const { data } = await supabase
    .from('gallery_items')
    .select('*, event_categories(name)')
    .order('display_order')

  const galleryItems = (data || []).map((item: any) => ({
    ...item,
    category_name: item.event_categories?.name ?? 'Uncategorized',
  })) as Array<GalleryItem & { category_name: string }>

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.35em] text-primary-600">Gallery</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Real moments from real celebrations
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-slate-600">
            Browse our event gallery for inspiration and discover décor collections for every celebration.
          </p>
        </div>

        <GalleryClient items={galleryItems} />
      </div>
    </div>
  )
}