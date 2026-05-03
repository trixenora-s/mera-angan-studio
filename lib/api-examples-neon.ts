/**
 * Example API Route with Neon PostgreSQL
 * 
 * This file shows how to migrate from Supabase to Neon database queries.
 * Copy patterns from here to update your existing API routes.
 */

// ============================================================
// EXAMPLE 1: Simple GET - Fetch Products
// ============================================================

// BEFORE (Supabase)
/*
import { createClientServer } from '@/lib/supabase'

export async function GET(req: Request) {
  const client = await createClientServer()
  
  const { data, error } = await client
    .from('products')
    .select('*')
    .eq('is_available', true)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return Response.json(data)
}
*/

// AFTER (Neon)
import { query } from '@/lib/supabase'

export async function GET(req: Request) {
  const result = await query(
    `SELECT * FROM public.products 
     WHERE is_available = true 
     ORDER BY created_at DESC`
  )
  
  return Response.json(result.rows)
}

// ============================================================
// EXAMPLE 2: GET with Parameters
// ============================================================

// BEFORE (Supabase)
/*
export async function GET(req: Request, { params }) {
  const client = await createClientServer()
  
  const { data, error } = await client
    .from('products')
    .select('*')
    .eq('id', params.id)
    .single()
  
  if (error) throw error
  return Response.json(data)
}
*/

// AFTER (Neon)
import { query } from '@/lib/supabase'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const result = await query(
    'SELECT * FROM public.products WHERE id = $1',
    [params.id]
  )
  
  if (result.rows.length === 0) {
    return Response.json({ error: 'Product not found' }, { status: 404 })
  }
  
  return Response.json(result.rows[0])
}

// ============================================================
// EXAMPLE 3: Protected Route - Get User Orders
// ============================================================

// BEFORE (Supabase)
/*
import { createClientServer } from '@/lib/supabase'

export async function GET(req: Request) {
  const client = await createClientServer()
  
  const { data: { session } } = await client.auth.getSession()
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { data, error } = await client
    .from('orders')
    .select('*')
    .eq('user_id', session.user.id)
  
  return Response.json(data)
}
*/

// AFTER (Neon)
import { getServerSession } from "next-auth/next"
import { query } from '@/lib/supabase'

export async function GET(req: Request) {
  const session = await getServerSession()
  
  if (!session || !session.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const result = await query(
    `SELECT * FROM public.orders 
     WHERE user_id = $1 
     ORDER BY created_at DESC`,
    [session.user.id]
  )
  
  return Response.json(result.rows)
}

// ============================================================
// EXAMPLE 4: POST - Create Order
// ============================================================

// BEFORE (Supabase)
/*
export async function POST(req: Request) {
  const client = await createClientServer()
  const body = await req.json()
  
  const { data, error } = await client
    .from('orders')
    .insert([{
      order_number: body.orderNumber,
      user_id: body.userId,
      total: body.total,
      status: 'pending'
    }])
    .select()
    .single()
  
  if (error) throw error
  return Response.json(data)
}
*/

// AFTER (Neon)
import { query } from '@/lib/supabase'
import { getServerSession } from "next-auth/next"

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const body = await req.json()
  
  const result = await query(
    `INSERT INTO public.orders 
     (order_number, user_id, address_id, subtotal, discount, taxes, total, status, payment_status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      body.orderNumber,
      session.user.id,
      body.addressId,
      body.subtotal,
      body.discount || 0,
      body.taxes || 0,
      body.total,
      'pending',
      'unpaid'
    ]
  )
  
  if (result.rows.length === 0) {
    return Response.json({ error: 'Failed to create order' }, { status: 500 })
  }
  
  return Response.json(result.rows[0], { status: 201 })
}

// ============================================================
// EXAMPLE 5: PUT - Update Order Status (Admin)
// ============================================================

// BEFORE (Supabase)
/*
export async function PUT(req: Request, { params }) {
  const client = await createClientServer()
  const body = await req.json()
  
  const { data, error } = await client
    .from('orders')
    .update({ status: body.status })
    .eq('id', params.id)
    .select()
    .single()
  
  if (error) throw error
  return Response.json(data)
}
*/

// AFTER (Neon)
import { getServerSession } from "next-auth/next"
import { query, transaction } from '@/lib/supabase'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession()
  
  // Check admin role
  const adminCheck = await query(
    'SELECT role FROM public.profiles WHERE id = $1',
    [session?.user?.id]
  )
  
  if (!adminCheck.rows[0] || adminCheck.rows[0].role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  const body = await req.json()
  
  // Use transaction for order + tracking
  const results = await transaction([
    {
      text: `UPDATE public.orders 
             SET status = $1, updated_at = NOW() 
             WHERE id = $2
             RETURNING *`,
      params: [body.status, params.id]
    },
    {
      text: `INSERT INTO public.order_tracking (order_id, status, message, updated_by)
             VALUES ($1, $2, $3, $4)`,
      params: [params.id, body.status, body.message || '', session?.user?.id]
    }
  ])
  
  return Response.json(results[0].rows[0])
}

// ============================================================
// EXAMPLE 6: DELETE - Remove from Wishlist
// ============================================================

// BEFORE (Supabase)
/*
export async function DELETE(req: Request, { params }) {
  const client = await createClientServer()
  
  const { error } = await client
    .from('wishlist_items')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.id)
  
  if (error) throw error
  return Response.json({ success: true })
}
*/

// AFTER (Neon)
import { getServerSession } from "next-auth/next"
import { query } from '@/lib/supabase'

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession()
  
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const result = await query(
    `DELETE FROM public.wishlist_items 
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [params.id, session.user.id]
  )
  
  if (result.rows.length === 0) {
    return Response.json({ error: 'Item not found' }, { status: 404 })
  }
  
  return Response.json({ success: true })
}

