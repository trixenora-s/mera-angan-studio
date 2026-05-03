'use client'

import { useMemo, useState } from 'react'
import { CartItem } from '@/types'

interface CouponPreview {
  code: string
  discount: number
}

interface OrderSummaryProps {
  items: CartItem[]
  coupon?: CouponPreview
  onApplyCoupon: (code: string) => Promise<{ success: boolean; message: string; discount?: number }>
  onRemoveCoupon: () => void
  onProceed: () => void
  disabled: boolean
}

export function OrderSummary({ items, coupon, onApplyCoupon, onRemoveCoupon, onProceed, disabled }: OrderSummaryProps) {
  const [code, setCode] = useState('')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [isApplying, setIsApplying] = useState(false)

  const originalTotal = useMemo(
    () => items.reduce((sum, item) => sum + (item.original_price ?? item.price) * item.quantity, 0),
    [items]
  )
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items])
  const discount = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + Math.max(0, (item.original_price ?? item.price) - item.price) * item.quantity,
      0
    )
  }, [items])
  const couponDiscount = coupon?.discount ?? 0
  const total = Math.max(0, subtotal - couponDiscount)

  const handleApply = async () => {
    if (!code.trim()) {
      setStatusMessage('Enter a coupon code to apply.')
      return
    }

    setIsApplying(true)
    const result = await onApplyCoupon(code.trim())
    setIsApplying(false)
    setStatusMessage(result.message)

    if (result.success) {
      setCode('')
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Order Summary</h2>
      <div className="mt-6 space-y-3 text-sm text-slate-600">
        <div className="flex justify-between">
          <span>Price ({items.length} items)</span>
          <span>₹{originalTotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-slate-700">
          <span>Discount</span>
          <span>− ₹{discount.toLocaleString()}</span>
        </div>
        {coupon ? (
          <div className="flex justify-between text-green-700">
            <span>Coupon discount ({coupon.code})</span>
            <span>− ₹{coupon.discount.toLocaleString()}</span>
          </div>
        ) : null}
        <div className="border-t border-slate-200 pt-4 flex justify-between text-base font-semibold text-slate-900">
          <span>Total Amount</span>
          <span>₹{total.toLocaleString()}</span>
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-500">
        You save ₹{(discount + couponDiscount).toLocaleString()} on this order 🎉
      </p>

      <div className="mt-6 space-y-3">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Coupon code"
            className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
          <button
            type="button"
            onClick={handleApply}
            disabled={isApplying}
            className="rounded-3xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isApplying ? 'Applying...' : 'Apply'}
          </button>
        </div>
        {statusMessage ? (
          <p className="text-sm text-slate-600">{statusMessage}</p>
        ) : null}
        {coupon ? (
          <button
            type="button"
            onClick={onRemoveCoupon}
            className="w-full rounded-3xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-100"
          >
            Remove coupon
          </button>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onProceed}
        disabled={disabled}
        className="mt-6 w-full rounded-3xl bg-primary-600 px-4 py-4 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        Proceed to Checkout
      </button>
    </div>
  )
}
