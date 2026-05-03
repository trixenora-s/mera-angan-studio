import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Product } from '@/types'

interface CartState {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  restoreItem: (item: CartItem) => void
  removeItem: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, quantity: number) => void
  updateItem: (
    cartItemId: string,
    patch: Partial<Pick<CartItem, 'event_date' | 'event_address_id' | 'event_address_text' | 'custom_notes'>>
  ) => void
  clearCart: () => void
  getItemCount: () => number
  getSubtotal: () => number
  getOriginalTotal: () => number
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        const items = get().items
        const existing = items.find((item) => item.product_id === product.id)

        if (existing) {
          set({
            items: items.map((item) =>
              item.product_id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          })
          return
        }

        const newItem: CartItem = {
          id: crypto.randomUUID(),
          user_id: '',
          product_id: product.id,
          product_name: product.name,
          product_image: product.images?.[0] ?? '/images/product-placeholder.png',
          category_name: product.category_name ?? '',
          price: product.discounted_price ?? product.price,
          original_price: product.price,
          quantity,
          added_at: new Date().toISOString(),
        }

        set({ items: [...items, newItem] })
      },

      restoreItem: (item) =>
        set({ items: [...get().items, item] }),

      removeItem: (cartItemId) =>
        set({ items: get().items.filter((item) => item.id !== cartItemId) }),

      updateQuantity: (cartItemId, quantity) =>
        set({
          items: get().items.map((item) =>
            item.id === cartItemId ? { ...item, quantity: Math.max(1, quantity) } : item
          ),
        }),

      updateItem: (cartItemId, patch) =>
        set({
          items: get().items.map((item) =>
            item.id === cartItemId ? { ...item, ...patch } : item
          ),
        }),

      clearCart: () => set({ items: [] }),

      getItemCount: () => get().items.reduce((count, item) => count + item.quantity, 0),

      getSubtotal: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

      getOriginalTotal: () =>
        get().items.reduce(
          (sum, item) => sum + (item.original_price ?? item.price) * item.quantity,
          0
        ),
    }),
    {
      name: 'event-decor-cart',
    }
  )
)

export const useCartStore = useCart
