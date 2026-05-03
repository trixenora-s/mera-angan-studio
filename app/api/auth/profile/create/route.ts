import { peekPhoneLoginToken } from '@/lib/rate-limit'
import { createServiceRoleClient } from '@/lib/supabase'

const NEXTAUTH_URL = (globalThis as any).process?.env?.NEXTAUTH_URL
const allowedOrigins = [NEXTAUTH_URL, 'http://localhost:3000'].filter(Boolean) as string[]

function isValidOrigin(origin: string | null) {
  return origin ? allowedOrigins.indexOf(origin) !== -1 : false
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  if (!isValidOrigin(origin)) {
    return new Response(JSON.stringify({ error: 'Invalid origin header' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const body = await request.json()
  const phone = body?.phone?.toString().trim()
  const token = body?.token?.toString().trim()
  const full_name = body?.full_name?.toString().trim()
  const email = body?.email?.toString().trim()

  if (!phone || !token || !full_name) {
    return new Response(JSON.stringify({ error: 'Phone, token, and full name are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const isAuthorized = await peekPhoneLoginToken(phone, token)
  if (!isAuthorized) {
    return new Response(JSON.stringify({ error: 'Invalid or expired verification token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabase = createServiceRoleClient()
  const { error } = await supabase
    .from('profiles')
    .upsert({ phone, full_name, email }, { onConflict: 'phone' })

  if (error) {
    console.error('Profile create/update error:', error)
    return new Response(JSON.stringify({ error: 'Unable to complete profile creation' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
