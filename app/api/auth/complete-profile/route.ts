import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
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

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const body = await request.json()
  const full_name = body?.full_name?.toString().trim()
  const email = body?.email?.toString().trim()

  if (!full_name) {
    return new Response(JSON.stringify({ error: 'Full name is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabase = createServiceRoleClient()
  const { error } = await supabase
    .from('profiles')
    .update({ full_name, email })
    .eq('id', session.user.id)

  if (error) {
    console.error('Complete profile error:', error)
    return new Response(JSON.stringify({ error: 'Unable to update profile' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
