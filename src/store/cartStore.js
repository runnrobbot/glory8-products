import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      addItem: (product, qty = 1) => {
        const items = get().items
        const existing = items.find((i) => i.product.id === product.id)
        if (existing) {
          set({
            items: items.map((i) =>
              i.product.id === product.id
                ? { ...i, quantity: i.quantity + qty }
                : i
            ),
          })
        } else {
          set({ items: [...items, { product, quantity: qty }] })
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.product.id !== productId) })
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set({
          items: get().items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          ),
        })
      },

      clearCart: () => set({ items: [] }),

      get totalItems() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0)
      },

      get subtotal() {
        return get().items.reduce(
          (sum, i) => sum + (i.product.price || 0) * i.quantity,
          0
        )
      },

      buildWhatsAppMessage: (notes = '') => {
        const items = get().items
        if (!items.length) return ''

        const lines = items.map(
          (i) =>
            `• ${i.product.name} (${i.product.category_name || 'Material'}) x${i.quantity} = Rp ${((i.product.price || 0) * i.quantity).toLocaleString('id-ID')}`
        )
        const subtotal = get().subtotal

        const msg = [
          '*GLORY8 – Order Baru*',
          '─────────────────────',
          '*Produk Yang Dipesan:*',
          ...lines,
          '─────────────────────',
          `*Subtotal: Rp ${subtotal.toLocaleString('id-ID')}*`,
          notes ? `\n*Catatan:* ${notes}` : '',
          '\n_Mohon konfirmasi ketersediaan stok dan estimasi pengiriman. Terima kasih!_',
        ]
          .filter(Boolean)
          .join('\n')

        return encodeURIComponent(msg)
      },
    }),
    {
      name: 'glory8-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
)
