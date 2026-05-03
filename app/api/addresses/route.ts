import { createClientServer, createServiceRoleClient } from '@/lib/supabase'
import { z } from 'zod'

const addressSchema = z.object({
  full_address: z.string().min(10),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().regex(/^\d{6}$/),
})

export async function GET() {
  const supabase = createClientServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response(JSON.stringify({ addresses: [] }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    return new Response(JSON.stringify({ addresses: [] }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ addresses: data ?? [] }), {
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = addressSchema.safeParse(body)

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'Invalid address data' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClientServer()
  const { data: { user } } = await supabase.auth.getUser()
  const service = createServiceRoleClient()

  const payload = {
    user_id: user?.id ?? null,
    label: body.label ?? null,
    full_address: parsed.data.full_address,
    city: parsed.data.city,
    state: parsed.data.state,
    pincode: parsed.data.pincode,
    is_default: false,
  }

  const { data, error } = await service.from('addresses').insert(payload).select().single()

  if (error) {
    return new Response(JSON.stringify({ error: 'Unable to save address' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ address: data }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
