# Event Decoration Platform - Setup & Deployment Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
```bash
cp .env.example .env.local
```

Fill in all required values in `.env.local`:

#### Database (Supabase)
- `NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key`
- `SUPABASE_SERVICE_ROLE_KEY=your-service-role-key`

#### Authentication (NextAuth)
- `NEXTAUTH_SECRET=` (Generate: `openssl rand -hex 32`)
- `NEXTAUTH_URL=http://localhost:3000`

#### OAuth (Google)
- `GOOGLE_CLIENT_ID=your-client-id`
- `GOOGLE_CLIENT_SECRET=your-client-secret`

#### Payments (Razorpay)
- `RAZORPAY_KEY_ID=your-key-id`
- `RAZORPAY_KEY_SECRET=your-key-secret`

#### SMS & OTP (Twilio)
- `TWILIO_ACCOUNT_SID=your-account-sid`
- `TWILIO_AUTH_TOKEN=your-auth-token`
- `TWILIO_VERIFY_SERVICE_SID=your-service-sid`

#### Rate Limiting (Upstash Redis)
- `UPSTASH_REDIS_REST_URL=https://your-endpoint.upstash.io`
- `UPSTASH_REDIS_REST_TOKEN=your-token`

#### Email Service (Resend)
- `RESEND_API_KEY=your-api-key`

### 3. Setup Supabase Database

1. Create a Supabase project at https://supabase.com
2. Import the database schema:
```bash
# Connect to your Supabase database and run:
# See supabase-schema.sql for the complete schema
```

3. Create an admin user:
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

### 4. Local Development
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Build for Production
```bash
npm run build
npm run start
```

## 📦 Project Structure

```
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes
│   ├── auth/                 # Authentication pages
│   ├── admin/                # Admin dashboard (protected)
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── components/               # React components
│   ├── home/                 # Home page components
│   ├── events/               # Event listing components
│   ├── product/              # Product detail components
│   ├── cart/                 # Cart components
│   ├── checkout/             # Checkout components
│   ├── auth/                 # Authentication components
│   ├── layout/               # Layout components (Header, Footer)
│   ├── admin/                # Admin components
│   ├── profile/              # Profile components
│   └── ui/                   # Reusable UI components
├── lib/                      # Utility functions
│   ├── auth.ts               # NextAuth configuration
│   ├── supabase.ts           # Supabase client setup
│   ├── rate-limit.ts         # Rate limiting helpers
│   ├── razorpay.ts           # Razorpay integration
│   ├── search.ts             # Search utilities
│   ├── validations.ts        # Zod schemas
│   └── utils.ts              # Helper functions
├── hooks/                    # Custom React hooks
│   ├── useAuth.ts            # Auth hook
│   ├── useCart.ts            # Cart state management
│   ├── useWishlist.ts        # Wishlist state management
│   └── useSearch.ts          # Search hook
├── types/                    # TypeScript types
│   └── index.ts              # All type definitions
├── constants/                # Constants
│   ├── routes.ts             # Route constants
│   └── eventCategories.ts    # Event category constants
├── middleware.ts             # Route protection middleware
├── next.config.js            # Next.js configuration
├── tailwind.config.js        # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration
```

## 🔐 Authentication & Authorization

### User Roles
- **user** (default): Regular customer
- **admin**: Access to admin dashboard

### Protected Routes
- `/profile` - Requires authentication
- `/cart` - Requires authentication
- `/checkout` - Requires authentication
- `/admin/*` - Requires admin role

### Authentication Methods
1. **Google OAuth** - Google Sign-In
2. **Phone OTP** - Twilio SMS verification
3. **Email + Phone** - Sign up and login

## 🛒 E-commerce Features

### Product Catalog
- Browse events by category
- View product details
- See customer reviews and ratings
- Add to wishlist
- Add to cart with quantity selection

### Shopping Cart
- Add/remove items
- Update quantities
- Apply coupons
- View order summary

### Checkout
- Shipping address selection/creation
- Payment gateway integration (Razorpay)
- Order confirmation and tracking

### Admin Dashboard
- View orders and manage status
- Track revenue metrics
- Manage products and inventory
- Review customer feedback
- Update gallery and coupons

## 🔧 Tech Stack

- **Frontend**: React 18, Next.js 14, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js
- **Payment**: Razorpay
- **Notifications**: Resend (Email), Twilio (SMS)
- **Rate Limiting**: Upstash Redis
- **State Management**: Zustand
- **Validation**: Zod
- **UI**: Framer Motion, Lucide Icons

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1920px+)
- Laptop (1280px+)
- Tablet (768px+)
- Mobile (375px+)

## 🚀 Deployment to Vercel

### Step 1: Prepare Repository
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 2: Deploy to Vercel
Option A: Using Vercel CLI
```bash
npm i -g vercel
vercel --prod
```

Option B: Import from GitHub
- Go to [vercel.com/new](https://vercel.com/new)
- Select your GitHub repository
- Configure environment variables
- Deploy

### Step 3: Set Environment Variables
In Vercel project settings, add all variables from `.env.example`:
- Database credentials
- API keys
- OAuth credentials
- Update `NEXTAUTH_URL` to your Vercel domain

### Step 4: Update OAuth Callbacks
After Vercel deployment, update your OAuth providers with the new domain:

**Google Cloud Console:**
```
Authorized redirect URIs:
https://your-domain.vercel.app/api/auth/callback/google
```

## ✅ Pre-Deployment Checklist

- [ ] All dependencies installed
- [ ] Environment variables configured
- [ ] Database schema created
- [ ] Admin user created
- [ ] Local build successful (`npm run build`)
- [ ] All tests passing
- [ ] No console errors or warnings
- [ ] Responsive design verified
- [ ] Authentication flow tested
- [ ] Payment flow tested (Razorpay)
- [ ] Email notifications working
- [ ] Admin dashboard functional
- [ ] Git repository ready
- [ ] Vercel project configured

## 📚 Additional Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **NextAuth Docs**: https://next-auth.js.org/
- **Tailwind Docs**: https://tailwindcss.com/docs
- **Razorpay Docs**: https://razorpay.com/docs/

## 🐛 Troubleshooting

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Database Connection Issues
- Verify Supabase credentials
- Check database schema
- Ensure service role key is correct

### Auth Issues
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain
- Clear browser cookies
- Verify Google OAuth credentials

### Payment Issues
- Verify Razorpay keys
- Check test/production mode
- Review Razorpay dashboard for transactions

## 📞 Support

For issues or questions:
1. Check the documentation files (DEPLOYMENT.md, DEPLOYMENT_CHECKLIST.md)
2. Review error logs in development console
3. Check Vercel deployment logs
4. Consult package documentation

---

**Happy Coding!** 🎉

Version 1.0.0 | Last Updated: May 2026
