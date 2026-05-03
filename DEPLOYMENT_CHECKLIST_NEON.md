# Neon Deployment Checklist

Complete this checklist before deploying your application to production.

## ✅ Local Setup

- [ ] Install dependencies: `npm install pg @types/pg`
- [ ] Get Neon connection URL from [console.neon.tech](https://console.neon.tech)
- [ ] Update `.env` with database URLs
- [ ] Database schema imported to Neon
- [ ] Test locally: `npm run dev`
- [ ] All API routes updated to use `query()` function
- [ ] NextAuth configured for PostgreSQL
- [ ] No Supabase imports remaining in codebase
- [ ] Test database queries work locally

## 🔐 Security

- [ ] `DATABASE_URL` added to `.env.local` (not committed to git)
- [ ] `.env.local` in `.gitignore`
- [ ] No credentials in code comments
- [ ] SSL mode enabled in connection string (`?sslmode=require`)
- [ ] Row-level authorization in API routes (not database RLS)
- [ ] NextAuth secret generated: `openssl rand -hex 32`
- [ ] Environment variables use strong values

## 🧪 Testing

- [ ] Run `npm run build` - no errors
- [ ] Run `npm run dev` - app starts
- [ ] Test user registration with NextAuth
- [ ] Test user login
- [ ] Test creating an order (POST)
- [ ] Test viewing user's orders (GET with auth)
- [ ] Test updating order status (admin only)
- [ ] Test product search
- [ ] Test pagination
- [ ] Test error scenarios

## 📊 Database

- [ ] All tables created in Neon
- [ ] All indexes present: `\d` in psql
- [ ] All functions working: `SELECT * FROM pg_proc WHERE schemaname = 'public'`
- [ ] Sample data inserted (optional)
- [ ] Full-text search tested
- [ ] Aggregation functions working
- [ ] Transactions working

## 🚀 Vercel Deployment

### Step 1: Add Secrets
```bash
vercel env add neon_database_url
# Paste your Neon DATABASE_URL

vercel env add neon_direct_database_url
# Paste your Neon DIRECT_DATABASE_URL

vercel env add nextauth_url
# https://yourdomain.vercel.app

vercel env add nextauth_secret
# Generate with: openssl rand -hex 32

# Add other service secrets
vercel env add razorpay_key_id
vercel env add razorpay_key_secret
# ... continue for all secrets
```

### Step 2: Verify vercel.json
- [ ] `vercel.json` updated with Neon secrets
- [ ] All secret references use `@secret_name` format
- [ ] No Supabase references remain

### Step 3: Deploy
```bash
# Deploy to production
vercel deploy --prod

# Check deployment
vercel ls

# View logs
vercel logs --follow
```

- [ ] Build completed successfully
- [ ] No build errors
- [ ] Deployments page shows "Ready"

## 🔍 Post-Deployment Verification

- [ ] Website loads
- [ ] Navigation works
- [ ] Product pages load
- [ ] Search functionality works
- [ ] User can sign up with Google OAuth
- [ ] User can view their profile
- [ ] User can add items to cart
- [ ] User can view orders (if any)
- [ ] Admin panel accessible (if admin user)
- [ ] Email notifications sent (if configured)
- [ ] Payment flow works (test with Razorpay)

## 📈 Monitoring

### Neon Console
- [ ] Check connection count
- [ ] Monitor query performance
- [ ] Review database size
- [ ] Check for errors in logs

### Vercel Dashboard
- [ ] Check deployment status
- [ ] Review function execution time
- [ ] Monitor error rate
- [ ] Check logs for errors

### Application Monitoring (Optional)
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Set up analytics
- [ ] Set up performance monitoring
- [ ] Set up database query monitoring

## 🆘 If Issues Arise

### Database Connection Error
1. Verify DATABASE_URL in Vercel secrets
2. Check Neon IP whitelist includes Vercel IPs
3. Test connection locally
4. Check SSL mode is enabled

### Function Timeout
1. Optimize database queries
2. Increase function timeout in Vercel
3. Add query indexes
4. Use pagination for large result sets

### Application Crash
1. Check Vercel logs: `vercel logs --follow`
2. Check Neon logs for database errors
3. Review recent code changes
4. Roll back if needed

## 🔄 Rollback Plan

If deployment fails:

```bash
# Revert to previous deployment
vercel rollback

# Check previous deployment
vercel ls

# Or redeploy from git
git revert HEAD
git push
# Wait for automatic deployment
```

## ✨ Post-Launch

- [ ] User feedback collected
- [ ] Performance monitored for 24-48 hours
- [ ] No critical errors reported
- [ ] Database running smoothly
- [ ] Backups configured (Neon does automatic backups)
- [ ] Team trained on new database system
- [ ] Documentation updated
- [ ] Old Supabase account can be deleted (after confirmation)

## 📝 Notes

**Database Migration Details:**
- Old Supabase database: qebawwfpbnlsvreqxljw
- New Neon database: [Your Neon project name]
- Migration date: [Date]
- Completed by: [Your name]

**Important Contacts:**
- Neon Support: https://neon.tech/docs/contact-us
- Vercel Support: https://vercel.com/support
- NextAuth Issues: https://github.com/nextauthjs/next-auth/issues

---

**Last Updated:** $(date)
**Status:** ⏳ Pending
