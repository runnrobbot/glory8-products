import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, MapPin, ChevronRight } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import { useCartStore } from '@/store/cartStore'
import { ADMIN_REGIONS, getWhatsAppUrl } from '@/lib/utils'

export default function WhatsAppOrderModal({ isOpen, onClose }) {
  const [notes, setNotes] = useState('')
  const [selected, setSelected] = useState(null)
  const { buildWhatsAppMessage, items, clearCart } = useCartStore()

  const handleOrder = (region) => {
    const message = buildWhatsAppMessage(notes)
    const url = getWhatsAppUrl(region.number, message)
    window.open(url, '_blank')
    clearCart()
    onClose()
  }

  if (!items.length) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pilih Admin Wilayah" size="sm">
      <div className="space-y-4">
        <p className="font-body text-sm text-[#9C9890] leading-relaxed">
          Pilih admin wilayah untuk melanjutkan pesanan via WhatsApp.
        </p>

        <div className="space-y-2">
          {ADMIN_REGIONS.map((region) => (
            <motion.button
              key={region.key}
              whileHover={{ x: 4 }}
              onClick={() => handleOrder(region)}
              className="w-full flex items-center gap-4 p-4 border border-[#E8E4DC] hover:border-[#C9A455] hover:bg-[#FAF8F4] transition-all duration-200 text-left group"
            >
              <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center shrink-0">
                <MessageCircle size={18} strokeWidth={1.5} className="text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-body text-sm font-medium text-gray-800">{region.label}</p>
                <p className="font-body text-xs text-[#9C9890] mt-0.5 flex items-center gap-1">
                  <MapPin size={11} strokeWidth={1.5} />
                  {region.key === 'jakarta' ? 'Jakarta & sekitarnya' : 'Surabaya & sekitarnya'}
                </p>
              </div>
              <ChevronRight size={16} strokeWidth={1.5} className="text-[#9C9890] group-hover:text-[#C9A455] transition-colors" />
            </motion.button>
          ))}
        </div>

        <div>
          <label className="block font-body text-xs font-medium text-[#6B7280] mb-2">
            Catatan Tambahan (opsional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Alamat pengiriman, catatan khusus, dll..."
            className="input-luxury resize-none text-xs"
          />
        </div>

        <p className="font-body text-xs text-[#9C9890] text-center">
          Pesanan akan diteruskan melalui WhatsApp
        </p>
      </div>
    </Modal>
  )
}
