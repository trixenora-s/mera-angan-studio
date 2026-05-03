# 🚀 Build & Deployment Guide

## Complete Setup & Deployment Instructions

### Phase 1: Local Development Setup

#### 1.1 Install Dependencies
```bash
npm install
```

**What this does:**
- Installs all required npm packages
- Sets up node_modules directory
- Configures Next.js, React, and all dependencies

#### 1.2 Environment Configuration
```bash
# Copy environment template
cp .env.example .env.local
```

**Update `.env.local` with:**
- Supabase credentials (database connection)
- NextAuth credentials (authentication)
- OAuth credentials (Google login)
- Razorpay credentials (payments)
- Twilio credentials (SMS/OTP)
- Upstash Redis credentials (rate limiting)
- Resend API key (email service)

#### 1.3 Database Setup
1. Create Supabase account at https://supabase.com
2. Create a new project
3. Run the schema from `supabase-schema.sql`:
   - Go to SQL Editor in Supabase dashboard
   - Create new query
   - Paste and execute `supabase-schema.sql`
4. Verify tables are created:
   - profiles
   - orders
   - order_items
   - products
   - event_categories
   - gallery_items
   - coupons
   - reviews
   - cart_items
   - addresses
   - notifications
   - contact_submissions

#### 1.4 Admin User Setup
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

#### 1.5 Start Development Server
```bash
npm run dev
```

Access the app at `http://localhost:3000`

---

### Phase 2: Build & Testing

#### 2.1 Build for Production
```bash
npm run build
```

**This:**
- Compiles Next.js application
- Creates optimized build artifacts
- Performs type checking
- Generates static assets

#### 2.2 Run Production Build Locally
```bash
npm run start
```

#### 2.3 Linting & Code Quality
```bash
npm run lint
```

---

### Phase 3: Git Repository

#### 3.1 Initialize Git (if not done)
```bash
git init
git add .
git commit -m "Initial commit: Event decoration platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

#### 3.2 Verify Git Status
```bash
git status
git log --oneline
```

---

### Phase 4: Vercel Deployment

#### 4.1 Deploy via Vercel CLI
```bash
# Install Vercel CLI globally
npm install -g vercel

# Deploy to production
vercel --prod
```

**What happens:**
- Vercel detects Next.js project
- Builds and deploys automatically
- Provides production URL

#### 4.2 Configure Environment Variables in Vercel
In Vercel Dashboard → Project Settings → Environment Variables:

**Add all from `.env.example`:**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXTAUTH_URL (set to your Vercel domain: https://xxxx.vercel.app)
NEXTAUTH_SECRET
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_VERIFY_SERVICE_SID
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
RESEND_API_KEY
```

#### 4.3 Update OAuth Providers
After deployment, add your Vercel URL to OAuth providers:

**Google Cloud Console:**
- Go to Credentials
- Find your OAuth 2.0 Client
- Add to Authorized redirect URIs:
  ```
  https://your-domain.vercel.app/api/auth/callback/google
  ```

---

### Phase 5: Verification Checklist

#### 5.1 Pre-Build Checklist
- [ ] All dependencies installed (`npm install` completed)
- [ ] `.env.local` configured with real credentials
- [ ] Supabase database schema created
- [ ] Admin user created in database
- [ ] No TypeScript errors (`npm run build` passes)

#### 5.2 Development Testing
- [ ] Dev server runs without errors (`npm run dev`)
- [ ] Homepage loads
- [ ] Sign up/login works
- [ ] Admin dashboard accessible (with admin account)
- [ ] Product browsing works
- [ ] Cart functionality works
- [ ] Contact form submits without errors

#### 5.3 Production Build Testing
- [ ] Production build succeeds (`npm run build`)
- [ ] Build size is reasonable
- [ ] Start command works (`npm run start`)
- [ ] All routes accessible
- [ ] API endpoints responding

#### 5.4 Vercel Deployment Testing
- [ ] App deployed successfully
- [ ] All pages load on production
- [ ] Authentication works
- [ ] Admin routes protected
- [ ] No 404 errors
- [ ] Performance metrics good

---

### Phase 6: Post-Deployment

#### 6.1 Monitor Performance
- Check Vercel Analytics dashboard
- Monitor error rates
- Track page load times
- Review API response times

#### 6.2 Enable Auto-Deployments
In Vercel project settings:
- Connect GitHub repository
- Enable automatic deployments on main branch
- Set up preview deployments for pull requests

#### 6.3 Custom Domain (Optional)
1. In Vercel → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXTAUTH_URL` to new domain

#### 6.4 SSL Certificate
- Automatically provisioned by Vercel
- Valid for all Vercel domains

---

## 🔧 Troubleshooting

### Build Fails
```bash
# Clear Next.js cache
rm -rf .next

# Try building again
npm run build
```

### Dependencies Not Found
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Environment Variables Not Working
- Verify `.env.local` exists (local development)
- For Vercel: Check project settings → environment variables
- Ensure `NEXT_PUBLIC_` prefix for client-side variables

### Database Connection Issues
```bash
# Verify credentials in .env.local:
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx
```

### Authentication Issues
- Clear browser cookies
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Verify OAuth credentials in Google Cloud Console

---

## 📊 Project Files Summary

| File | Purpose |
|------|---------|
| `package.json` | Dependencies and scripts |
| `tsconfig.json` | TypeScript configuration |
| `next.config.js` | Next.js configuration |
| `middleware.ts` | Route protection |
| `.env.example` | Environment template |
| `supabase-schema.sql` | Database schema |
| `vercel.json` | Vercel configuration |

---

## 🎯 Deployment Flowchart

```
1. Install Dependencies (npm install)
   ↓
2. Configure Environment (.env.local)
   ↓
3. Setup Supabase Database
   ↓
4. Test Locally (npm run dev)
   ↓
5. Build for Production (npm run build)
   ↓
6. Push to GitHub
   ↓
7. Deploy to Vercel
   ↓
8. Configure Vercel Variables
   ↓
9. Update OAuth Callbacks
   ↓
10. Verify Deployment
   ↓
✅ Live!
```

---

## 💡 Quick Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run linter

# Git
git add .
git commit -m "message"
git push origin main

# Deployment
vercel --prod           # Deploy to Vercel
vercel logs             # View Vercel logs
```

---

## 📞 Need Help?

- **Documentation**: See SETUP.md, DEPLOYMENT.md, DEPLOYMENT_CHECKLIST.md
- **Next.js Issues**: https://nextjs.org/docs
- **Vercel Issues**: https://vercel.com/docs
- **Database Issues**: https://supabase.com/docs
- **Auth Issues**: https://next-auth.js.org/

---

**Version**: 1.0.0  
**Status**: Ready for Production  
**Last Updated**: May 2026
