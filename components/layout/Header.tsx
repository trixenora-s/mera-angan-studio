'use client'

import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useCart } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'
import { ROUTES } from '@/constants/routes'
import { SearchBar } from '@/components/ui/SearchBar'
import { MobileNav } from './MobileNav'

export function Header() {
  const { data: session } = useSession()
  const { getItemCount } = useCart()
  const { productIds } = useWishlist()

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href={ROUTES.HOME} className="text-2xl font-bold text-primary-600">
            EventDecor
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href={ROUTES.EVENTS} className="text-gray-700 hover:text-primary-600">
              Events
            </Link>
            <Link href={ROUTES.GALLERY} className="text-gray-700 hover:text-primary-600">
              Gallery
            </Link>
            <Link href={ROUTES.ABOUT} className="text-gray-700 hover:text-primary-600">
              About
            </Link>
            <Link href={ROUTES.CONTACT} className="text-gray-700 hover:text-primary-600">
              Contact
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <SearchBar />
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center space-x-4">
              {/* Cart */}
              <Link href={ROUTES.CART} className="relative">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13v8a2 2 0 002 2h10a2 2 0 002-2v-3" />
                </svg>
                {getItemCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getItemCount()}
                  </span>
                )}
              </Link>

              {/* Wishlist */}
              <Link href={ROUTES.PROFILE_WISHLIST} className="relative">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {productIds.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {productIds.length}
                  </span>
                )}
              </Link>
            </div>

            {/* User Menu */}
            {session ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-700">
                  <img
                    src={session.user?.image || '/default-avatar.png'}
                    alt={session.user?.name || 'User'}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="hidden md:block">{session.user?.name}</span>
                </button>
                <div className="invisible absolute right-0 top-full mt-2 hidden w-40 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg transition group-hover:visible group-hover:block">
                  <Link href={ROUTES.PROFILE} className="block rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => signOut()}
                    className="mt-1 w-full rounded-xl bg-slate-100 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-200"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <button
                  onClick={() => signIn()}
                  className="text-gray-700 hover:text-primary-600"
                >
                  Sign In
                </button>
                <Link
                  href={ROUTES.AUTH.SIGNUP}
                  className="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  )
}