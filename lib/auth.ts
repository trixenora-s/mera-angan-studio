import { AuthOptions, type DefaultSession } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { createServiceRoleClient } from './supabase'
import { consumePhoneLoginToken } from './rate-limit'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: DefaultSession['user'] & {
      id: string
      phone?: string | null
      role?: 'user' | 'admin'
    }
  }

  interface User {
    id: string
    phone?: string
    avatar_url?: string | null
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