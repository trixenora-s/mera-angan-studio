# Vercel Deployment Guide

This guide will help you deploy the Event Decoration Platform to Vercel.

## Prerequisites

- Vercel account (https://vercel.com)
- Git repository (GitHub, GitLab, or Bitbucket)
- All environment variables set up (see `.env.example`)

## Step 1: Prepare Environment Variables

Copy `.env.example` to `.env.local` and fill in all required values:

```bash
cp .env.example .env.local
```

### Required Environment Variables for Vercel

**Supabase:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (server-side only)

**Authentication (NextAuth):**
- `NEXTAUTH_URL` - Set to your Vercel deployment URL (e.g., `https://yourdomain.vercel.app`)
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -hex 32`

**Google OAuth:**
- `GOOGLE_CLIENT_ID` - From Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console

**Razorpay (Payments):**
- `RAZORPAY_KEY_ID` - From Razorpay dashboard
- `RAZORPAY_KEY_SECRET` - From Razorpay dashboard

**Twilio (SMS/Phone OTP):**
- `TWILIO_ACCOUNT_SID` - From Twilio console
- `TWILIO_AUTH_TOKEN` - From Twilio console
- `TWILIO_VERIFY_SERVICE_SID` - From Twilio Verify service

**Upstash Redis (Rate Limiting):**
- `UPSTASH_REDIS_REST_URL` - From Upstash console
- `UPSTASH_REDIS_REST_TOKEN` - From Upstash console

**Resend (Email):**
- `RESEND_API_KEY` - From Resend dashboard

**Social Media (Optional):**
- `NEXT_PUBLIC_INSTAGRAM_URL`
- `NEXT_PUBLIC_FACEBOOK_URL`
- `NEXT_PUBLIC_TWITTER_URL`
- `NEXT_PUBLIC_LINKEDIN_URL`

## Step 2: Push to Git Repository

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

## Step 3: Deploy to Vercel

### Option A: Using Vercel CLI

```bash
npm install -g vercel
vercel
```

Follow the prompts to:
1. Link your Git repository
2. Set environment variables
3. Deploy

### Option B: Using Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Configure project settings
4. Add environment variables
5. Deploy

### Option C: GitHub Integration

1. Go to [vercel.com/new](https://vercel.com/new)
2. Select your GitHub repository
3. Vercel will auto-detect Next.js settings
4. Add environment variables in Vercel dashboard
5. Deploy

## Step 4: Add Environment Variables in Vercel

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add each variable from `.env.example`
3. For sensitive values (like API keys), use Vercel's secure storage
4. Ensure public variables are marked as `NEXT_PUBLIC_*`

## Step 5: Configure NEXTAUTH_URL

After deployment, update `NEXTAUTH_URL` in Vercel:

1. Go to **Settings** → **Environment Variables**
2. Update `NEXTAUTH_URL` to your Vercel domain (e.g., `https://myapp.vercel.app`)
3. Redeploy

## Step 6: Update OAuth Providers

Update your OAuth provider settings with the new Vercel domain:

**Google Cloud Console:**
- Add authorized redirect URI: `https://yourdomain.vercel.app/api/auth/callback/google`

**Other providers:**
- Update any callback URLs to point to your Vercel deployment

## Deployment Checklist

- [ ] All environment variables are set in Vercel
- [ ] `NEXTAUTH_URL` points to your Vercel domain
- [ ] Supabase credentials are correct
- [ ] Google OAuth client ID/secret are set
- [ ] Razorpay keys are configured
- [ ] Twilio credentials are added
- [ ] Upstash Redis connection is working
- [ ] Resend API key is set
- [ ] Build succeeds locally (`npm run build`)
- [ ] Database schema is created in Supabase

## Troubleshooting

### Build Fails

Check the build logs in Vercel dashboard. Common issues:
- Missing environment variables
- Type errors in TypeScript
- Module import errors

### 500 Internal Server Error

- Check Vercel logs for API route errors
- Verify all environment variables are set
- Check Supabase connection

### Authentication Issues

- Verify `NEXTAUTH_URL` is correct
- Check Google OAuth redirect URIs
- Clear browser cookies and try again

### Database Errors

- Ensure Supabase schema is created
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- Check database permissions

## Production Optimizations

1. **Enable Image Optimization:**
   - Vercel automatically optimizes Next.js images
   - Ensure `next/image` is used for all images

2. **Set up Analytics:**
   - Enable Web Analytics in Vercel dashboard
   - Monitor performance metrics

3. **Configure Caching:**
   - Set appropriate cache headers for static assets
   - Use ISR (Incremental Static Regeneration) for dynamic content

4. **Monitor Errors:**
   - Set up error tracking (Sentry, etc.)
   - Monitor API endpoint performance

## Rollback

To rollback to a previous deployment:

1. Go to **Deployments** in Vercel dashboard
2. Find the previous deployment
3. Click the three dots and select "Promote to Production"

## Support

For issues with:
- **Next.js**: https://nextjs.org/docs
- **Vercel**: https://vercel.com/docs
- **Supabase**: https://supabase.com/docs
- **NextAuth**: https://next-auth.js.org/
