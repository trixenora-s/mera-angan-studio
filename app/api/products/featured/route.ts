import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        discounted_price,
        images,
        category_id,
        event_categories (
          name
        ),
        reviews (
          rating
        )
      `)
      .eq('is_available', true)
      .order('created_at', { ascending: false })
      .limit(8)

    if (error) {
      console.error('Error fetching featured products:', error)
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}