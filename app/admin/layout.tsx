import Link from 'next/link'
import { ROUTES } from '@/constants/routes'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-primary-600">Admin Dashboard</p>
            <h1 className="text-xl font-semibold">EventDecor Control Center</h1>
          </div>
          <nav className="hidden items-center gap-3 md:flex">
            <Link href={ROUTES.ADMIN.DASHBOARD} className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
              Overview
            </Link>
            <Link href={ROUTES.ADMIN.ORDERS} className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
              Orders
            </Link>
            <Link href={ROUTES.ADMIN.PRODUCTS} className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
              Products
            </Link>
            <Link href={ROUTES.ADMIN.CATEGORIES} className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
              Categories
            </Link>
            <Link href={ROUTES.ADMIN.GALLERY} className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
              Gallery
            </Link>
            <Link href={ROUTES.ADMIN.COUPONS} className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
              Coupons
            </Link>
            <Link href={ROUTES.ADMIN.REVIEWS} className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
              Reviews
            </Link>
          </nav>
        </div>
      </div>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}
