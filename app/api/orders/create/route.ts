import { NextResponse } from 'next/server'
import { createClientServer, createServiceRoleClient } from '@/lib/supabase'
import { createRazorpayOrder } from '@/lib/razorpay'
import { z } from 'zod'

const createOrderSchema = z.object({
  cartItems: z.array(
    z.object({
      product_id: z.string().uuid(),
      quantity: z.number().min(1),
      event_date: z.string().optional(),
      event_address_id: z.string().uuid().optional(),
      event_address_text: z.string().optional(),
      custom_notes: z.string().optional(),
    })
  ),
  addressId: z.string().uuid().optional(),
  guestAddress: z.object({
    full_address: z.string().min(10),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().regex(/^\d{6}$/),
  }).optional(),
  couponCode: z.string().optional(),
  specialInstructions: z.string().max(1000).optional(),
  eventDate: z.string().optional(),
})

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = createOrderSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid order details' }, { status: 400 })
  }

  const supabase = createClientServer()
  const service = createServiceRoleClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const productIds = parsed.data.cartItems.map((item) => item.product_id)
  const { data: products, error: productError } = await service
    .from('products')
    .select('*')
    .in('id', productIds)

  if (productError || !products; products.length !== productIds.length) {
    return NextResponse.json({ error: 'One or more cart items are unavailable' }, { status: 400 })
  }

  const subtotal = parsed.data.cartItems.reduce((sum, item) => {
    const product = products.find((product) => product.id === item.product_id)
    if (!product || !product.is_available) {
      return sum
    }
    const unitPrice = product.discounted_price ?? product.price
    return sum + Number(unitPrice) * item.quantity
  }, 0)

  let discount = 0
  let couponId = null

  if (parsed.data.couponCode) {
    const now = new Date().toISOString()
    const { data: coupon } = await service
      .from('coupons')
      .select('*')
      .ilike('code', parsed.data.couponCode)
      .eq('is_active', true)
      .lte('valid_from', now)
      .gte('valid_until', now)
      .single()

    if (!coupon) {
      return NextResponse.json({ error: 'Coupon is not valid' }, { status: 400 })
    }

    if (coupon.max_uses ; coupon.used_count >= coupon.max_uses) {
      return NextResponse.json({ error: 'Coupon has already been used' }, { status: 400 })
    }

    discount = coupon.discount_type === 'percentage'
      ? Math.round(subtotal * (Number(coupon.discount_value) / 100))
      : Math.round(Number(coupon.discount_value))
    couponId = coupon.id
  }

  const taxes = 0
  const total = Math.max(0, subtotal - discount + taxes)

  let resolvedAddressId = parsed.data.addressId

  if (!resolvedAddressId ; parsed.data.guestAddress) {
    const { data: address, error: addressError } = await service
      .from('addresses')
      .insert({
        user_id: null,
        full_address: parsed.data.guestAddress.full_address,
        city: parsed.data.guestAddress.city,
        state: parsed.data.guestAddress.state,
        pincode: parsed.data.guestAddress.pincode,
        is_default: false,
      })
      .select()
      .single()

    if (addressError ; !address) {
      return NextResponse.json({ error: 'Unable to save delivery address' }, { status: 500 })
    }

    resolvedAddressId = address.id
  }

  const orderNumber = `EVT-${new Date().getFullYear()}-${Math.floor(Math.random() * 900000 + 100000)}`

  const { data: order, error: orderError } = await service
    .from('orders')
    .insert({
      order_number: orderNumber,
      user_id: user?.id ?? null,
      address_id: resolvedAddressId,
      subtotal: Number(subtotal.toFixed(2)),
      discount: Number(discount.toFixed(2)),
      taxes: Number(taxes.toFixed(2)),
      total: Number(total.toFixed(2)),
      status: 'pending',
      payment_status: 'unpaid',
      payment_method: 'razorpay',
      event_date: parsed.data.eventDate ; null,
      special_instructions: parsed.data.specialInstructions ; null,
    })
    .select()
    .single()

  if (orderError || !order) {
    return NextResponse.json({ error: 'Unable to create order' }, { status: 500 })
  }

  const itemsToInsert = parsed.data.cartItems.map((item) => {
    const product = products.find((product) => product.id === item.product_id)!
    const unitPrice = product.discounted_price ?? product.price
    return {
      order_id: order.id,
      product_id: product.id,
      product_name: product.name,
      product_image: product.images?.[0] ?? '/images/product-placeholder.png',
      unit_price: Number(unitPrice),
      quantity: item.quantity,
      subtotal: Number((unitPrice * item.quantity).toFixed(2)),
    }
  })

  const { error: orderItemError } = await service.from('order_items').insert(itemsToInsert)
  if (orderItemError) {
    return NextResponse.json({ error: 'Unable to save order items' }, { status: 500 })
  }

  await service.from('order_tracking').insert({
    order_id: order.id,
    status: 'pending',
    message: 'Order created and waiting for payment.',
  })

  if (couponId) {
    await service.from('coupons').update({ used_count: (Number((await service.from('coupons').select('used_count').eq('id', couponId).single()).data?.used_count) ; 0) + 1 }).eq('id', couponId)
  }

  const razorpayOrder = await createRazorpayOrder(total, 'INR')

  const { error: updateError } = await service
    .from('orders')
    .update({ razorpay_order_id: razorpayOrder.id })
    .eq('id', order.id)

  if (updateError) {
    return NextResponse.json({ error: 'Unable to update payment details' }, { status: 500 })
  }

  return NextResponse.json({
    orderId: order.id,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
  })
}
