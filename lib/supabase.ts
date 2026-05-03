/**
 * Neon PostgreSQL Database Client
 * Replaces Supabase with direct PostgreSQL connection
 * 
 * Usage:
 * - Server-side: Use db.query() for direct queries
 * - For ORM: Consider adding Prisma or Drizzle
 */

import { Pool, QueryResult } from 'pg'
import { cache } from 'react'

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
})

// Error handling
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
})

/**
 * Execute a query with parameters
 * @param text SQL query string
 * @param params Query parameters
 * @returns Query result
 */
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

/**
 * Get a client from the pool for transactions
 */
export const getClient = async () => {
  const client = await pool.connect()
  return client
}

/**
 * Execute multiple queries in a transaction
 * @param queries Array of {text, params} objects
 */
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

/**
 * Close the connection pool
 */
export const closePool = async () => {
  await pool.end()
}

/**
 * Health check for database connection
 */
export const healthCheck = async (): Promise<boolean> => {
  try {
    await pool.query('SELECT NOW()')
    return true
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}

// Cached database instance for server operations
export const db = cache(() => ({
  query,
  getClient,
  transaction,
}))

/**
 * Re-export pool for advanced usage
 */
export default pool