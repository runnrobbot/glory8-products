import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import ProductCard from '@/components/product/ProductCard'
import { SkeletonGrid } from '@/components/ui/Skeleton'
import WhatsAppOrderModal from '@/components/shared/WhatsAppOrderModal'
import { useFeaturedProducts, useCollections, useCategories } from '@/hooks/useProducts'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useCartStore } from '@/store/cartStore'

/* ── helpers ── */
function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function RevealLine({ delay = 0 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  return (
    <motion.div
      ref={ref}
      initial={{ scaleX: 0 }}
      animate={inView ? { scaleX: 1 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformOrigin: 'left' }}
      className="h-px bg-[#E8E4DC]"
    />
  )
}

export default function HomePage() {
  const [orderModalOpen, setOrderModalOpen] = useState(false)
  const { data: featured, loading: featuredLoading } = useFeaturedProducts()
  const { data: collections, loading: collectionsLoading } = useCollections()
  const { data: categories } = useCategories()

  usePageMeta({
    title:       'Material Interior Premium',
    description: 'WPC Wall Panel, SPC Flooring, Vinyl, PVC Panel. Material interior premium untuk hunian dan proyek komersial. Jakarta & Surabaya.',
  })
  const { addItem } = useCartStore()

  /* parallax hero */
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  return (
    <div className="overflow-x-hidden bg-[#FAF8F4]">

      {/* ═══════════════════════════════════════════════════════
          HERO — Full bleed image dengan teks editorial besar
      ═══════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative h-screen min-h-[640px] overflow-hidden">

        {/* Parallax bg image */}
        <motion.div style={{ y: heroY }} className="absolute inset-0 will-change-transform">
          <img
            src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&q=85"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1C1917]/50 via-[#1C1917]/30 to-[#1C1917]/80" />
        </motion.div>

        {/* Content */}
        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative h-full flex flex-col justify-end max-w-[1400px] mx-auto px-6 lg:px-10 pb-16 md:pb-20"
        >
          {/* Label */}
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-[#C9A455] text-[11px] tracking-[0.4em] uppercase mb-5"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
          >
            GLORY8 PRODUCTS
          </motion.p>

          {/* Headline — editorial besar */}
          <div className="overflow-hidden mb-6">
            <motion.h1
              initial={{ y: '100%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="text-white leading-[0.95]"
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontWeight: 300,
                fontSize: 'clamp(52px, 9vw, 120px)',
                letterSpacing: '-0.01em',
              }}
            >
              Material yang
              <br />
              <em style={{ fontStyle: 'italic', fontWeight: 300, color: '#C9A455' }}>Mendefinisikan</em>
              <br />
              Kemewahan
            </motion.h1>
          </div>

          {/* Bottom row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.75 }}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-6 border-t border-white/15"
          >
            <p
              className="text-white/70 text-[13px] leading-relaxed max-w-sm"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
            >
              WPC Wall Panel · SPC Flooring · Vinyl · PVC Panel
              <br />
              untuk hunian dan proyek komersial berkelas.
            </p>
            <div className="flex gap-3 flex-shrink-0">
              <Link
                to="/products"
                className="flex items-center gap-2 px-6 py-3 bg-[#C9A455] text-white text-[12px] tracking-[0.08em] hover:bg-white hover:text-[#1C1917] transition-all duration-300"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              >
                Lihat Produk
                <ArrowRight size={14} strokeWidth={1.5} />
              </Link>
              <Link
                to="/contact"
                className="flex items-center gap-2 px-6 py-3 border border-white/40 text-white text-[12px] tracking-[0.08em] hover:border-[#C9A455] hover:text-[#C9A455] transition-all duration-300"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              >
                Konsultasi
              </Link>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="absolute bottom-6 right-8 flex items-center gap-3"
        >
          <motion.div
            animate={{ scaleX: [1, 2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-8 h-px bg-white/40"
          />
          <span
            className="text-white/40 text-[9px] tracking-[0.3em] uppercase"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Scroll
          </span>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          KATEGORI — Strip horizontal sederhana
      ═══════════════════════════════════════════════════════ */}
      {categories?.length > 0 && (
        <section className="bg-white border-b border-[#E8E4DC]">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
            <div className="flex items-stretch divide-x divide-[#E8E4DC] overflow-x-auto hide-scrollbar">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link
                    to={`/products?category=${cat.id}`}
                    className="flex-shrink-0 flex flex-col items-start gap-1 px-7 py-5 hover:bg-[#FAF8F4] transition-colors group"
                  >
                    <span
                      className="text-[10px] tracking-[0.25em] text-[#C9A455] uppercase"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className="text-[13px] text-[#1C1917] group-hover:text-[#C9A455] transition-colors whitespace-nowrap"
                      style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
                    >
                      {cat.name}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════
          PRODUK UNGGULAN — Layout asimetris
      ═══════════════════════════════════════════════════════ */}
      {(featuredLoading || featured?.length > 0) && (
      <section className="py-28 bg-[#FAF8F4]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">

          {/* Header — besar di kiri, link di kanan */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
            <Reveal>
              <span
                className="block text-[#C9A455] text-[11px] tracking-[0.4em] uppercase mb-3"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Pilihan Terbaik
              </span>
              <h2
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontWeight: 300,
                  fontSize: 'clamp(36px, 5vw, 60px)',
                  lineHeight: 1.05,
                  color: '#1C1917',
                }}
              >
                Produk<br /><em style={{ fontStyle: 'italic' }}>Unggulan</em>
              </h2>
            </Reveal>
            <Reveal delay={0.15}>
              <Link
                to="/products"
                className="flex items-center gap-2 text-[12px] text-[#1C1917] hover:text-[#C9A455] transition-colors group"
                style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.05em' }}
              >
                Lihat semua produk
                <ArrowUpRight size={14} strokeWidth={1.5} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </Reveal>
          </div>

          {featuredLoading ? (
            <SkeletonGrid count={4} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-[#E8E4DC]">
              {featured.slice(0, 8).map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: i * 0.06, duration: 0.5 }}
                  className="bg-[#FAF8F4]"
                >
                  <ProductCard product={product} onBuyNow={() => setOrderModalOpen(true)} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
      )}

      {/* ═══════════════════════════════════════════════════════
          DIVIDER — Garis tipis dengan label di tengah
      ═══════════════════════════════════════════════════════ */}
      <div className="bg-[#FAF8F4] py-0">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex items-center gap-6 py-10 border-t border-b border-[#E8E4DC]">
            <div className="flex-1 h-px bg-[#E8E4DC]" />
            {['WPC Wall Panel', 'SPC Flooring', 'Vinyl', 'PVC Panel'].map((item, i) => (
              <span
                key={i}
                className="flex-shrink-0 text-[10px] tracking-[0.25em] uppercase text-[#C4BEB5]"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {item}
              </span>
            ))}
            <div className="flex-1 h-px bg-[#E8E4DC]" />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          KOLEKSI — Masonry / besar-kecil layout
      ═══════════════════════════════════════════════════════ */}
      {!collectionsLoading && collections?.length > 0 && (
        <section className="py-28 bg-white">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10">

            <Reveal className="mb-16">
              <RevealLine />
              <div className="flex flex-col md:flex-row md:items-end justify-between pt-6 gap-4">
                <div>
                  <span
                    className="block text-[#C9A455] text-[11px] tracking-[0.4em] uppercase mb-3"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Koleksi Kami
                  </span>
                  <h2
                    style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontWeight: 300,
                      fontSize: 'clamp(36px, 4vw, 56px)',
                      color: '#1C1917',
                      lineHeight: 1.1,
                    }}
                  >
                    Jelajahi <em style={{ fontStyle: 'italic' }}>Koleksi</em>
                  </h2>
                </div>
                <Link
                  to="/collections"
                  className="flex items-center gap-2 text-[12px] text-[#1C1917] hover:text-[#C9A455] transition-colors group self-end"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Semua koleksi <ArrowUpRight size={14} strokeWidth={1.5} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
            </Reveal>

            {/* Grid: pertama besar, sisanya kecil */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#E8E4DC]">
              {collections.slice(0, 6).map((col, i) => (
                <motion.div
                  key={col.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: i * 0.08, duration: 0.6 }}
                  className={i === 0 ? 'md:col-span-2 lg:col-span-1 lg:row-span-2' : ''}
                >
                  <Link
                    to={`/collections/${col.slug}`}
                    className="group relative flex overflow-hidden bg-[#F5F2EC]"
                    style={{ aspectRatio: i === 0 ? '4/5' : '4/3' }}
                  >
                    {col.banner_url ? (
                      <img
                        src={col.banner_url}
                        alt={col.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span
                          className="text-[80px] font-light text-[#E8E4DC]"
                          style={{ fontFamily: 'Cormorant Garamond, serif' }}
                        >
                          G8
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917]/80 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <span
                        className="block text-[#C9A455] text-[9px] tracking-[0.3em] uppercase mb-1"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        Koleksi
                      </span>
                      <h3
                        className="text-white text-[18px] font-light"
                        style={{ fontFamily: 'Cormorant Garamond, serif' }}
                      >
                        {col.name}
                      </h3>
                      <motion.div
                        initial={{ width: 0 }}
                        whileHover={{ width: 32 }}
                        className="h-px bg-[#C9A455] mt-2"
                      />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════
          CTA — Dark section editorial
      ═══════════════════════════════════════════════════════ */}
      <section className="relative py-32 bg-[#1C1917] overflow-hidden">
        {/* Subtle texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, #C9A455, #C9A455 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, #C9A455, #C9A455 1px, transparent 1px, transparent 60px)',
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#C9A455]/5 blur-[120px] pointer-events-none" />

        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="max-w-2xl">
            <Reveal>
              <span
                className="block text-[#C9A455] text-[11px] tracking-[0.4em] uppercase mb-6"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Konsultasi Gratis
              </span>
              <h2
                className="text-white mb-8"
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontWeight: 300,
                  fontSize: 'clamp(38px, 5vw, 68px)',
                  lineHeight: 1.05,
                }}
              >
                Siap wujudkan<br />
                <em style={{ fontStyle: 'italic', color: '#C9A455' }}>interior impian</em><br />
                Anda?
              </h2>
              <p
                className="text-white/50 text-[13px] leading-relaxed mb-10 max-w-md"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
              >
                Tim konsultan kami siap membantu Anda memilih material
                yang tepat untuk setiap sudut ruang.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#C9A455] text-white text-[12px] tracking-[0.08em] hover:bg-white hover:text-[#1C1917] transition-all duration-300"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                >
                  Hubungi Kami
                  <ArrowRight size={14} strokeWidth={1.5} />
                </Link>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 px-8 py-4 border border-white/20 text-white text-[12px] tracking-[0.08em] hover:border-[#C9A455] hover:text-[#C9A455] transition-all duration-300"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
                >
                  Lihat Katalog
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <WhatsAppOrderModal isOpen={orderModalOpen} onClose={() => setOrderModalOpen(false)} />
    </div>
  )
}
