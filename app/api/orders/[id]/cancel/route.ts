import { createClientServer, createServiceRoleClient } from '@/lib/supabase'
import { razorpay } from '@/lib/razorpay'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClientServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const service = createServiceRoleClient()
  const { data: order, error } = await service
    .from('orders')
    .select('id,status,payment_status,razorpay_payment_id,total')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (error || !order) {
    return new Response(JSON.stringify({ error: 'Order not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (['pending', 'confirmed'].indexOf(order.status) === -1) {
    return new Response(JSON.stringify({ error: 'Order cannot be cancelled' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const updates: Record<string, any> = {
    status: 'cancelled',
  }

  if (order.payment_status === 'paid' && order.razorpay_payment_id) {
    updates.payment_status = 'refunded'
    try {
      await razorpay.payments.refund(order.razorpay_payment_id, {
        amount: Math.round(Number(order.total) * 100),
      })
    } catch (refundError) {
      console.error('Refund failed', refundError)
    }
  }

  const { error: updateError } = await service.from('orders').update(updates).eq('id', order.id)
  if (updateError) {
    return new Response(JSON.stringify({ error: 'Unable to cancel order' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  await service.from('order_tracking').insert({
    order_id: order.id,
    status: 'cancelled',
    message: 'Order cancelled by user.',
  })

  await service.from('notifications').insert({
    user_id: user.id,
    title: 'Order Cancelled',
    body: `Your booking has been cancelled and refund is being processed.`,
    type: 'order',
    link: `/profile/orders/${order.id}`,
  })

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
