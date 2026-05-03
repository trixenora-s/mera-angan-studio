import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { supabase } from './supabase'
import { z } from 'zod'

const phoneSchema = z.object({
  phone: z.string().regex(/^\+91\d{10}$/, 'Invalid phone number'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'phone',
      credentials: {
        phone: { label: 'Phone', type: 'tel' },
        token: { label: 'Token', type: 'text' },
      },
      async authorize(credentials) {
        try {
          const { phone, token } = credentials as { phone: string; token: string }

          // Verify token from Redis
          const { consumePhoneLoginToken } = await import('./rate-limit')
          const valid = await consumePhoneLoginToken(phone, token)
          if (!valid) {
            return null
          }

          // Find user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('phone', phone)
            .single()

          if (!profile) {
            return null
          }

          return {
            id: profile.id,
            phone: profile.phone,
            email: profile.email,
            name: profile.full_name,
            image: profile.avatar_url,
            role: profile.role,
          }
        } catch (error) {
          console.error('Phone auth error:', error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Find or create user profile
          let { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', user.email)
            .single()

          if (!existingProfile) {
            const { data: newProfile, error } = await supabase
              .from('profiles')
              .insert({
                email: user.email!,
                full_name: user.name,
                avatar_url: user.image,
              })
              .select()
              .single()

            if (error) throw error
            existingProfile = newProfile
          } else {
            // Update avatar and name if changed
            await supabase
              .from('profiles')
              .update({
                full_name: user.name,
                avatar_url: user.image,
              })
              .eq('id', existingProfile.id)
          }

          user.id = existingProfile.id
          user.role = existingProfile.role
        } catch (error) {
          console.error('Google sign in error:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as 'user' | 'admin'
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  session: {
    strategy: 'jwt',
  },
})
    role?: 'user' | 'admin'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    phone?: string | null
    avatar_url?: string | null
    role?: 'user' | 'admin'
  }
}

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/auth/login',
    newUser: '/auth/login',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          scope: 'openid email profile',
        },
      },
    }),
    CredentialsProvider({
      name: 'Phone OTP',
      credentials: {
        phone: { label: 'Phone', type: 'text' },
        token: { label: 'Login Token', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials.token) {
          throw new Error('Phone number and verification token are required.')
        }

        const phone = credentials.phone.trim()
        const loginToken = credentials.token.trim()
        const isValid = await consumePhoneLoginToken(phone, loginToken)

        if (!isValid) {
          throw new Error('Invalid or expired verification token.')
        }

        const supabase = createServiceRoleClient()
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('phone', phone)
          .single()

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Phone profile fetch error:', fetchError)
          throw new Error('Unable to verify phone login at this time.')
        }

        let profile = existingProfile
        if (!profile) {
          const { data: createdProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({ phone, created_at: new Date().toISOString() })
            .select('*')
            .single()

          if (insertError) {
            console.error('Phone profile creation error:', insertError)
            throw new Error('Unable to create your profile.')
          }

          profile = createdProfile
        }

        return {
          id: profile.id,
          email: profile.email || '',
          name: profile.full_name || '',
          avatar_url: profile.avatar_url || null,
          phone: profile.phone,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        const supabase = createServiceRoleClient()
        const email = user.email || ''
        const name = user.name || undefined
        const avatar_url = user.image || undefined

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('Google profile lookup error:', error)
          return false
        }

        if (data) {
          await supabase
            .from('profiles')
            .update({ full_name: name, avatar_url })
            .eq('id', data.id)
        } else {
          const googleId = user.id as string
          await supabase.from('profiles').insert({
            id: googleId,
            email,
            full_name: name,
            avatar_url,
            created_at: new Date().toISOString(),
          })
        }
      }

      return true
    },
    async jwt({ token, user }) {
      const updatedToken = token as JWT & { role?: 'user' | 'admin' }

      if (user) {
        updatedToken.id = user.id
        updatedToken.email = user.email || updatedToken.email
        updatedToken.name = user.name || updatedToken.name
        updatedToken.avatar_url = user.avatar_url || updatedToken.avatar_url
        updatedToken.phone = (user as any).phone || updatedToken.phone
      }

      if (updatedToken.id && !updatedToken.role) {
        const supabase = createServiceRoleClient()
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', updatedToken.id)
          .single()

        updatedToken.role = profile?.role ?? 'user'
      }

      return updatedToken
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.phone = token.phone as string | null
        session.user.role = token.role as 'user' | 'admin' | undefined
      }
      return session
    },
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      },
    },
  },
}