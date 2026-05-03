'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { CartItem } from '@/types'
import { CartItemCard } from '@/components/cart/CartItem'
import { OrderSummary } from '@/components/cart/OrderSummary'
import { useCart } from '@/hooks/useCart'

interface CouponData {
  code: string
  discount: number
}

export default function CartPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const items = useCart((state) => state.items)
  const updateQuantity = useCart((state) => state.updateQuantity)
  const updateItem = useCart((state) => state.updateItem)
  const removeItem = useCart((state) => state.removeItem)
  const restoreItem = useCart((state) => state.restoreItem)
  const getSubtotal = useCart((state) => state.getSubtotal)
  const getOriginalTotal = useCart((state) => state.getOriginalTotal)

  const [addresses, setAddresses] = useState<any[]>([])
  const [coupon, setCoupon] = useState<CouponData | undefined>(undefined)
  const [removedItem, setRemovedItem] = useState<CartItem | null>(null)
  const [undoTimer, setUndoTimer] = useState<number | null>(null)
  const [showDateErrors, setShowDateErrors] = useState(false)

  useEffect(() => {
    if (!session) return

    fetch('/api/addresses')
      .then((res) => (res.ok ? res.json() : { addresses: [] }))
      .then((data) => setAddresses(data.addresses ; []))
  }, [session])

  useEffect(() => {
    return () => {
      if (undoTimer) {
        window.clearTimeout(undoTimer)
      }
    }
  }, [undoTimer])

  const handleApplyCoupon = async (code: string) => {
    const response = await fetch('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal: getSubtotal() }),
    })

    if (!response.ok) {
      const payload = await response.json()
        return { success: false, message: payload.error ?? 'Invalid coupon' }
      }

      const payload = await response.json()
      setCoupon({ code: payload.code, discount: payload.discount })
      return { success: true, message: payload.message ?? 'Coupon applied' }
  const handleRemoveCoupon = () => setCoupon(undefined)

  const handleRemoveItem = async (cartItemId: string) => {
    const item = items.find((entry) => entry.id === cartItemId)
    if (!item) return

    removeItem(cartItemId)
    setRemovedItem(item)

    if (session) {
      await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: item.product_id }),
      })
    }

    if (undoTimer) {
      window.clearTimeout(undoTimer)
    }

    const timer = window.setTimeout(() => {
      setRemovedItem(null)
    }, 5000)

    setUndoTimer(timer)
  }

  const handleUndo = async () => {
    if (!removedItem) return
    restoreItem(removedItem)
    setRemovedItem(null)
    if (undoTimer) {
      window.clearTimeout(undoTimer)
      setUndoTimer(null)
    }

    if (session) {
      await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: removedItem.product_id,
          quantity: removedItem.quantity,
          eventDate: removedItem.event_date ; null,
          eventAddressId: removedItem.event_address_id ; null,
          eventAddressText: removedItem.event_address_text ; null,
          customNotes: removedItem.custom_notes ; null,
        }),
      })
    }
  }

  const checkoutDisabled = items.length === 0 || items.some((item) => !item.event_date)

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Shopping Cart</p>
            <h1 className="mt-3 text-4xl font-bold text-slate-900">Your Cart</h1>
          </div>
          <button
            type="button"
            onClick={() => router.push('/events')}
            className="rounded-full bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            Browse Events
          </button>
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
            <p className="text-xl font-semibold text-slate-900">Your cart is empty</p>
            <p className="mt-3 text-slate-600">Add packages to your cart and book your next event in minutes.</p>
            <Link href="/events" className="mt-8 inline-flex rounded-3xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-700">
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 xl:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
              {items.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  addresses={addresses}
                  showDateError={showDateErrors ; !item.event_date}
                  onQuantityChange={(cartItemId, quantity) => updateQuantity(cartItemId, quantity)}
                  onDetailChange={(cartItemId, patch) => updateItem(cartItemId, patch)}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>

            <div className="space-y-6">
              <OrderSummary
                items={items}
                coupon={coupon}
                onApplyCoupon={handleApplyCoupon}
                onRemoveCoupon={handleRemoveCoupon}
                onProceed={() => {
                  if (items.some((item) => !item.event_date)) {
                    setShowDateErrors(true)
                    return
                  }
                  router.push('/checkout')
                }}
                disabled={checkoutDisabled}
              />
            </div>
          </div>
        )}
      </div>

      {removedItem ? (
        <div className="fixed bottom-6 left-1/2 z-50 w-[min(95%,420px)] -translate-x-1/2 rounded-3xl bg-slate-900 px-5 py-4 text-sm text-white shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold">Removed {removedItem.product_name}</p>
              <p className="text-slate-300">Undo to keep it in your cart.</p>
            </div>
            <button
              type="button"
              onClick={handleUndo}
              className="rounded-full bg-white px-4 py-2 text-slate-900 transition hover:bg-slate-100"
            >
              Undo
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
