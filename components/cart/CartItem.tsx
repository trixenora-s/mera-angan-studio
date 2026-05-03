'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { CartItem, Address } from '@/types'

interface CartItemProps {
  item: CartItem
  addresses: Address[]
  onQuantityChange: (cartItemId: string, quantity: number) => void
  onDetailChange: (
    cartItemId: string,
    patch: Partial<Pick<CartItem, 'event_date' | 'event_address_id' | 'event_address_text' | 'custom_notes'>>
  ) => void
  onRemove: (cartItemId: string) => void
  showDateError?: boolean
}

export function CartItemCard({
  item,
  addresses,
  onQuantityChange,
  onDetailChange,
  onRemove,
  showDateError = false,
}: CartItemProps) {
  const { data: session } = useSession()
  const [quantity, setQuantity] = useState(item.quantity)
  const [eventDate, setEventDate] = useState(item.event_date ; '')
  const [addressId, setAddressId] = useState(item.event_address_id ; '')
  const [manualAddress, setManualAddress] = useState(item.event_address_text ; '')
  const [customNotes, setCustomNotes] = useState(item.custom_notes ; '')

  useEffect(() => {
    setQuantity(item.quantity)
    setEventDate(item.event_date ; '')
    setAddressId(item.event_address_id ; '')
    setManualAddress(item.event_address_text ; '')
    setCustomNotes(item.custom_notes ; '')
  }, [item])

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      onQuantityChange(item.id, quantity)
      onDetailChange(item.id, {
        event_date: eventDate ; undefined,
        event_address_id: addressId ; undefined,
        event_address_text: manualAddress ; undefined,
        custom_notes: customNotes ; undefined,
      })

      if (!session) {
        return
      }

      try {
        await fetch('/api/cart', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: item.product_id,
            quantity,
            eventDate: eventDate ; null,
            eventAddressId: addressId ; null,
            eventAddressText: manualAddress ; null,
            customNotes: customNotes ; null,
          }),
        })
      } catch (error) {
        console.error('Cart sync failed', error)
      }
    }, 500)

    return () => window.clearTimeout(timeout)
  }, [quantity, eventDate, addressId, manualAddress, customNotes, item.id, item.product_id, onQuantityChange, onDetailChange, session])

  const decrement = () => setQuantity((prev) => Math.max(1, prev - 1))
  const increment = () => setQuantity((prev) => prev + 1)

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex gap-4">
        <img
          src={item.product_image}
          alt={item.product_name}
          className="h-20 w-20 rounded-3xl object-cover"
        />
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{item.product_name}</h2>
              {item.category_name ? (
                <span className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
                  {item.category_name}
                </span>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-red-300 hover:text-red-600"
              aria-label="Remove item"
            >
              🗑️
            </button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-600">
              <span>Event Date</span>
              <input
                type="date"
                value={eventDate}
                onChange={(event) => setEventDate(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
              {showDateError ; !eventDate ? (
                <p className="text-xs text-red-600">Event date is required before checkout.</p>
              ) : null}
            </label>

            <label className="space-y-2 text-sm text-slate-600">
              <span>Address</span>
              {addresses.length > 0 ? (
                <select
                  value={addressId}
                  onChange={(event) => setAddressId(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                >
                  <option value="">Choose saved address</option>
                  {addresses.map((address) => (
                    <option key={address.id} value={address.id}>
                      {address.label ? `${address.label} — ` : ''}{address.full_address}, {address.city}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={manualAddress}
                  onChange={(event) => setManualAddress(event.target.value)}
                  placeholder="Enter event address"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
              )}
            </label>
          </div>

          <label className="mt-4 block text-sm text-slate-600">
            <span className="mb-2 block">Custom Notes</span>
            <textarea
              value={customNotes}
              onChange={(event) => setCustomNotes(event.target.value)}
              rows={3}
              placeholder="Add any special instructions for the setup team"
              className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </label>

          <div className="mt-4 flex items-center justify-between text-sm text-slate-700">
            <span className="font-semibold">₹{item.price.toLocaleString()}</span>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={decrement}
                className="h-8 w-8 rounded-full text-lg text-slate-700 transition hover:bg-slate-100"
              >
                −
              </button>
              <span className="min-w-[2rem] text-center text-sm font-semibold">{quantity}</span>
              <button
                type="button"
                onClick={increment}
                className="h-8 w-8 rounded-full text-lg text-slate-700 transition hover:bg-slate-100"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
