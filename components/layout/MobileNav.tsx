'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { ROUTES } from '@/constants/routes'

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-700 hover:text-primary-600"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b shadow-lg z-50">
          <div className="px-4 py-4 space-y-4">
            <Link
              href={ROUTES.EVENTS}
              className="block text-gray-700 hover:text-primary-600"
              onClick={() => setIsOpen(false)}
            >
              Events
            </Link>
            <Link
              href={ROUTES.GALLERY}
              className="block text-gray-700 hover:text-primary-600"
              onClick={() => setIsOpen(false)}
            >
              Gallery
            </Link>
            <Link
              href={ROUTES.ABOUT}
              className="block text-gray-700 hover:text-primary-600"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <Link
              href={ROUTES.CONTACT}
              className="block text-gray-700 hover:text-primary-600"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>

            <div className="border-t pt-4">
              {session ? (
                <div className="space-y-2">
                  <Link
                    href={ROUTES.PROFILE}
                    className="block text-gray-700 hover:text-primary-600"
                    onClick={() => setIsOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href={ROUTES.CART}
                    className="block text-gray-700 hover:text-primary-600"
                    onClick={() => setIsOpen(false)}
                  >
                    Cart
                  </Link>
                  <Link
                    href={ROUTES.PROFILE_WISHLIST}
                    className="block text-gray-700 hover:text-primary-600"
                    onClick={() => setIsOpen(false)}
                  >
                    Wishlist
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href={ROUTES.AUTH.LOGIN}
                    className="block text-gray-700 hover:text-primary-600"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href={ROUTES.AUTH.SIGNUP}
                    className="block bg-primary-600 text-white px-4 py-2 rounded-lg text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}