import { createClientServer } from '@/lib/supabase'
import ProfileInfo from '@/components/profile/ProfileInfo'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const supabase = createClientServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Your Profile</h1>
        </div>
        
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            {/* Profile Sidebar */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 sticky top-24">
              <nav className="space-y-4">
                <a href="/profile" className="flex items-center space-x-3 p-4 rounded-xl bg-primary-50 border-2 border-primary-100 font-semibold text-primary-700">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                    <span className="text-lg">👤</span>
                  </div>
                  <span>Profile Info</span>
                </a>
                <a href="/profile/orders" className="flex items-center space-x-3 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <span className="text-lg">📦</span>
                  </div>
                  <span>Orders</span>
                </a>
                <a href="/profile/wishlist" className="flex items-center space-x-3 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <span className="text-lg">❤️</span>
                  </div>
                  <span>Wishlist</span>
                </a>
                <a href="/profile/addresses" className="flex items-center space-x-3 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <span className="text-lg">📍</span>
                  </div>
                  <span>Addresses</span>
                </a>
                <a href="/profile/notifications" className="flex items-center space-x-3 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <span className="text-lg">🔔</span>
                  </div>
                  <span>Notifications</span>
                </a>
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            <ProfileInfo profile={profile} />
          </div>
        </div>
      </div>
    </div>
  )
}