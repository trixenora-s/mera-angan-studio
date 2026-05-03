-- Neon PostgreSQL Database Schema
-- Event Decoration Platform
-- Compatible with NextAuth for authentication

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- USERS/PROFILES TABLE (works with NextAuth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id VARCHAR(255) PRIMARY KEY,  -- NextAuth session userId or email
  full_name TEXT,
  phone TEXT UNIQUE,
  avatar_url TEXT,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ADDRESSES
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE CASCADE,
  label TEXT,
  full_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EVENT CATEGORIES
CREATE TABLE IF NOT EXISTS public.event_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  display_order INTEGER,
  is_active BOOLEAN DEFAULT TRUE
);

-- PRODUCTS (decoration packages per event)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.event_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  price NUMERIC(10,2) NOT NULL,
  discounted_price NUMERIC(10,2),
  images TEXT[],
  tags TEXT[],
  includes TEXT[],
  duration_hours INTEGER,
  is_available BOOLEAN DEFAULT TRUE,
  stock_count INTEGER DEFAULT 99,
  search_vector tsvector,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- REVIEWS (only from verified purchasers)
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  user_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  body TEXT,
  images TEXT[],
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, user_id, order_id)
);

-- CART (persistent, synced to user account)
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  event_date DATE,
  event_address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
  custom_notes TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- WISHLIST
CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id VARCHAR(255) REFERENCES public.profiles(id),
  address_id UUID REFERENCES public.addresses(id),
  subtotal NUMERIC(10,2) NOT NULL,
  discount NUMERIC(10,2) DEFAULT 0,
  taxes NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','in_progress',
                      'completed','cancelled','refunded')),
  payment_status TEXT DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid','paid','refunded','failed')),
  payment_method TEXT,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  event_date DATE,
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  product_image TEXT,
  unit_price NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL
);

-- ORDER TRACKING
CREATE TABLE IF NOT EXISTS public.order_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  message TEXT,
  updated_by TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT CHECK (type IN ('order','promo','system','review')),
  is_read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- COUPONS
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT CHECK (discount_type IN ('percentage','fixed')),
  discount_value NUMERIC(10,2) NOT NULL,
  min_order_amount NUMERIC(10,2) DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE
);

-- GALLERY
CREATE TABLE IF NOT EXISTS public.gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.event_categories(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER,
  is_featured BOOLEAN DEFAULT FALSE
);

-- CONTACT SUBMISSIONS
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  event_type TEXT,
  event_date DATE,
  budget_range TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FUNCTIONS

-- Update search vector on products
CREATE OR REPLACE FUNCTION update_products_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector =
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_search_vector_trigger
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_products_search_vector();

-- Auto-generate order_number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  year TEXT;
  sequence_number INTEGER;
  order_number TEXT;
BEGIN
  year := EXTRACT(YEAR FROM NOW())::TEXT;
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 'EVT-\d{4}-(\d+)') AS INTEGER)), 0) + 1
  INTO sequence_number
  FROM public.orders
  WHERE order_number LIKE 'EVT-' || year || '-%';

  order_number := 'EVT-' || year || '-' || LPAD(sequence_number::TEXT, 6, '0');
  RETURN order_number;
END;
$$ LANGUAGE plpgsql;

-- Update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Get product rating function - returns NULL if no reviews exist
CREATE OR REPLACE FUNCTION get_product_rating(product_id UUID)
RETURNS TABLE(avg_rating NUMERIC, review_count BIGINT) AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.reviews WHERE reviews.product_id = $1 AND is_verified_purchase = true) THEN
    RETURN QUERY
    SELECT
      ROUND(AVG(rating)::NUMERIC, 1) as avg_rating,
      COUNT(*) as review_count
    FROM public.reviews
    WHERE reviews.product_id = $1 AND is_verified_purchase = true;
  ELSE
    RETURN QUERY SELECT NULL::NUMERIC, NULL::BIGINT;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can review a product (has completed order)
CREATE OR REPLACE FUNCTION can_user_review_product(user_id VARCHAR(255), product_id UUID, order_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.order_items oi ON o.id = oi.order_id
    WHERE o.user_id = $1
      AND oi.product_id = $2
      AND o.id = $3
      AND o.status = 'completed'
      AND o.payment_status = 'paid'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_search ON public.products USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON public.products USING GIN(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id ON public.wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_tracking_order_id ON public.order_tracking(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON public.coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_gallery_items_category_id ON public.gallery_items(category_id);
CREATE INDEX IF NOT EXISTS idx_event_categories_slug ON public.event_categories(slug);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON public.contact_submissions(created_at DESC);

-- COMMENTS (Documentation)
COMMENT ON TABLE public.profiles IS 'User profiles - synchronized with NextAuth sessions';
COMMENT ON TABLE public.products IS 'Event decoration packages with full-text search support';
COMMENT ON TABLE public.orders IS 'Customer orders with payment tracking via Razorpay';
COMMENT ON COLUMN public.products.search_vector IS 'Full-text search index for product discovery';
COMMENT ON COLUMN public.orders.razorpay_order_id IS 'Reference to Razorpay payment order';
