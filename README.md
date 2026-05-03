# Event Decoration Platform

A modern Next.js 14 application for event decoration services with 3D elements, real-time features, and comprehensive e-commerce functionality.

## Features

- **Next.js 14 App Router** with TypeScript
- **Supabase** for backend, authentication, and database
- **Tailwind CSS** with custom design system
- **Framer Motion** for animations
- **React Three Fiber** for 3D hero elements
- **Zustand** for global state management
- **React Query** for server state
- **NextAuth.js** for authentication
- **Razorpay** for payments
- **Row Level Security (RLS)** enabled on all tables

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **3D Graphics**: React Three Fiber, Drei
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Forms**: React Hook Form + Zod
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Payments**: Razorpay
- **Authentication**: NextAuth.js

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Razorpay account (for payments)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd event-decoration-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in the following variables in `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_string

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Google OAuth (for NextAuth)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

4. Set up Supabase:

   a. Create a new Supabase project
   
   b. Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor
   
   c. Configure authentication providers (Google OAuth)
   
   d. Set up storage buckets for images

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses PostgreSQL with the following main tables:

- `profiles` - User profiles extending Supabase auth
- `addresses` - User addresses
- `event_categories` - Event types (birthdays, weddings, etc.)
- `products` - Decoration packages
- `reviews` - Product reviews
- `cart_items` - Shopping cart
- `wishlist_items` - User wishlists
- `orders` - Order records
- `order_items` - Order line items
- `notifications` - User notifications
- `coupons` - Discount coupons
- `gallery_items` - Image gallery

All tables have Row Level Security (RLS) enabled with appropriate policies.

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Home page
│   ├── globals.css       # Global styles
│   └── ...
├── components/            # React components
│   ├── layout/           # Layout components
│   ├── home/             # Home page components
│   ├── ui/               # Reusable UI components
│   └── ...
├── lib/                  # Utility libraries
│   ├── supabase.ts       # Supabase client
│   ├── auth.ts           # NextAuth config
│   ├── validations.ts    # Zod schemas
│   └── ...
├── hooks/                # Custom React hooks
├── types/                # TypeScript definitions
├── constants/            # App constants
└── supabase-schema.sql   # Database schema
```

## Key Features Implementation

### Authentication
- Google OAuth integration
- Protected routes
- User profile management

### E-commerce
- Product catalog with categories
- Shopping cart with persistence
- Wishlist functionality
- Order management
- Payment integration with Razorpay

### UI/UX
- Responsive design
- Dark/light mode support
- Smooth animations
- 3D hero section (desktop)
- Loading states and skeletons

### Performance
- Image optimization
- Code splitting
- Caching with React Query
- Optimized bundle size

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

### Other Platforms

Ensure the platform supports:
- Next.js 14
- Node.js 18+
- Environment variables configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.