# Supabase → Neon PostgreSQL Migration Guide

This guide walks you through migrating from Supabase to Neon PostgreSQL database.

## ✅ What Changed

### Removed
- Supabase client libraries (`@supabase/supabase-js`, `@supabase/auth-helpers-nextjs`)
- Supabase authentication
- Supabase-managed Row Level Security (RLS) in database

### Added
- Direct PostgreSQL connection via `pg` library
- NextAuth for authentication (already in package.json)
- Server-side database queries
- Neon PostgreSQL database connection

## 🚀 Step 1: Install Required Dependencies

```bash
npm install pg
npm install --save-dev @types/pg
```

## 🔧 Step 2: Create Neon Account & Database

1. Go to [neon.tech](https://neon.tech)
2. Sign up and create a new project
3. Create a PostgreSQL database
4. Copy the connection string (it looks like):
   ```
   postgresql://user:password@ep-xxx.us-east-1.neon.tech/dbname?sslmode=require
   ```

## 📝 Step 3: Update Environment Variables

### Local Development (.env)

```bash
# Copy the connection strings from Neon dashboard
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-1.neon.tech/dbname?sslmode=require"
DIRECT_DATABASE_URL="postgresql://user:password@ep-xxx.us-east-1.neon.tech/dbname?sslmode=require"

# Keep other services
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_generated_with_openssl_rand_-hex_32
RAZORPAY_KEY_ID=...
# ... other vars
```

### Production (Vercel Secrets)

```bash
# Add to Vercel
vercel env add neon_database_url
vercel env add neon_direct_database_url

# When prompted, paste your Neon connection strings
```

## 📊 Step 4: Setup Database Schema

### Option A: Using SQL Editor (Recommended)

1. Log in to [Neon Console](https://console.neon.tech)
2. Go to SQL Editor
3. Copy the SQL from `supabase-schema.sql` 
4. Remove the Supabase auth references (see below)
5. Paste and execute

### Option B: Using psql Command Line

```bash
psql <your-neon-connection-string> < supabase-schema-neon.sql
```

### Database Schema Updates

The `supabase-schema.sql` requires these changes for Neon:

**Remove Supabase-specific auth references:**

```sql
-- REMOVE: The handle_new_user() function and trigger
-- (Supabase-specific)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- REMOVE or MODIFY: References to auth.users table
-- Use user_id from NextAuth instead
```

**Use NextAuth session management instead:**
- NextAuth handles user creation
- Your app will reference user IDs from NextAuth sessions
- No automatic profile creation on signup

## 🔐 Step 5: Setup NextAuth with PostgreSQL

NextAuth already supports PostgreSQL. Update your auth config:

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { db } from '@/lib/supabase' // Now a PostgreSQL client

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Add other providers as needed
  ],
  callbacks: {
    async signIn({ user }) {
      // Create/update user profile in PostgreSQL
      const result = await db.query(
        `INSERT INTO public.profiles (id, email, full_name)
         VALUES ($1, $2, $3)
         ON CONFLICT(email) DO UPDATE SET updated_at = NOW()
         RETURNING *`,
        [user.id, user.email, user.name]
      )
      return true
    },
  },
}

export const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

## 🗄️ Step 6: Update API Routes

### Before (Supabase)
```typescript
import { createClientServer } from '@/lib/supabase'

export async function GET(req: Request) {
  const client = await createClientServer()
  const { data } = await client
    .from('products')
    .select('*')
  return Response.json(data)
}
```

### After (Neon/PostgreSQL)
```typescript
import { query } from '@/lib/supabase'

export async function GET(req: Request) {
  const result = await query('SELECT * FROM public.products')
  return Response.json(result.rows)
}
```

## 🔄 Step 7: Update Database Queries

### Query Pattern

```typescript
import { query, transaction } from '@/lib/supabase'

// Simple query
const result = await query(
  'SELECT * FROM products WHERE id = $1',
  [productId]
)

// With transactions
await transaction([
  {
    text: 'UPDATE orders SET status = $1 WHERE id = $2',
    params: ['completed', orderId]
  },
  {
    text: 'INSERT INTO order_tracking (order_id, status) VALUES ($1, $2)',
    params: [orderId, 'completed']
  }
])
```

## 📋 Step 8: Update Components

Remove all Supabase client imports:

```typescript
// ❌ DELETE THESE
import { createClient } from '@supabase/supabase-js'
import { createClientServer } from '@supabase/auth-helpers-nextjs'

// ✅ USE THESE
import { query } from '@/lib/supabase'
import { useSession } from 'next-auth/react'
```

## 🛡️ Step 9: Row Level Security (Optional)

Instead of database RLS, implement authorization in your API routes:

```typescript
import { getServerSession } from "next-auth/next"

export async function GET(req: Request) {
  const session = await getServerSession()
  
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch only user's own data
  const result = await query(
    'SELECT * FROM orders WHERE user_id = $1',
    [session.user.id]
  )
  
  return Response.json(result.rows)
}
```

## 🧪 Step 10: Testing

```bash
# Test database connection
npm run dev

# Check logs for "Database connection successful"

# Test an API route
curl http://localhost:3000/api/products
```

## 🚢 Step 11: Deploy to Vercel

```bash
# 1. Add Neon secrets to Vercel
vercel env add neon_database_url
vercel env add neon_direct_database_url

# 2. Deploy
vercel deploy --prod

# 3. Check Vercel logs
vercel logs --follow
```

## 📚 Useful Resources

- [Neon Documentation](https://neon.tech/docs)
- [NextAuth.js Docs](https://next-auth.js.org)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [node-postgres (pg) Documentation](https://node-postgres.com)

## 🆘 Troubleshooting

### Connection Refused
```
Error: connect ECONNREFUSED
```
- Check DATABASE_URL is correct
- Verify Neon IP whitelist allows your IP
- Ensure sslmode=require is in connection string

### Table Not Found
```
Error: relation "public.products" does not exist
```
- Run the schema SQL script in Neon
- Check table names match your queries

### NextAuth Not Creating Users
- Ensure signIn callback creates profile
- Check query returns data correctly
- Verify user_id is being captured

### Pool Exhausted
```
Error: Client has timed out acquiring a connection from the pool
```
- Increase pool max in `lib/supabase.ts`
- Check for connection leaks in queries
- Use transactions for bulk operations

## ✨ Next Steps

1. ✅ Environment variables configured
2. ✅ Database schema imported to Neon
3. ✅ API routes updated to use PostgreSQL
4. ✅ NextAuth authentication working
5. 🔄 Deploy to Vercel
6. 📊 Monitor database in Neon dashboard

## 📞 Support

For issues:
- Check [Neon Docs](https://neon.tech/docs)
- Review [NextAuth Examples](https://github.com/nextauthjs/next-auth-example)
- Check PostgreSQL query syntax
