export interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  email: string
  created_at: string
  updated_at: string
  role?: 'user' | 'admin'
}

export interface Product {
  id: string
  category_id: string
  name: string
  description: string | null
  short_description: string | null
  price: number
  discounted_price: number | null
  images: string[]
  tags: string[]
  includes: string[]
  duration_hours: number | null
  is_available: boolean
  stock_count: number
  created_at: string
  category_name?: string
  avg_rating?: number | null
  review_count?: number
}

export interface EventCategory {
  id: string
  slug: string
  name: string
  description: string | null
  cover_image_url: string | null
  display_order: number | null
  is_active: boolean
}

export interface Review {
  id: string
  product_id: string
  user_id: string
  order_id: string | null
  rating: number
  title: string | null
  body: string | null
  images: string[]
  is_verified_purchase: boolean
  created_at: string
  full_name?: string
  avatar_url?: string
}

export interface CartItem {
  id: string
  user_id?: string
  product_id: string
  product_name: string
  product_image: string
  category_name?: string
  price: number
  original_price?: number
  quantity: number
  event_date?: string
  event_address_id?: string
  event_address_text?: string
  custom_notes?: string
  added_at?: string
}

export interface Order {
  id: string
  order_number: string
  user_id: string
  address_id: string | null
  subtotal: number
  discount: number
  taxes: number
  total: number
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'refunded'
  payment_status: 'unpaid' | 'paid' | 'refunded' | 'failed'
  payment_method: string | null
  razorpay_order_id: string | null
  razorpay_payment_id: string | null
  event_date: string | null
  special_instructions: string | null
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export interface Address {
  id: string;
  user_id: string;
  label?: string;
  full_address: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  created_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  added_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  product_name: string;
  product_image?: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderTracking {
  id: string;
  order_id: string;
  status: string;
  message?: string;
  updated_by?: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: 'order' | 'promo' | 'system' | 'review';
  is_read: boolean;
  link?: string;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_uses?: number;
  used_count: number;
  valid_from?: string;
  valid_until?: string;
  is_active: boolean;
}

export interface GalleryItem {
  id: string;
  category_id?: string;
  image_url: string;
  caption?: string;
  display_order?: number;
  is_featured: boolean;
}

// Additional types for components
export interface ProductWithRating extends Product {
  rating?: {
    average: number;
    count: number;
  };
}

export interface CartItemWithProduct extends CartItem {
  product: Product;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
  address?: Address;
}