import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase'
import { ROUTES } from '@/constants/routes'
import OrderStatusForm from '@/components/admin/OrderStatusForm'

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const service = createServiceRoleClient()
  const { data: order, error } = await service
    .from('orders')
    .select('*, order_items(*), profiles(full_name,email)')
    .eq('id', params.id)
    .single()

  if (error || !order) {
    return (
      <div className="rounded-[2rem] bg-white p-10 shadow-lg">
        <p className="text-rose-600">Unable to find this order.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] bg-white p-10 shadow-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-primary-600">Order details</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Order {order.order_number || order.id}</h1>
            <p className="mt-2 text-slate-600">Review shipping, payment, and fulfillment details for this order.</p>
          </div>
          <Link href={ROUTES.ADMIN.ORDERS} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">
            Back to orders
          </Link>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-lg font-semibold text-slate-900">Customer</h2>
              <p className="mt-3 text-slate-600">{order.profiles?.full_name ?? order.user_id ?? 'Guest'}</p>
              <p className="text-slate-600">{order.profiles?.email ?? 'No email available'}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-lg font-semibold text-slate-900">Order summary</h2>
              <div className="mt-4 space-y-3 text-slate-700">
                <p>Payment status: <strong>{order.status}</strong></p>
                <p>Placed on: <strong>{new Date(order.created_at).toLocaleString('en-IN')}</strong></p>
                <p>Total: <strong>₹{Number(order.total || 0).toLocaleString('en-IN')}</strong></p>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-lg font-semibold text-slate-900">Items</h2>
              <div className="mt-4 space-y-4">
                {(order.order_items ?? []).map((item: any) => (
                  <div key={item.id} className="rounded-3xl bg-white p-4 shadow-sm">
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="text-slate-600">Qty: {item.quantity}</p>
                    <p className="text-slate-600">Price: ₹{Number(item.price || 0).toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <OrderStatusForm orderId={params.id} currentStatus={order.status ?? 'pending'} />
          </div>
        </div>
      </div>
    </div>
  )
}
