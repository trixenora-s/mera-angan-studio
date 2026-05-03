# Supabase → Neon Migration Quick Reference

## 📋 Checklist

- [ ] Install `pg` package: `npm install pg @types/pg`
- [ ] Get Neon connection URL from [console.neon.tech](https://console.neon.tech)
- [ ] Update `.env` with `DATABASE_URL` and `DIRECT_DATABASE_URL`
- [ ] Import schema using `supabase-schema-neon.sql`
- [ ] Replace Supabase imports with new database client
- [ ] Update API routes to use `query()` instead of `.from().select()`
- [ ] Configure NextAuth with PostgreSQL
- [ ] Test locally with `npm run dev`
- [ ] Add secrets to Vercel
- [ ] Deploy and monitor

## 🔄 Code Migration Examples

### Imports
```typescript
// ❌ REMOVE
import { createClient } from '@supabase/supabase-js'
import { createClientServer } from '@supabase/auth-helpers-nextjs'

// ✅ ADD
import { query, transaction } from '@/lib/supabase'
import { getServerSession } from 'next-auth/react'
```

### SELECT Query
```typescript
// ❌ Before (Supabase)
const { data } = await client.from('products').select('*')

// ✅ After (Neon)
const result = await query('SELECT * FROM public.products')
return result.rows
```

### SELECT with WHERE
```typescript
// ❌ Before
const { data } = await client
  .from('products')
  .select('*')
  .eq('id', productId)

// ✅ After
const result = await query(
  'SELECT * FROM public.products WHERE id = $1',
  [productId]
)
return result.rows[0]
```

### SELECT with Multiple Conditions
```typescript
// ❌ Before
const { data } = await client
  .from('products')
  .select('*')
  .eq('category_id', categoryId)
  .gte('price', minPrice)
  .lte('price', maxPrice)

// ✅ After
const result = await query(
  `SELECT * FROM public.products 
   WHERE category_id = $1 AND price >= $2 AND price <= $3`,
  [categoryId, minPrice, maxPrice]
)
return result.rows
```

### INSERT
```typescript
// ❌ Before
const { data } = await client
  .from('products')
  .insert([{ name: 'Product', price: 100 }])
  .select()

// ✅ After
const result = await query(
  `INSERT INTO public.products (name, price) 
   VALUES ($1, $2) RETURNING *`,
  ['Product', 100]
)
return result.rows[0]
```

### UPDATE
```typescript
// ❌ Before
const { data } = await client
  .from('products')
  .update({ price: 150 })
  .eq('id', productId)
  .select()

// ✅ After
const result = await query(
  `UPDATE public.products SET price = $1 WHERE id = $2 RETURNING *`,
  [150, productId]
)
return result.rows[0]
```

### DELETE
```typescript
// ❌ Before
await client.from('products').delete().eq('id', productId)

// ✅ After
const result = await query(
  'DELETE FROM public.products WHERE id = $1 RETURNING *',
  [productId]
)
```

### Transaction
```typescript
// ❌ Before
const { data: order } = await client
  .from('orders')
  .insert([orderData])
  .select()

const { data: items } = await client
  .from('order_items')
  .insert(itemsData)

// ✅ After
const results = await transaction([
  {
    text: 'INSERT INTO public.orders (...) VALUES (...) RETURNING *',
    params: [...orderData]
  },
  {
    text: 'INSERT INTO public.order_items (...) VALUES (...)',
    params: [...itemsData]
  }
])
```

### Join Query
```typescript
// ❌ Before
const { data } = await client
  .from('orders')
  .select('*, order_items(*)')
  .eq('id', orderId)

// ✅ After
const result = await query(
  `SELECT o.*, json_agg(oi) as order_items
   FROM public.orders o
   LEFT JOIN public.order_items oi ON o.id = oi.order_id
   WHERE o.id = $1
   GROUP BY o.id`,
  [orderId]
)
```

### Auth Check
```typescript
// ❌ Before (Supabase Auth)
const { data: { session } } = await client.auth.getSession()
if (!session) return error

// ✅ After (NextAuth)
const session = await getServerSession()
if (!session?.user?.id) return error
```

## 🗄️ Database Operators

### Where Conditions
```typescript
// Equals
'WHERE column = $1'

// Not equals
'WHERE column != $1'

// Greater than
'WHERE column > $1'

// Less than
'WHERE column < $1'

// Greater than or equal
'WHERE column >= $1'

// Less than or equal
'WHERE column <= $1'

// IN list
'WHERE column IN ($1, $2, $3)'

// LIKE (pattern matching)
'WHERE column LIKE $1'

// ILIKE (case-insensitive pattern)
'WHERE column ILIKE $1'

// IS NULL
'WHERE column IS NULL'

// IS NOT NULL
'WHERE column IS NOT NULL'

// AND
'WHERE column1 = $1 AND column2 = $2'

// OR
'WHERE column1 = $1 OR column2 = $2'
```

### Aggregation Functions
```typescript
// Count
'SELECT COUNT(*) FROM table'

// Sum
'SELECT SUM(amount) FROM table'

// Average
'SELECT AVG(price) FROM table'

// Min
'SELECT MIN(price) FROM table'

// Max
'SELECT MAX(price) FROM table'

// Group by
'SELECT category, COUNT(*) FROM table GROUP BY category'

// Having clause
'SELECT category, COUNT(*) FROM table GROUP BY category HAVING COUNT(*) > 5'
```

### Ordering & Limiting
```typescript
// Order ascending
'ORDER BY column ASC'

// Order descending
'ORDER BY column DESC'

// Limit results
'LIMIT 10'

// Offset (pagination)
'OFFSET 20'

// Combined
'ORDER BY created_at DESC LIMIT 20 OFFSET 40'
```

## 🔐 Environment Variables

### Local (.env)
```bash
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
DIRECT_DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret
# ... other vars
```

### Vercel
```bash
vercel env add neon_database_url
vercel env add neon_direct_database_url
vercel env add nextauth_url
vercel env add nextauth_secret
# ... other secrets
```

## 🆘 Common Issues & Solutions

### "connect ECONNREFUSED"
- Check DATABASE_URL is correct
- Verify IP whitelist in Neon
- Ensure SSL mode is enabled

### "relation does not exist"
- Run schema SQL: `supabase-schema-neon.sql`
- Check table name spelling
- Verify schema is `public`

### "too many connections"
- Increase pool size in `lib/supabase.ts`
- Check for connection leaks
- Use transactions for bulk operations

### "permission denied"
- Use correct credentials in DATABASE_URL
- Verify database user has correct permissions
- Check role in Neon console

## 🔗 Resources

| Resource | Link |
|----------|------|
| Neon Docs | https://neon.tech/docs |
| NextAuth | https://next-auth.js.org |
| PostgreSQL | https://www.postgresql.org/docs |
| node-postgres | https://node-postgres.com |
| SQL Syntax | https://www.postgresql.org/docs/current/sql-syntax.html |

## 📞 Support Commands

```bash
# Check database connection
npm run dev

# View Neon console
open https://console.neon.tech

# Run migrations
psql $DATABASE_URL < migrations/001_schema.sql

# Connect to database directly
psql $DATABASE_URL

# Deploy to Vercel
vercel deploy --prod

# View Vercel logs
vercel logs --follow
```

## ⚡ Performance Tips

1. **Use Indexes** - Already set up in schema
2. **Parameterized Queries** - Prevents SQL injection
3. **Transactions** - Keep data consistent
4. **Connection Pooling** - Use `pg.Pool`
5. **Full-Text Search** - Use `search_vector` for fast queries
6. **Pagination** - Use `LIMIT` and `OFFSET`
7. **Caching** - Cache frequent queries
8. **Batch Operations** - Use transactions for multiple inserts

## 🎯 Next: Configure Components

Search & update these files:
1. `app/api/` - All API routes
2. `hooks/` - Custom hooks using database
3. `lib/` - Utility functions
4. `middleware.ts` - Any auth middleware

Replace all Supabase calls with new `query()` function.
