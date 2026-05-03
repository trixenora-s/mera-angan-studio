import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase'
import { ROUTES } from '@/constants/routes'

interface AdminOrdersPageProps {
  searchParams?: {
    status?: string
    startDate?: string
    endDate?: string
  }
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const service = createServiceRoleClient()
  let query = service.from('orders').select('id,order_number,user_id,total,status,created_at').order('created_at', { ascending: false })

  if (searchParams?.status) {
    query = query.eq('status', searchParams.status)
  }
  if (searchParams?.startDate) {
    query = query.gte('created_at', `${searchParams.startDate}T00:00:00Z`)
  }
  if (searchParams?.endDate) {
    query = query.lte('created_at', `${searchParams.endDate}T23:59:59Z`)
  }

  const { data: orders, error } = await query
  const orderList = orders ?? []

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] bg-white p-10 shadow-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-primary-600">Orders</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Order management</h1>
            <p className="mt-2 text-slate-600">Search, filter, and review recent orders from guests and customers.</p>
          </div>
          <Link href={ROUTES.ADMIN.DASHBOARD} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">
            Back to dashboard
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Total orders</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{orderList.length}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Status filter</p>
            <p className="mt-2 text-slate-900">{searchParams?.status ?? 'All'}</p>
          </div>
        </div>

        <div className="mt-10 overflow-x-auto rounded-[2rem] border border-slate-200 bg-white">
          <table className="min-w-full border-separate border-spacing-0 text-left">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="px-6 py-4">Order #</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orderList.map((order: any) => (
                <tr key={order.id} className="border-t border-slate-200 hover:bg-slate-50">
                  <td className="px-6 py-4 text-slate-800">{order.order_number || order.id}</td>
                  <td className="px-6 py-4 text-slate-600">{order.user_id ?? 'Guest'}</td>
                  <td className="px-6 py-4 text-slate-800">₹{Number(order.total || 0).toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-slate-800 capitalize">{order.status}</td>
                  <td className="px-6 py-4 text-slate-600">{new Date(order.created_at).toLocaleDateString('en-IN')}</td>
                  <td className="px-6 py-4">
                    <Link href={`${ROUTES.ADMIN.ORDERS}/${order.id}`} className="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {error ? <p className="p-6 text-rose-600">{error.message}</p> : null}
        </div>
      </div>
    </div>
  )
}
