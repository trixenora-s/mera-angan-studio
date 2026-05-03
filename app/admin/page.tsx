import { createServiceRoleClient } from '@/lib/supabase'
import { ROUTES } from '@/constants/routes'

export default async function AdminDashboardPage() {
  const service = createServiceRoleClient()
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6).toISOString()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const { data: orders } = await service.from('orders').select('id,total,status,created_at').gte('created_at', monthStart)
  const { data: users } = await service.from('profiles').select('id,created_at').gte('created_at', weekStart)

  const ordersList = (orders ?? []) as Array<{ id: string; total: number; status: string; created_at: string }>
  const ordersToday = ordersList.filter((order: any) => order.created_at >= todayStart).length
  const ordersWeek = ordersList.filter((order: any) => order.created_at >= weekStart).length
  const ordersMonth = ordersList.length
  const completedRevenue = ordersList
    .filter((order: any) => order.status === 'completed')
    .reduce((sum: number, order: any) => sum + Number(order.total || 0), 0)
  const pendingOrders = ordersList.filter((order: any) => order.status === 'pending').length
  const newUsers = users?.length ?? 0

  return (
    <div className="space-y-10">
      <section className="rounded-[2rem] bg-white p-10 shadow-lg">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-primary-600">Overview</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Admin Dashboard</h1>
            <p className="mt-2 text-slate-600">Monitor orders, inventory, gallery updates, coupon performance, and customer feedback.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={ROUTES.ADMIN.ORDERS} className="rounded-full bg-primary-600 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700">
              Manage orders
            </a>
            <a href={ROUTES.ADMIN.PRODUCTS} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">
              Manage products
            </a>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[
            { title: 'Orders Today', value: ordersToday },
            { title: 'Orders This Week', value: ordersWeek },
            { title: 'Pending Orders', value: pendingOrders },
            { title: 'New Users (7d)', value: newUsers },
          ].map((stat) => (
            <div key={stat.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm font-medium text-slate-500">{stat.title}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-[2rem] bg-white p-10 shadow-lg">
          <h2 className="text-2xl font-semibold text-slate-900">Month-to-date revenue</h2>
          <p className="mt-3 text-slate-600">Revenue from completed orders in the current month.</p>
          <div className="mt-8 rounded-3xl bg-slate-950 p-8 text-white">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Revenue</p>
            <p className="mt-4 text-4xl font-semibold">₹{completedRevenue.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-10 shadow-lg">
          <h2 className="text-2xl font-semibold text-slate-900">Quick actions</h2>
          <div className="mt-6 space-y-4">
            <a href={ROUTES.ADMIN.GALLERY} className="block rounded-3xl border border-slate-200 bg-slate-50 px-6 py-4 text-slate-700 hover:bg-slate-100">
              Update gallery items
            </a>
            <a href={ROUTES.ADMIN.COUPONS} className="block rounded-3xl border border-slate-200 bg-slate-50 px-6 py-4 text-slate-700 hover:bg-slate-100">
              Review coupons
            </a>
            <a href={ROUTES.ADMIN.REVIEWS} className="block rounded-3xl border border-slate-200 bg-slate-50 px-6 py-4 text-slate-700 hover:bg-slate-100">
              Manage reviews
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
