import { useSession } from 'next-auth/react'
import { createClientBrowser } from '@/lib/supabase'
import { Profile } from '@/types'

export const useAuth = () => {
  const { data: session, status } = useSession()
  const supabase = createClientBrowser()

  const getProfile = async (): Promise<Profile | null> => {
    if (!session?.user?.id) return null

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }

    return data
  }

  const updateProfile = async (updates: Partial<Profile>): Promise<boolean> => {
    if (!session?.user?.id) return false

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', session.user.id)

    if (error) {
      console.error('Error updating profile:', error)
      return false
    }

    return true
  }

  return {
    session,
    status,
    user: session?.user,
    isAuthenticated: !!session,
    getProfile,
    updateProfile,
  }
}