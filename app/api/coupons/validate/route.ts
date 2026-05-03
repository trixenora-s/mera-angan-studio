import { createClientServer } from '@/lib/supabase'
import { z } from 'zod'

const bodySchema = z.object({
  code: z.string().min(3).max(20),
  subtotal: z.number().min(0),
})

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = bodySchema.safeParse(body)

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'Invalid coupon request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClientServer()
  const now = new Date().toISOString()

  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .ilike('code', parsed.data.code)
    .eq('is_active', true)
    .lte('valid_from', now)
    .gte('valid_until', now)
    .single()

  if (error || !coupon) {
    return new Response(JSON.stringify({ error: 'Coupon is not valid or has expired' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
    return new Response(JSON.stringify({ error: 'Coupon has already been used' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (Number(parsed.data.subtotal) < Number(coupon.min_order_amount ?? 0)) {
    return new Response(JSON.stringify({ error: `Minimum order value is ₹${coupon.min_order_amount}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const discount = coupon.discount_type === 'percentage'
    ? Math.min(Number(parsed.data.subtotal) * (Number(coupon.discount_value) / 100), Number(parsed.data.subtotal))
    : Math.min(Number(coupon.discount_value), Number(parsed.data.subtotal))

  return new Response(JSON.stringify({
    code: coupon.code,
    discount: Math.round(discount),
    message: `Coupon applied successfully. You saved ₹${Math.round(discount)}.`,
  }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
