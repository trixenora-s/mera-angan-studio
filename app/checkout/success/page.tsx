import { createServiceRoleClient } from '@/lib/supabase'
import Link from 'next/link'

interface CheckoutSuccessProps {
  searchParams: { orderId?: string }
}

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessProps) {
  const orderId = searchParams.orderId
  const service = createServiceRoleClient()
  const { data: order } = await service
    .from('orders')
    .select('id,order_number,total,status,created_at')
    .eq('id', orderId)
    .single()

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2.5rem] border border-slate-200 bg-white p-12 text-center shadow-xl">
          <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-violet-500 text-5xl text-white">
            🎉
          </div>
          <h1 className="text-4xl font-bold text-slate-900">Booking Confirmed!</h1>
          <p className="mt-4 text-lg text-slate-600">Your event decoration booking is confirmed and we’re getting everything ready.</p>

          {order ? (
            <div className="mx-auto mt-10 max-w-xl rounded-3xl border border-slate-200 bg-slate-50 p-8 text-left">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Order number</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">#{order.order_number}</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-white p-4">
                  <p className="text-sm text-slate-500">Amount paid</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">₹{Number(order.total).toLocaleString()}</p>
                </div>
                <div className="rounded-3xl bg-white p-4">
                  <p className="text-sm text-slate-500">Order status</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">{order.status}</p>
                </div>
              </div>
              <p className="mt-6 text-sm text-slate-600">Our team will contact you within 2 hours to confirm the logistics.</p>
            </div>
          ) : (
            <p className="mt-6 text-sm text-slate-600">We couldn't find the order details, but your payment was completed successfully.</p>
          )}

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href={order ? `/profile/orders/${order.id}` : '/profile/orders'} className="rounded-3xl bg-primary-600 px-6 py-4 text-sm font-semibold text-white transition hover:bg-primary-700">
              View Order Details
            </Link>
            <Link href="/" className="rounded-3xl border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
