import { create } from "zustand"
import { persist } from "zustand/middleware"
import { User } from '@/types'

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
}

interface StoreState {
  cart: {
    items: CartItem[]
    addItem: (item: CartItem) => void
    removeItem: (id: number) => void
    updateQuantity: (id: number, quantity: number) => void
    clearCart: () => void
  }
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
}

const useStore = create<StoreState>()(
  persist(
    (set) => ({
      cart: {
        items: [],
        addItem: (item) =>
          set((state) => {
            const existingItem = state.cart.items.find((i) => i.id === item.id)
            if (existingItem) {
              return {
                cart: {
                  ...state.cart,
                  items: state.cart.items.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)),
                },
              }
            }
            return {
              cart: {
                ...state.cart,
                items: [...state.cart.items, { ...item, quantity: 1 }],
              },
            }
          }),
        removeItem: (id) =>
          set((state) => ({
            cart: {
              ...state.cart,
              items: state.cart.items.filter((i) => i.id !== id),
            },
          })),
        updateQuantity: (id, quantity) =>
          set((state) => ({
            cart: {
              ...state.cart,
              items: state.cart.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
            },
          })),
        clearCart: () => set((state) => ({ cart: { ...state.cart, items: [] } })),
      },
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: "furniture-store-storage",
    },
  ),
)

export default useStore

