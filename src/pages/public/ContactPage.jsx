import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F4] pt-20">
      <div className="bg-white border-b border-[#E8E4DC] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="section-subtitle">Kontak</p>
          <h1 className="section-title">Hubungi Kami</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="font-display text-2xl font-light text-[#1C1917] mb-4">Kami siap membantu Anda</h2>
          <p className="font-body text-sm text-[#9C9890] leading-relaxed mb-12">
            Tim kami siap memberikan konsultasi material interior terbaik untuk proyek Anda.
            Hubungi kami melalui salah satu saluran berikut.
          </p>

          <div className="space-y-6 mb-12">
            {[
              { icon: MapPin, label: 'Lokasi',  value: 'Jakarta & Surabaya, Indonesia' },
              { icon: Phone,  label: 'Jakarta', value: '0812-5438-891',  href: 'tel:08125438891' },
              { icon: Phone,  label: 'Surabaya',value: '0813-5952-2218', href: 'tel:081359522218' },
              { icon: Mail,   label: 'Email',   value: 'hello@glory8.id', href: 'mailto:hello@glory8.id' },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#F5F2EC] flex items-center justify-center shrink-0">
                  <item.icon size={16} strokeWidth={1.5} className="text-[#C9A455]" />
                </div>
                <div>
                  <p className="font-body text-xs text-[#9C9890] uppercase tracking-wide">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} className="font-body text-sm text-[#1C1917] hover:text-[#C9A455] transition-colors mt-0.5 block">
                      {item.value}
                    </a>
                  ) : (
                    <p className="font-body text-sm text-[#1C1917] mt-0.5">{item.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div>
            <p className="font-body text-xs font-semibold text-[#9C9890] uppercase tracking-wide mb-4">Chat WhatsApp</p>
            <div className="space-y-3">
              <a href="https://wa.me/6281254388912" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 bg-green-50 border border-green-200 px-5 py-4 hover:bg-green-100 transition-colors">
                <MessageCircle size={18} strokeWidth={1.5} className="text-green-600" />
                <div>
                  <p className="font-body text-sm font-medium text-[#1C1917]">Admin Jakarta</p>
                  <p className="font-body text-xs text-[#9C9890]">0812-5438-891</p>
                </div>
              </a>
              <a href="https://wa.me/6281359522218" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 bg-green-50 border border-green-200 px-5 py-4 hover:bg-green-100 transition-colors">
                <MessageCircle size={18} strokeWidth={1.5} className="text-green-600" />
                <div>
                  <p className="font-body text-sm font-medium text-[#1C1917]">Admin Surabaya</p>
                  <p className="font-body text-xs text-[#9C9890]">0813-5952-2218</p>
                </div>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
