import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const signupSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const addressSchema = z.object({
  label: z.string().optional(),
  full_address: z.string().min(10, 'Address must be at least 10 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  is_default: z.boolean().default(false),
})

export const cartItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().min(1).max(99),
  event_date: z.string().optional(),
  event_address_id: z.string().uuid().optional(),
  custom_notes: z.string().max(500).optional(),
})

export const orderSchema = z.object({
  address_id: z.string().uuid(),
  event_date: z.string().optional(),
  special_instructions: z.string().max(1000).optional(),
})

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  body: z.string().min(10, 'Review must be at least 10 characters').max(1000),
  images: z.array(z.string().url()).max(5).optional(),
})

export const couponSchema = z.object({
  code: z.string().min(3).max(20),
})

export const searchSchema = z.object({
  query: z.string().min(1).max(100),
  category: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  rating: z.number().min(1).max(5).optional(),
})

export type LoginForm = z.infer<typeof loginSchema>
export type SignupForm = z.infer<typeof signupSchema>
export type AddressForm = z.infer<typeof addressSchema>
export type CartItemForm = z.infer<typeof cartItemSchema>
export type OrderForm = z.infer<typeof orderSchema>
export type ReviewForm = z.infer<typeof reviewSchema>
export type CouponForm = z.infer<typeof couponSchema>
export type SearchForm = z.infer<typeof searchSchema>