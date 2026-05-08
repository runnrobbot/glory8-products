import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingBag, Minus, Plus, ChevronRight,
  Droplets, Layers, Ruler, Zap, CheckCircle2, ArrowLeft
} from 'lucide-react'
import { useProduct } from '@/hooks/useProducts'
import { useCartStore } from '@/store/cartStore'
import { formatCurrency, getPrimaryImage } from '@/lib/utils'
import { usePageMeta } from '@/hooks/usePageMeta'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import WhatsAppOrderModal from '@/components/shared/WhatsAppOrderModal'
import toast from 'react-hot-toast'

const F = 'Inter, sans-serif'
const SERIF = 'Cormorant Garamond, serif'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const { data: product, loading, error } = useProduct(slug)
  const [qty, setQty]                     = useState(1)
  const [activeImage, setActiveImage]     = useState(0)
  const [orderModalOpen, setOrderModalOpen] = useState(false)
  const [selectedType, setSelectedType]   = useState(null)
  const { addItem }                       = useCartStore()

  // ── Semua derivasi sebelum early return ───────────────────
  const images      = (product?.product_images || []).slice().sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
  const activeTypes = (product?.product_types  || []).filter(t => t.is_active).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
  const activePrice = selectedType?.price != null ? selectedType.price : product?.price
  const features    = Array.isArray(product?.features) ? product.features : []

  usePageMeta({
    title:       product?.name,
    description: product?.short_description || `${product?.name} — material interior premium dari Glory8 Products.`,
    image:       getPrimaryImage(product?.product_images),
    url:         `https://glory8-products.vercel.app/products/${product?.slug}`,
    type:        'product',
  })
  // ─────────────────────────────────────────────────────────

  if (loading) return <LoadingSpinner fullScreen />
  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="font-display text-2xl sm:text-3xl font-light text-[#6B7280]">Produk tidak ditemukan</p>
          <Link to="/products" className="btn-primary mt-6 inline-flex">Kembali ke Produk</Link>
        </div>
      </div>
    )
  }

  const primaryImage = images[activeImage]?.url || null

  const specs = [
    { icon: Layers,   label: 'Ketebalan',       value: product.thickness        || '-' },
    { icon: Ruler,    label: 'Dimensi',          value: product.dimensions       || '-' },
    { icon: Droplets, label: 'Water Resistance', value: product.water_resistance || '-' },
    { icon: Zap,      label: 'Tipe Instalasi',   value: product.installation_type|| '-' },
  ].filter(s => s.value !== '-')

  return (
    <div className="min-h-screen bg-[#FAF8F4] pt-16 sm:pt-20">

      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-[#E8E4DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-1.5 text-[11px] text-[#9C9890]" style={{ fontFamily: F }}>
            <Link to="/" className="hover:text-[#C9A455] transition-colors hidden sm:inline">Home</Link>
            <ChevronRight size={11} className="hidden sm:inline" />
            <Link to="/products" className="hover:text-[#C9A455] transition-colors flex items-center gap-1 sm:gap-0">
              <ArrowLeft size={13} strokeWidth={1.5} className="sm:hidden" />
              Produk
            </Link>
            <ChevronRight size={11} className="hidden sm:inline" />
            <span className="text-[#6B7280] truncate max-w-[160px] sm:max-w-xs hidden sm:inline">{product.name}</span>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">

          {/* ══ Kolom gambar ══ */}
          <div>
            {/* Gambar utama */}
            <div className="aspect-[4/3] sm:aspect-square bg-[#F5F2EC] overflow-hidden mb-2 sm:mb-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="w-full h-full"
                >
                  {primaryImage ? (
                    <img
                      src={primaryImage}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-[80px] sm:text-[100px] font-light text-gray-200" style={{ fontFamily: SERIF }}>G8</span>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(i)}
                    className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 border-2 overflow-hidden transition-colors ${
                      activeImage === i ? 'border-[#C9A455]' : 'border-transparent hover:border-[#E8E4DC]'
                    }`}
                  >
                    <img src={img.url} alt={img.alt} className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ══ Kolom info ══ */}
          <div className="flex flex-col">

            {/* Kategori */}
            {product.product_categories?.name && (
              <p
                className="text-[10px] font-semibold tracking-[0.25em] text-[#C9A455] uppercase mb-2"
                style={{ fontFamily: F }}
              >
                {product.product_categories.name}
              </p>
            )}

            {/* Nama */}
            <h1
              className="text-2xl sm:text-3xl lg:text-4xl font-light text-[#1C1917] leading-tight mb-3"
              style={{ fontFamily: SERIF }}
            >
              {product.name}
            </h1>

            {/* Deskripsi */}
            {(product.description || product.short_description) && (
              <p className="text-[13px] sm:text-sm text-[#9C9890] leading-relaxed mb-5" style={{ fontFamily: F }}>
                {product.description || product.short_description}
              </p>
            )}

            {/* Harga */}
            <div className="flex items-baseline gap-2 mb-6">
              <span
                className="text-2xl sm:text-3xl font-light text-[#1C1917]"
                style={{ fontFamily: SERIF }}
              >
                {formatCurrency(activePrice)}
              </span>
              {product.unit && (
                <span className="text-sm text-[#9C9890]" style={{ fontFamily: F }}>/ {product.unit}</span>
              )}
            </div>

            {/* ── Tipe produk ── */}
            {activeTypes.length > 0 && (
              <div className="mb-6">
                <h3
                  className="text-[10px] font-semibold tracking-widest text-[#6B7280] uppercase mb-3"
                  style={{ fontFamily: F }}
                >
                  Pilih Tipe
                </h3>
                <div className="flex flex-wrap gap-2">
                  {activeTypes.map((t) => {
                    const isSelected = selectedType?.id === t.id
                    return (
                      <button
                        key={t.id}
                        onClick={() => setSelectedType(isSelected ? null : t)}
                        className={`flex flex-col items-start px-3 py-2.5 border text-left transition-all ${
                          isSelected
                            ? 'border-[#1C1917] bg-[#1C1917] text-white'
                            : 'border-[#E8E4DC] bg-white text-[#1C1917] hover:border-[#C9A455]'
                        }`}
                      >
                        <span className="text-[13px] font-medium" style={{ fontFamily: F }}>{t.name}</span>
                        <div className="flex flex-wrap gap-x-2 mt-0.5">
                          {t.price != null && (
                            <span className="text-[11px] text-[#C9A455]" style={{ fontFamily: F }}>
                              {formatCurrency(t.price)}
                            </span>
                          )}
                          {t.code && (
                            <span className={`text-[10px] font-mono ${isSelected ? 'text-white/60' : 'text-[#9C9890]'}`}>
                              {t.code}
                            </span>
                          )}
                          {t.stock != null && (
                            <span className={`text-[10px] ${isSelected ? 'text-white/60' : 'text-[#9C9890]'}`} style={{ fontFamily: F }}>
                              Stok: {t.stock}
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
                {selectedType?.description && (
                  <p className="text-[12px] text-[#9C9890] mt-2 italic" style={{ fontFamily: F }}>
                    {selectedType.description}
                  </p>
                )}
              </div>
            )}

            {/* ── Specs ── */}
            {specs.length > 0 && (
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-6">
                {specs.map((spec) => (
                  <div key={spec.label} className="flex items-center gap-2 sm:gap-3 bg-white border border-[#E8E4DC] p-2.5 sm:p-3">
                    <spec.icon size={14} strokeWidth={1.5} className="text-[#C9A455] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[9px] sm:text-[10px] text-[#9C9890]" style={{ fontFamily: F }}>{spec.label}</p>
                      <p className="text-[11px] sm:text-xs font-medium text-[#1C1917] truncate" style={{ fontFamily: F }}>{spec.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Fitur ── */}
            {features.length > 0 && (
              <div className="mb-6">
                <h3 className="text-[10px] font-semibold tracking-widest text-[#6B7280] uppercase mb-3" style={{ fontFamily: F }}>
                  Fitur Utama
                </h3>
                <ul className="space-y-2">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-[13px] text-[#6B7280]" style={{ fontFamily: F }}>
                      <CheckCircle2 size={13} strokeWidth={1.5} className="text-[#C9A455] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Qty + Tombol ── */}
            <div className="space-y-3 mt-auto pt-2">
              <div className="flex items-center gap-3 flex-wrap">
                {/* Qty control */}
                <div className="flex items-center border border-[#E8E4DC]">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-10 h-10 flex items-center justify-center text-[#9C9890] hover:text-[#1C1917] transition-colors"
                  >
                    <Minus size={13} strokeWidth={1.5} />
                  </button>
                  <span className="w-10 text-center text-sm font-medium text-[#1C1917]" style={{ fontFamily: F }}>{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="w-10 h-10 flex items-center justify-center text-[#9C9890] hover:text-[#1C1917] transition-colors"
                  >
                    <Plus size={13} strokeWidth={1.5} />
                  </button>
                </div>

                {product.stock != null && (
                  <span className="text-[11px] text-[#9C9890]" style={{ fontFamily: F }}>
                    Stok: {product.stock} {product.unit || 'unit'}
                  </span>
                )}
              </div>

              {/* Action buttons — full width di mobile */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => { addItem(product, qty); toast.success(`${product.name} x${qty} ditambahkan`) }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-[#1C1917] text-[#1C1917] text-[13px] hover:bg-[#FAF8F4] transition-colors"
                  style={{ fontFamily: F }}
                >
                  <ShoppingBag size={14} strokeWidth={1.5} />
                  Keranjang
                </button>
                <button
                  onClick={() => { addItem(product, qty); setOrderModalOpen(true) }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#1C1917] text-white text-[13px] hover:bg-[#C9A455] transition-colors"
                  style={{ fontFamily: F }}
                >
                  Pesan Sekarang
                </button>
              </div>
            </div>

            {/* Koleksi badge */}
            {product.product_collections && (
              <div className="mt-5 pt-5 border-t border-[#E8E4DC]">
                <p className="text-[11px] text-[#9C9890]" style={{ fontFamily: F }}>
                  Bagian dari koleksi{' '}
                  <Link
                    to={`/collections/${product.product_collections.slug}`}
                    className="text-[#C9A455] hover:underline"
                  >
                    {product.product_collections.name}
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <WhatsAppOrderModal isOpen={orderModalOpen} onClose={() => setOrderModalOpen(false)} />
    </div>
  )
}
