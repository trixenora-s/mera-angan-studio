import { createServiceRoleClient } from '@/lib/supabase'
import { verifyRazorpayPayment } from '@/lib/razorpay'
import { z } from 'zod'

const verifySchema = z.object({
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
})

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = verifySchema.safeParse(body)

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'Invalid payment verification payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const service = createServiceRoleClient()
  const { data: order, error: orderError } = await service
    .from('orders')
    .select('id,user_id,order_number,total,razorpay_order_id')
    .eq('razorpay_order_id', parsed.data.razorpayOrderId)
    .single()

  if (orderError || !order) {
    return new Response(JSON.stringify({ error: 'Order not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const isValid = verifyRazorpayPayment(parsed.data.razorpayOrderId, parsed.data.razorpayPaymentId, parsed.data.razorpaySignature)
  if (!isValid) {
    return new Response(JSON.stringify({ error: 'Payment verification failed' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { error: updateError } = await service
    .from('orders')
    .update({
      status: 'confirmed',
      payment_status: 'paid',
      razorpay_payment_id: parsed.data.razorpayPaymentId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id)

  if (updateError) {
    return new Response(JSON.stringify({ error: 'Unable to finalize order' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (order.user_id) {
    await service.from('cart_items').delete().eq('user_id', order.user_id)
    await service.from('order_tracking').insert({
      order_id: order.id,
      status: 'confirmed',
      message: 'Order confirmed and payment received.',
    })
    await service.from('notifications').insert({
      user_id: order.user_id,
      title: 'Order Confirmed!',
      body: `Your booking #${order.order_number} is confirmed.`,
      type: 'order',
      link: `/profile/orders/${order.id}`,
    })
  }

  return new Response(JSON.stringify({ orderId: order.id }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
