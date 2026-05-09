import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { formatCurrency, getPrimaryImage } from '@/lib/utils'
import WhatsAppOrderModal from '@/components/shared/WhatsAppOrderModal'

export default function CartDrawer() {
  const [showOrderModal, setShowOrderModal] = useState(false)
  const { isOpen, closeCart, items, updateQuantity, removeItem } = useCartStore()

  const subtotal = items.reduce((s, i) => s + (i.product.price || 0) * i.quantity, 0)

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={closeCart}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-md bg-white flex flex-col h-full shadow-luxury-lg"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E4DC]">
                <div className="flex items-center gap-3">
                  <ShoppingBag size={18} strokeWidth={1.5} className="text-[#C9A455]" />
                  <h2 className="font-display text-xl font-light text-gray-800">Keranjang</h2>
                  {items.length > 0 && (
                    <span className="text-[10px] bg-[#FDF6E7] text-[#B8933F] font-body font-semibold px-2 py-0.5 rounded-full">
                      {items.reduce((s, i) => s + i.quantity, 0)} item
                    </span>
                  )}
                </div>
                <button onClick={closeCart} className="p-1 text-[#9C9890] hover:text-[#6B7280] transition-colors">
                  <X size={18} strokeWidth={1.5} />
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 bg-[#FAF8F4] rounded-full flex items-center justify-center mb-4">
                      <ShoppingBag size={24} strokeWidth={1} className="text-gray-300" />
                    </div>
                    <p className="font-display text-xl font-light text-[#9C9890]">Keranjang Kosong</p>
                    <p className="font-body text-sm text-[#9C9890] mt-2">Tambahkan produk untuk melanjutkan</p>
                    <button onClick={closeCart} className="btn-primary mt-6 text-xs">
                      Lihat Produk
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence>
                      {items.map((item) => {
                        const image = getPrimaryImage(item.product.product_images)
                        return (
                          <motion.div
                            key={item.product.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex gap-3 py-4 border-b border-[#E8E4DC] last:border-0"
                          >
                            {/* Thumbnail — ukuran tetap, tidak besar di mobile */}
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#F5F2EC] flex-shrink-0 overflow-hidden rounded-sm">
                              {image ? (
                                <img src={image} alt={item.product.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-[#E8E4DC] flex items-center justify-center">
                                  <span className="text-gray-300 text-xs font-display">G8</span>
                                </div>
                              )}
                            </div>
                            {/* Konten — grow, tidak overflow */}
                            <div className="flex-1 min-w-0">
                              <p className="font-body text-sm font-medium text-gray-800 leading-snug line-clamp-2">
                                {item.product.name}
                              </p>
                              <p className="font-body text-xs text-[#C9A455] mt-0.5">
                                {formatCurrency(item.product.price)}
                              </p>
                              {/* Row: qty control + total + hapus */}
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <div className="flex items-center border border-[#E8E4DC]">
                                  <button
                                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                    className="p-1.5 text-[#9C9890] hover:text-gray-700 transition-colors"
                                  >
                                    <Minus size={11} strokeWidth={1.5} />
                                  </button>
                                  <span className="w-7 text-center font-body text-sm text-gray-700">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                    className="p-1.5 text-[#9C9890] hover:text-gray-700 transition-colors"
                                  >
                                    <Plus size={11} strokeWidth={1.5} />
                                  </button>
                                </div>
                                <span className="font-body text-sm font-semibold text-gray-800 flex-1">
                                  {formatCurrency((item.product.price || 0) * item.quantity)}
                                </span>
                                <button
                                  onClick={() => removeItem(item.product.id)}
                                  className="p-1 text-gray-300 hover:text-red-400 transition-colors"
                                >
                                  <Trash2 size={13} strokeWidth={1.5} />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="border-t border-[#E8E4DC] px-6 py-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-body text-sm text-[#6B7280]">Subtotal</span>
                    <span className="font-body text-lg font-semibold text-gray-800">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  <p className="font-body text-xs text-[#9C9890] mb-4">
                    Harga belum termasuk ongkos kirim. Konfirmasi via WhatsApp.
                  </p>
                  <button
                    onClick={() => { closeCart(); setShowOrderModal(true) }}
                    className="btn-primary w-full justify-center text-sm"
                  >
                    Pesan via WhatsApp
                    <ArrowRight size={15} strokeWidth={1.5} />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <WhatsAppOrderModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
      />
    </>
  )
}
