/**
 * Neon PostgreSQL helper utilities.
 *
 * This file exposes a direct Neon database pool and also preserves
 * legacy Supabase client helpers when Supabase environment variables are configured.
 */

import { Pool, QueryResult } from 'pg'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/auth-helpers-nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const neonDatabaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL
const neonDirectDatabaseUrl = process.env.NEON_DIRECT_DATABASE_URL || process.env.DIRECT_DATABASE_URL || neonDatabaseUrl

if (!neonDatabaseUrl) {
  throw new Error('Missing Neon database environment variables: NEON_DATABASE_URL or DATABASE_URL')
}

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  console.warn('Supabase environment variables not detected. Legacy Supabase clients will remain available if configured, but the Neon database pool will still connect via DATABASE_URL.')
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
    })
  : null

export const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

export const createClientServer = cache(() => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase server client requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => cookies().getAll().map((cookie) => ({
        name: cookie.name,
        value: cookie.value,
        options: {},
      })),
    },
  })
})

export const createServiceRoleClient = () => {
  if (!supabaseAdmin) {
    throw new Error('Supabase service role client requires SUPABASE_SERVICE_ROLE_KEY')
  }
  return supabaseAdmin
}

// Database connection pool for direct SQL examples
const pool = new Pool({
  connectionString: neonDirectDatabaseUrl,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
})

export const query = async (text: string, params?: any[]): Promise<QueryResult> => {
  const start = Date.now()
  try {
    const result = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('Executed query', { text, duration, rows: result.rowCount })
    return result
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

export const getClient = async () => {
  const client = await pool.connect()
  return client
}

export const transaction = async (queries: Array<{ text: string; params?: any[] }>) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const results = []
    for (const q of queries) {
      const result = await client.query(q.text, q.params)
      results.push(result)
    }
    await client.query('COMMIT')
    return results
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export const closePool = async () => {
  await pool.end()
}

export const healthCheck = async (): Promise<boolean> => {
  try {
    await pool.query('SELECT NOW()')
    return true
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}

export const db = cache(() => ({
  query,
  getClient,
  transaction,
}))

export default pool