// ============================================================
// EXAMPLE 7: Complex Query with Joins
// ============================================================

// Get order with items and product details
import { query } from '@/lib/supabase'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const result = await query(
    `SELECT 
       o.*,
       json_agg(
         json_build_object(
           'id', oi.id,
           'productName', oi.product_name,
           'unitPrice', oi.unit_price,
           'quantity', oi.quantity,
           'subtotal', oi.subtotal
         )
       ) as items
     FROM public.orders o
     LEFT JOIN public.order_items oi ON o.id = oi.order_id
     WHERE o.id = $1
     GROUP BY o.id`,
    [params.id]
  )
  
  if (result.rows.length === 0) {
    return Response.json({ error: 'Order not found' }, { status: 404 })
  }
  
  return Response.json(result.rows[0])
}

// ============================================================
// EXAMPLE 8: Full-Text Search
// ============================================================

// Search products by name and description
import { query } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  
  const result = await query(
    `SELECT * FROM public.products
     WHERE search_vector @@ plainto_tsquery('english', $1)
     ORDER BY ts_rank(search_vector, plainto_tsquery('english', $1)) DESC
     LIMIT 20`,
    [q]
  )
  
  return Response.json(result.rows)
}

// ============================================================
// COMMON PATTERNS
// ============================================================

/**
 * Pattern 1: Parameterized Queries (prevents SQL injection)
 */
// ✅ GOOD
const result = await query(
  'SELECT * FROM products WHERE id = $1 AND category = $2',
  [productId, categoryId]
)

// ❌ BAD - SQL Injection risk
const result = await query(
  `SELECT * FROM products WHERE id = ${productId}`
)

/**
 * Pattern 2: Transactions
 */
import { transaction } from '@/lib/supabase'

const results = await transaction([
  {
    text: 'UPDATE inventory SET stock = stock - $1 WHERE product_id = $2',
    params: [quantity, productId]
  },
  {
    text: 'INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1, $2, $3)',
    params: [orderId, productId, quantity]
  }
])

/**
 * Pattern 3: Error Handling
 */
try {
  const result = await query('SELECT * FROM products WHERE id = $1', [id])
  
  if (result.rows.length === 0) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }
  
  return Response.json(result.rows[0])
} catch (error) {
  console.error('Database error:', error)
  return Response.json({ error: 'Internal server error' }, { status: 500 })
}

/**
 * Pattern 4: Pagination
 */
const page = parseInt(searchParams.get('page') || '1')
const pageSize = 20
const offset = (page - 1) * pageSize

const result = await query(
  `SELECT * FROM public.products 
   WHERE is_available = true
   ORDER BY created_at DESC
   LIMIT $1 OFFSET $2`,
  [pageSize, offset]
)

/**
 * Pattern 5: Aggregation
 */
const result = await query(
  `SELECT 
     category_id,
     COUNT(*) as product_count,
     AVG(price) as avg_price,
     MAX(price) as max_price
   FROM public.products
   GROUP BY category_id`
)
