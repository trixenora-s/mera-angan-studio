import { createClientServer } from '@/lib/supabase'

const NEXTAUTH_URL = (globalThis as any).process?.env?.NEXTAUTH_URL
const allowedOrigins = [NEXTAUTH_URL, 'http://localhost:3000'].filter(Boolean) as string[]

function isValidOrigin(origin: string | null) {
  return origin ? allowedOrigins.indexOf(origin) !== -1 : false
}

export async function GET(request: Request) {
  const origin = request.headers.get('origin')
  if (!isValidOrigin(origin)) {
    return new Response(JSON.stringify({ error: 'Invalid origin header' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const url = new URL(request.url)
  const q = url.searchParams.get('q')?.trim() || ''
  if (!q) {
    return new Response(JSON.stringify({ eventCategories: [], products: [] }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClientServer()
  const [categoriesRes, productsRes] = await Promise.all([
    supabase
      .from('event_categories')
      .select('id,slug,name,cover_image_url')
      .ilike('name', `%${q}%`)
      .limit(3),
    supabase
      .from('products')
      .select('id,name,short_description,price,discounted_price,images,category_id')
      .ilike('name', `%${q}%`)
      .or(`short_description.ilike.%${q}%,tags.cs.{${q}}`)
      .limit(5),
  ])

  const categories = categoriesRes.data || []
  const products = productsRes.data || []

  return new Response(JSON.stringify({ eventCategories: categories, products }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
