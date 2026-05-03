'use client'

import { useState } from 'react'

const statuses = ['pending', 'confirmed', 'in progress', 'completed', 'cancelled']

interface OrderStatusFormProps {
  orderId: string
  currentStatus: string
}

export default function OrderStatusForm({ orderId, currentStatus }: OrderStatusFormProps) {
  const [status, setStatus] = useState(currentStatus)
  const [message, setMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    setMessage('')

    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })

    const result = await response.json()
    setIsSaving(false)

    if (!response.ok) {
      setMessage(result?.error || 'Unable to update order status.')
      return
    }

    setMessage('Order status updated successfully.')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6">
      <label className="block text-sm font-medium text-slate-700">
        Update order status
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
        >
          {statuses.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      {message ? <p className="text-sm text-slate-600">{message}</p> : null}

      <button
        type="submit"
        disabled={isSaving}
        className="inline-flex w-full items-center justify-center rounded-3xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {isSaving ? 'Saving...' : 'Update Status'}
      </button>
    </form>
  )
}
