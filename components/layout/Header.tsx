'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useCart } from '@/hooks/useCart'
import { SearchBar } from '@/components/ui/SearchBar'
import { MobileNav } from './MobileNav'
import { ChevronDown, ShoppingBag, User, LogOut, Package, Heart, MapPin, Bell } from 'lucide-react'

export function Header() {
  const { data: session } = useSession()
  const { getItemCount } = useCart()
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isEventsOpen, setIsEventsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const eventCategories = [
    { name: 'Anniversaries', slug: 'anniversaries' },
    { name: 'Annaprashan', slug: 'annaprashan' },
    { name: 'Baby Born / Naamkaran', slug: 'naamkaran' },
    { name: 'Baby Shower (Godh Bharai)', slug: 'baby-shower' },
    { name: 'Birthdays', slug: 'birthdays' },
    { name: 'Diwali / Dhanteras', slug: 'diwali-dhanteras' },
    { name: 'Engagement', slug: 'engagement' },
    { name: 'Haldi Ceremony', slug: 'haldi' },
    { name: 'Janmashtami', slug: 'janmashtami' },
    { name: 'Mehendi Ceremony', slug: 'mehendi' },
    { name: 'New Year\'s Eve', slug: 'new-years-eve' },
    { name: 'Office / Shop Inaugurations', slug: 'inauguration' },
    { name: 'Reception', slug: 'reception' },
    { name: 'Surprise Proposals', slug: 'proposals' },
    { name: 'Wedding Ceremony', slug: 'wedding' },
  ]

  return (
    <header className={`fixed inset-x-0 top-0 z-50 h-16 md:h-20 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-xl shadow-lg' : 'bg-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link href="/" className="text-xl md:text-2xl font-bold text-primary-600 shrink-0">
            EventDecor
          </Link>

          {/* Search Bar - Centered */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <SearchBar />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`transition-colors ${
                pathname === '/' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-700 hover:text-primary-600'
              }`}
            >
              Home
            </Link>

            {/* Events Mega Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => setIsEventsOpen(true)}
                onMouseLeave={() => setIsEventsOpen(false)}
                className={`flex items-center space-x-1 transition-colors ${
                  pathname.startsWith('/events') ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                <span>Events</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {isEventsOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-screen max-w-4xl bg-white border border-gray-200 rounded-lg shadow-xl"
                  onMouseEnter={() => setIsEventsOpen(true)}
                  onMouseLeave={() => setIsEventsOpen(false)}
                >
                  <div className="grid grid-cols-2 gap-0">
                    <div className="p-6">
                      <h3 className="text-sm font-semibold text-gray-900 mb-4">Browse by Event</h3>
                      <div className="grid grid-cols-1 gap-2">
                        {eventCategories.map((category) => (
                          <Link
                            key={category.slug}
                            href={`/events/${category.slug}`}
                            className="text-sm text-gray-700 hover:text-primary-600 transition-colors"
                          >
                            {category.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-r-lg">
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <img src="/placeholder-event.jpg" alt="Featured Event" className="w-full h-32 object-cover rounded mb-3" />
                        <h4 className="font-semibold text-gray-900 mb-1">Wedding Decorations</h4>
                        <p className="text-sm text-gray-600 mb-3">Make your special day unforgettable</p>
                        <Link href="/events/wedding" className="text-primary-600 text-sm font-medium hover:underline">
                          Explore →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/gallery"
              className={`transition-colors ${
                pathname === '/gallery' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-700 hover:text-primary-600'
              }`}
            >
              Gallery
            </Link>

            <Link
              href="/contact"
              className={`transition-colors ${
                pathname === '/contact' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-700 hover:text-primary-600'
              }`}
            >
              Contact
            </Link>

            <Link
              href="/about"
              className={`transition-colors ${
                pathname === '/about' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-700 hover:text-primary-600'
              }`}
            >
              About
            </Link>
          </nav>

          {/* Auth/Profile Section */}
          <div className="flex items-center space-x-4">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600"
                >
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-600" />
                    </div>
                  )}
                  <ChevronDown className="w-4 h-4" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl py-2">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="font-medium text-gray-900">{session.user.name}</p>
                      <p className="text-sm text-gray-600">{session.user.email}</p>
                    </div>
                    <Link href="/profile" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50">
                      <User className="w-4 h-4" />
                      <span>Your Profile</span>
                    </Link>
                    <Link href="/profile/orders" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50">
                      <Package className="w-4 h-4" />
                      <span>Orders</span>
                    </Link>
                    <Link href="/profile/wishlist" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50">
                      <Heart className="w-4 h-4" />
                      <span>Wishlist</span>
                    </Link>
                    <Link href="/profile/addresses" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50">
                      <MapPin className="w-4 h-4" />
                      <span>Saved Addresses</span>
                    </Link>
                    <Link href="/profile/notifications" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50">
                      <Bell className="w-4 h-4" />
                      <span>Notifications</span>
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <button
                  onClick={() => signIn()}
                  className="text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Login
                </button>
                <Link
                  href="/auth/signup"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Cart */}
            <Link href="/cart" className="relative">
              <ShoppingBag className="w-6 h-6 text-gray-700 hover:text-primary-600 transition-colors" />
              {getItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getItemCount()}
                </span>
              )}
            </Link>

            {/* Mobile Menu */}
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  )
}
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