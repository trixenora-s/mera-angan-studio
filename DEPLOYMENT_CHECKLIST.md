# Deployment Checklist & Setup Instructions

Before deploying to Vercel, ensure the following steps are completed:

## Pre-Deployment Checklist

### 1. Local Build Test
```bash
npm install
npm run build
npm run dev
```

### 2. Environment Variables
- [ ] Copy `.env.example` to `.env.local`
- [ ] Fill in all required environment variables
- [ ] Verify `NEXTAUTH_SECRET` is generated with: `openssl rand -hex 32`
- [ ] Test local auth flow (login, signup, profile)

### 3. Database Setup
- [ ] Supabase project created
- [ ] Database schema imported from `supabase-schema.sql`
- [ ] All required tables exist:
  - `profiles` (with `role` field for admin)
  - `orders`
  - `order_items`
  - `products`
  - `event_categories`
  - `gallery_items`
  - `coupons`
  - `reviews`
  - `cart_items`
  - `addresses`
  - `notifications`
  - `contact_submissions`

### 4. External Services
- [ ] Supabase credentials configured
- [ ] Google OAuth credentials obtained
- [ ] Razorpay account and keys obtained
- [ ] Twilio Verify service configured
- [ ] Upstash Redis connection created
- [ ] Resend email service API key obtained

### 5. Code Quality
- [ ] No TypeScript errors: `npm run lint`
- [ ] Admin protection implemented (middleware + requireAdmin)
- [ ] All routes protected correctly
- [ ] API endpoints validated

### 6. Git Repository
- [ ] Project pushed to GitHub/GitLab/Bitbucket
- [ ] `.gitignore` configured
- [ ] No sensitive data in commits

## Vercel Deployment Steps

### 1. Initialize Git (if not done)
```bash
git init
git add .
git commit -m "Initial commit: Event decoration platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Deploy to Vercel

#### Option A: Vercel CLI
```bash
npm install -g vercel
vercel --prod
```

#### Option B: Vercel Dashboard
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure project settings
4. Add environment variables

#### Option C: GitHub Integration
1. Push to GitHub
2. Connect Vercel to your GitHub account
3. Select repository and branch
4. Add environment variables

### 3. Add Vercel Environment Variables

In your Vercel project dashboard, add these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_value
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_value
SUPABASE_SERVICE_ROLE_KEY=your_value
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_generated_secret
RAZORPAY_KEY_ID=your_value
RAZORPAY_KEY_SECRET=your_value
GOOGLE_CLIENT_ID=your_value
GOOGLE_CLIENT_SECRET=your_value
TWILIO_ACCOUNT_SID=your_value
TWILIO_AUTH_TOKEN=your_value
TWILIO_VERIFY_SERVICE_SID=your_value
UPSTASH_REDIS_REST_URL=your_value
UPSTASH_REDIS_REST_TOKEN=your_value
RESEND_API_KEY=your_value
```

### 4. Update OAuth Callbacks

After Vercel deployment, update OAuth providers:

**Google Cloud Console:**
- Authorized redirect URIs: `https://your-domain.vercel.app/api/auth/callback/google`

**Other OAuth providers:**
- Update callback URLs to point to your Vercel domain

### 5. Test Deployment

```bash
# Test main features:
- [ ] Homepage loads
- [ ] Sign up/login works
- [ ] Profile access requires auth
- [ ] Admin pages restricted to admin users
- [ ] Product pages load
- [ ] Cart functionality works
- [ ] Checkout flow completes
- [ ] Admin dashboard accessible (if admin user)
- [ ] Contact form submission works
```

## Post-Deployment

### 1. Set Admin User
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@example.com';
```

### 2. Monitor Deployment
- Check Vercel Analytics dashboard
- Monitor error logs
- Track performance metrics

### 3. Set Up Auto-Deployments
In Vercel project settings:
- [ ] Enable automatic deployments on main branch
- [ ] Configure preview deployments for pull requests
- [ ] Set up deployment notifications

### 4. Custom Domain (Optional)
1. Go to Vercel project settings
2. Add custom domain
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` environment variable

## Troubleshooting

### Build Fails
- Check Vercel build logs
- Verify all environment variables are set
- Ensure TypeScript compiles locally

### 500 Errors
- Check Vercel function logs
- Verify Supabase connectivity
- Check API endpoint errors

### Auth Not Working
- Verify `NEXTAUTH_URL` is correct (without trailing slash)
- Check Google OAuth credentials
- Clear browser cookies
- Verify `NEXTAUTH_SECRET` is set

### Database Errors
- Verify Supabase service role key
- Check database schema
- Ensure all tables exist
- Test Supabase connection

## Files Ready for Deployment

✅ `.env.example` - Template for environment variables
✅ `.gitignore` - Git ignore configuration
✅ `.vercelignore` - Files to exclude from Vercel
✅ `vercel.json` - Vercel configuration
✅ `DEPLOYMENT.md` - Detailed deployment guide
✅ `next.config.js` - Optimized for production
✅ `tsconfig.json` - TypeScript configuration
✅ `middleware.ts` - Route protection middleware
✅ `lib/auth.ts` - NextAuth configuration with role support
✅ `app/api/admin/*` - Admin API routes with protection

## Next Steps After Deployment

1. **Monitor Performance**
   - Set up error tracking (Sentry, LogRocket)
   - Monitor API response times
   - Track user engagement

2. **Security**
   - Enable CORS if needed
   - Set up rate limiting
   - Enable API key rotation

3. **Scaling**
   - Monitor database queries
   - Set up CDN for static assets
   - Consider caching strategies

4. **Maintenance**
   - Regular security updates
   - Database maintenance
   - Backup strategy

## Support

- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **NextAuth Docs**: https://next-auth.js.org/

---

**Version**: 1.0.0  
**Last Updated**: May 2026  
**Status**: Ready for Deployment
