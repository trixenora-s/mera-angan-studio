import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createServiceRoleClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

async function requireAdmin(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceRoleClient()
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (error || !profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return null
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const unauthorizedResponse = await requireAdmin(request)
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  const body = await request.json()
  const status = body?.status

  if (!status || typeof status !== 'string') {
    return NextResponse.json({ error: 'Invalid status provided.' }, { status: 400 })
  }

  const service = createServiceRoleClient()
  const { data, error } = await service
    .from('orders')
    .update({ status })
    .eq('id', params.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ order: data })
}

export function GET() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 })
}
