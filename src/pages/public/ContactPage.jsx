import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, MessageCircle, Clock } from 'lucide-react'
import { usePageMeta } from '@/hooks/usePageMeta'

const F = 'Inter, sans-serif'

export default function ContactPage() {
  usePageMeta({
    title:       'Hubungi Kami',
    description: 'Konsultasi material interior Glory8 Products. Hubungi kami via WhatsApp atau Live Chat. Jakarta: 0812-5438-891 · Surabaya: 0813-5952-2218.',
    url:         'https://glory8.id/contact',
  })
  return (
    <div className="min-h-screen bg-[#FAF8F4] pt-20">
      {/* Header */}
      <div className="bg-white border-b border-[#E8E4DC] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <p className="section-subtitle">Kontak</p>
            <h1 className="section-title">Hubungi Kami</h1>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20">

          {/* ── Kiri: Info kontak ── */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <h2 className="font-display text-2xl font-light text-[#1C1917] mb-3">
              Kami siap membantu Anda
            </h2>
            <p className="text-sm text-[#9C9890] leading-relaxed mb-10" style={{ fontFamily: F }}>
              Tim kami siap memberikan konsultasi material interior terbaik untuk proyek Anda.
              Hubungi kami melalui salah satu saluran berikut.
            </p>

            {/* Info list */}
            <div className="space-y-5 mb-10">
              {[
                { icon: MapPin, label: 'Lokasi',   value: 'Jakarta & Surabaya, Indonesia' },
                { icon: Phone,  label: 'Jakarta',  value: '0812-5438-891',   href: 'tel:08125438891' },
                { icon: Phone,  label: 'Surabaya', value: '0813-5952-2218',  href: 'tel:081359522218' },
                { icon: Mail,   label: 'Email',    value: 'hello@glory8.id', href: 'mailto:hello@glory8.id' },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#F5F2EC] flex items-center justify-center shrink-0 mt-0.5">
                    <item.icon size={15} strokeWidth={1.5} className="text-[#C9A455]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#9C9890] uppercase tracking-widest mb-0.5" style={{ fontFamily: F }}>
                      {item.label}
                    </p>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-sm text-[#1C1917] hover:text-[#C9A455] transition-colors"
                        style={{ fontFamily: F }}
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm text-[#1C1917]" style={{ fontFamily: F }}>{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Jam operasional */}
            <div className="flex items-start gap-4 p-5 bg-white border border-[#E8E4DC]">
              <div className="w-10 h-10 bg-[#F5F2EC] flex items-center justify-center shrink-0">
                <Clock size={15} strokeWidth={1.5} className="text-[#C9A455]" />
              </div>
              <div>
                <p className="text-[10px] text-[#9C9890] uppercase tracking-widest mb-2" style={{ fontFamily: F }}>
                  Jam Operasional
                </p>
                <div className="space-y-1">
                  {[
                    { day: 'Senin – Jumat', time: '08.00 – 17.00 WIB' },
                    { day: 'Sabtu',         time: '08.00 – 17.00 WIB' },
                    { day: 'Minggu',        time: 'Tutup' },
                  ].map(row => (
                    <div key={row.day} className="flex justify-between gap-6">
                      <span className="text-[12px] text-[#6B7280]" style={{ fontFamily: F }}>{row.day}</span>
                      <span className="text-[12px] text-[#1C1917] font-medium" style={{ fontFamily: F }}>{row.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Kanan: WhatsApp + Live chat CTA ── */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            {/* WhatsApp */}
            <div className="bg-white border border-[#E8E4DC] p-6 mb-6">
              <p className="text-[10px] text-[#9C9890] uppercase tracking-widest mb-5" style={{ fontFamily: F }}>
                Chat WhatsApp
              </p>
              <div className="space-y-3">
                <a
                  href="https://wa.me/628125438891"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 bg-green-50 border border-green-200 px-5 py-4 hover:bg-green-100 transition-colors group"
                >
                  <div className="w-9 h-9 bg-green-100 flex items-center justify-center shrink-0 group-hover:bg-green-200 transition-colors">
                    <MessageCircle size={16} strokeWidth={1.5} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1C1917]" style={{ fontFamily: F }}>Admin Jakarta</p>
                    <p className="text-[11px] text-[#9C9890]" style={{ fontFamily: F }}>0812-5438-891 · Klik untuk chat</p>
                  </div>
                </a>
                <a
                  href="https://wa.me/6281359522218"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 bg-green-50 border border-green-200 px-5 py-4 hover:bg-green-100 transition-colors group"
                >
                  <div className="w-9 h-9 bg-green-100 flex items-center justify-center shrink-0 group-hover:bg-green-200 transition-colors">
                    <MessageCircle size={16} strokeWidth={1.5} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1C1917]" style={{ fontFamily: F }}>Admin Surabaya</p>
                    <p className="text-[11px] text-[#9C9890]" style={{ fontFamily: F }}>0813-5952-2218 · Klik untuk chat</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Live Chat CTA */}
            <div className="bg-[#1C1917] p-6 text-white">
              <p className="text-[10px] text-[#C9A455] uppercase tracking-widest mb-3" style={{ fontFamily: F }}>
                Konsultasi Online
              </p>
              <h3 className="font-display text-xl font-light mb-2">
                Butuh bantuan sekarang?
              </h3>
              <p className="text-[12px] text-white/60 leading-relaxed mb-5" style={{ fontFamily: F }}>
                Gunakan fitur Live Chat di pojok kanan bawah halaman ini untuk langsung terhubung dengan tim kami.
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-[11px] text-white/70" style={{ fontFamily: F }}>
                  Tim siap membantu Anda
                </span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}
