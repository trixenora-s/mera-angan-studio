import { createClientServer } from '@/lib/supabase'
import { z } from 'zod'

const patchSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().min(1).optional(),
  eventDate: z.string().nullable().optional(),
  eventAddressId: z.string().uuid().nullable().optional(),
  eventAddressText: z.string().nullable().optional(),
  customNotes: z.string().nullable().optional(),
})

const deleteSchema = z.object({
  productId: z.string().uuid(),
})

export async function PATCH(request: Request) {
  const body = await request.json()
  const parsed = patchSchema.safeParse(body)

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'Invalid cart update' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClientServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { data: existing } = await supabase
    .from('cart_items')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', parsed.data.productId)
    .single()

  const quantity = parsed.data.quantity ?? 1

  if (existing) {
    const { error } = await supabase
      .from('cart_items')
      .update({
        quantity,
        event_date: parsed.data.eventDate,
        event_address_id: parsed.data.eventAddressId,
        custom_notes: parsed.data.customNotes,
        event_address_text: parsed.data.eventAddressText,
      })
      .eq('user_id', user.id)
      .eq('product_id', parsed.data.productId)

    if (error) {
      return new Response(JSON.stringify({ error: 'Unable to update cart item' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { error } = await supabase.from('cart_items').insert({
    user_id: user.id,
    product_id: parsed.data.productId,
    quantity,
    event_date: parsed.data.eventDate,
    event_address_id: parsed.data.eventAddressId,
    custom_notes: parsed.data.customNotes,
    event_address_text: parsed.data.eventAddressText,
  })

  if (error) {
    return new Response(JSON.stringify({ error: 'Unable to create cart item' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function DELETE(request: Request) {
  const body = await request.json()
  const parsed = deleteSchema.safeParse(body)

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClientServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', parsed.data.productId)

  if (error) {
    return new Response(JSON.stringify({ error: 'Unable to remove cart item' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
