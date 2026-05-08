import { motion } from 'framer-motion'
import { Award, Users, MapPin, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePageMeta } from '@/hooks/usePageMeta'

const MILESTONES = [
  { year: '2014', title: 'Berdiri', desc: 'Glory8 didirikan dengan visi menyediakan material interior berkualitas premium.' },
  { year: '2016', title: 'Ekspansi Produk', desc: 'Memperluas lini produk ke SPC Flooring dan WPC Wall Panel.' },
  { year: '2019', title: 'Surabaya Office', desc: 'Membuka kantor dan showroom di Surabaya untuk melayani wilayah Jawa Timur.' },
  { year: '2024', title: '1000+ Proyek', desc: 'Mencapai tonggak 1000 proyek residential dan komersial selesai.' },
]

export default function AboutPage() {
  usePageMeta({
    title:       'Tentang Kami',
    description: 'Glory8 Products — penyedia material interior premium WPC, SPC, Vinyl, dan PVC Panel terpercaya di Jakarta & Surabaya.',
    url:         'https://glory8.id/about',
  })
  return (
    <div className="min-h-screen bg-[#FAF8F4] pt-20">
      {/* Hero */}
      <section className="bg-gray-900 py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_30%_50%,rgba(201,149,46,0.4),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <p className="section-subtitle text-[#C9A455]">Tentang Kami</p>
            <h1 className="font-display text-5xl md:text-6xl font-light text-white leading-tight max-w-2xl">
              Menghadirkan Keindahan Material Premium
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <p className="section-subtitle">Cerita Kami</p>
              <h2 className="section-title mb-6">Lebih dari Sekadar Material</h2>
              <div className="space-y-4 font-body text-sm text-[#9C9890] leading-relaxed">
                <p>
                  Glory8 hadir dengan satu keyakinan: setiap ruang berhak mendapatkan material terbaik.
                  Kami adalah distributor dan penyedia material interior premium yang berfokus pada
                  kualitas, estetika, dan ketahanan jangka panjang.
                </p>
                <p>
                  Dari WPC Wall Panel yang elegan hingga SPC Flooring yang tahan air, setiap produk
                  kami dipilih dengan cermat untuk memastikan standar kualitas tertinggi bagi setiap
                  proyek hunian dan komersial.
                </p>
                <p>
                  Dengan tim berpengalaman dan jaringan yang kuat di Jakarta dan Surabaya, kami siap
                  membantu Anda mewujudkan ruang impian dengan material pilihan terbaik.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { icon: Award,     label: '10+ Tahun',         sub: 'Pengalaman industri' },
                { icon: Users,     label: '1000+ Klien',       sub: 'Proyek residensial & komersial' },
                { icon: MapPin,    label: '2 Kota',            sub: 'Jakarta & Surabaya' },
                { icon: TrendingUp,label: '500+ Produk',       sub: 'Koleksi material premium' },
              ].map((stat) => (
                <div key={stat.label} className="bg-[#FAF8F4] p-6 border border-[#E8E4DC]">
                  <stat.icon size={24} strokeWidth={1} className="text-[#C9A455] mb-3" />
                  <p className="font-display text-2xl font-light text-[#1C1917]">{stat.label}</p>
                  <p className="font-body text-xs text-[#9C9890] mt-1">{stat.sub}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-[#FAF8F4]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="section-subtitle">Perjalanan Kami</p>
            <h2 className="section-title">Tonggak Sejarah</h2>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-px bg-[#E8E4DC]" />
            <div className="space-y-12">
              {MILESTONES.map((m, i) => (
                <motion.div
                  key={m.year}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative flex gap-8 ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  <div className="flex-1 text-right">
                    {i % 2 === 0 ? (
                      <div className="bg-white p-6 border border-[#E8E4DC] shadow-luxury">
                        <p className="font-display text-[#C9A455] text-xl mb-1">{m.year}</p>
                        <h3 className="font-display text-lg font-medium text-[#1C1917] mb-2">{m.title}</h3>
                        <p className="font-body text-sm text-[#9C9890]">{m.desc}</p>
                      </div>
                    ) : <div />}
                  </div>
                  <div className="relative flex-shrink-0 flex items-center justify-center">
                    <div className="w-3 h-3 bg-[#C9A455] rounded-full z-10" />
                  </div>
                  <div className="flex-1">
                    {i % 2 === 1 ? (
                      <div className="bg-white p-6 border border-[#E8E4DC] shadow-luxury">
                        <p className="font-display text-[#C9A455] text-xl mb-1">{m.year}</p>
                        <h3 className="font-display text-lg font-medium text-[#1C1917] mb-2">{m.title}</h3>
                        <p className="font-body text-sm text-[#9C9890]">{m.desc}</p>
                      </div>
                    ) : <div />}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white border-t border-[#E8E4DC]">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="section-title mb-4">Siap Berkolaborasi?</h2>
          <p className="font-body text-sm text-[#9C9890] mb-8">
            Hubungi kami untuk konsultasi gratis dan temukan material terbaik untuk proyek Anda.
          </p>
          <Link to="/contact" className="btn-primary text-sm">
            Hubungi Kami
          </Link>
        </div>
      </section>
    </div>
  )
}
