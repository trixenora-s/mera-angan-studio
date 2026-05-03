import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface WishlistState {
  productIds: string[]
  toggleProduct: (productId: string) => void
  clearWishlist: () => void
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      toggleProduct: (productId: string) =>
        set((state) => {
          const exists = state.productIds.includes(productId)
          return {
            productIds: exists
              ? state.productIds.filter((id) => id !== productId)
              : [...state.productIds, productId],
          }
        }),
      clearWishlist: () => set({ productIds: [] }),
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)