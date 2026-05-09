import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, MapPin, ChevronRight, ChevronDown, Info } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import { useCartStore } from '@/store/cartStore'
import { ADMIN_REGIONS, getWhatsAppUrl, ORDER_TYPES } from '@/lib/utils'

const F = 'Inter, sans-serif'

// Format angka jadi Rp 1.500.000 saat diketik
function formatRupiah(raw) {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  return new Intl.NumberFormat('id-ID').format(Number(digits))
}
function parseRupiah(formatted) {
  return Number(formatted.replace(/\./g, '').replace(/,/g, ''))
}

export default function WhatsAppOrderModal({ isOpen, onClose }) {
  const [notes, setNotes]         = useState('')
  const [orderType, setOrderType] = useState('')
  const [budget, setBudget]       = useState('')   // formatted string
  const [showTypes, setShowTypes] = useState(false)
  const { buildWhatsAppMessage, items, clearCart } = useCartStore()

  const handleBudgetChange = (e) => {
    setBudget(formatRupiah(e.target.value))
  }

  const handleOrder = (region) => {
    const typeLine = orderType
      ? `\n*Tipe Pesanan:* ${ORDER_TYPES[orderType]?.label || orderType}`
      : ''
    const budgetLine = budget
      ? `\n*Estimasi Budget:* Rp ${budget}`
      : ''
    const baseMessage = buildWhatsAppMessage(notes)   // plain string
    const fullMessage  = baseMessage + typeLine + budgetLine
    const url = getWhatsAppUrl(region.number, encodeURIComponent(fullMessage))
    window.open(url, '_blank')
    clearCart()
    // reset
    setOrderType('')
    setBudget('')
    setNotes('')
    onClose()
  }

  if (!items.length) return null

  const selectedType = orderType ? ORDER_TYPES[orderType] : null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Lanjutkan Pesanan" size="sm">
      <div className="space-y-4">

        {/* Tipe pesanan */}
        <div>
          <label className="block text-[10px] font-semibold text-[#9C9890] uppercase tracking-widest mb-2" style={{ fontFamily: F }}>
            Tipe Pesanan <span className="text-[#C9A455] normal-case tracking-normal font-normal">(opsional)</span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTypes(o => !o)}
              className={`w-full flex items-center justify-between px-3 py-2.5 border text-[13px] transition-colors text-left ${
                orderType ? 'border-[#C9A455] text-[#1C1917]' : 'border-[#E8E4DC] text-[#9C9890]'
              }`}
              style={{ fontFamily: F }}
            >
              {selectedType ? selectedType.label : 'Pilih tipe pesanan...'}
              <ChevronDown size={14} strokeWidth={1.5} className={`transition-transform flex-shrink-0 ${showTypes ? 'rotate-180' : ''}`} />
            </button>
            {showTypes && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E8E4DC] shadow-lg z-50">
                {Object.entries(ORDER_TYPES).map(([key, t]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => { setOrderType(key); setShowTypes(false) }}
                    className={`w-full text-left px-3 py-2.5 hover:bg-[#FAF8F4] transition-colors border-b border-[#F5F3EF] last:border-0 ${
                      orderType === key ? 'text-[#C9A455]' : 'text-[#1C1917]'
                    }`}
                  >
                    <p className="text-[13px] font-medium" style={{ fontFamily: F }}>{t.label}</p>
                    <p className="text-[11px] text-[#9C9890] mt-0.5 leading-snug" style={{ fontFamily: F }}>{t.description}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Deskripsi tipe yang dipilih */}
          {selectedType && (
            <div className="flex items-start gap-2 mt-2 px-3 py-2 bg-amber-50 border border-amber-100">
              <Info size={12} strokeWidth={1.5} className="text-[#C9A455] mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-amber-800 leading-snug" style={{ fontFamily: F }}>
                {selectedType.description}
              </p>
            </div>
          )}
        </div>

        {/* Estimasi budget */}
        <div>
          <label className="block text-[10px] font-semibold text-[#9C9890] uppercase tracking-widest mb-2" style={{ fontFamily: F }}>
            Estimasi Budget <span className="text-[#C9A455] normal-case tracking-normal font-normal">(opsional)</span>
          </label>
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9C9890] text-[13px] select-none"
              style={{ fontFamily: F }}
            >
              Rp
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={budget}
              onChange={handleBudgetChange}
              placeholder="0"
              className="w-full pl-9 pr-3 py-2.5 border border-[#E8E4DC] text-[13px] text-[#1C1917] bg-white focus:outline-none focus:border-[#C9A455] transition-colors placeholder:text-[#9C9890]"
              style={{ fontFamily: F }}
            />
          </div>
          {budget && (
            <p className="text-[11px] text-[#9C9890] mt-1 px-1" style={{ fontFamily: F }}>
              Rp {budget}
            </p>
          )}
        </div>

        {/* Catatan */}
        <div>
          <label className="block text-[10px] font-semibold text-[#9C9890] uppercase tracking-widest mb-2" style={{ fontFamily: F }}>
            Catatan Tambahan <span className="text-[#C9A455] normal-case tracking-normal font-normal">(opsional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Alamat pengiriman, catatan khusus, dll..."
            className="w-full border border-[#E8E4DC] px-3 py-2.5 text-[13px] text-[#1C1917] bg-white focus:outline-none focus:border-[#C9A455] transition-colors resize-none placeholder:text-[#9C9890]"
            style={{ fontFamily: F }}
          />
        </div>

        {/* Pilih admin wilayah */}
        <div>
          <p className="text-[10px] font-semibold text-[#9C9890] uppercase tracking-widest mb-2" style={{ fontFamily: F }}>
            Pilih Admin Wilayah
          </p>
          <div className="space-y-2">
            {ADMIN_REGIONS.map((region) => (
              <motion.button
                key={region.key}
                whileHover={{ x: 3 }}
                type="button"
                onClick={() => handleOrder(region)}
                className="w-full flex items-center gap-4 p-4 border border-[#E8E4DC] hover:border-[#C9A455] hover:bg-[#FAF8F4] transition-all text-left group"
              >
                <div className="w-9 h-9 bg-green-50 flex items-center justify-center shrink-0">
                  <MessageCircle size={16} strokeWidth={1.5} className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[#1C1917]" style={{ fontFamily: F }}>{region.label}</p>
                  <p className="text-[11px] text-[#9C9890] flex items-center gap-1 mt-0.5" style={{ fontFamily: F }}>
                    <MapPin size={10} strokeWidth={1.5} />
                    {region.key === 'jakarta' ? 'Jakarta & sekitarnya' : 'Surabaya & sekitarnya'}
                  </p>
                </div>
                <ChevronRight size={14} strokeWidth={1.5} className="text-[#9C9890] group-hover:text-[#C9A455] transition-colors flex-shrink-0" />
              </motion.button>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-[#9C9890] text-center" style={{ fontFamily: F }}>
          Pesanan akan diteruskan melalui WhatsApp
        </p>
      </div>
    </Modal>
  )
}
