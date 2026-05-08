import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingBag, ArrowLeft, Minus, Plus, ChevronRight,
  Droplets, Layers, Ruler, Zap, CheckCircle2
} from 'lucide-react'
import { useProduct } from '@/hooks/useProducts'
import { useCartStore } from '@/store/cartStore'
import { formatCurrency, getPrimaryImage } from '@/lib/utils'
import { usePageMeta } from '@/hooks/usePageMeta'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import WhatsAppOrderModal from '@/components/shared/WhatsAppOrderModal'
import toast from 'react-hot-toast'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const { data: product, loading, error } = useProduct(slug)
  const [qty, setQty] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [orderModalOpen, setOrderModalOpen] = useState(false)
  const { addItem } = useCartStore()

  if (loading) return <LoadingSpinner fullScreen />
  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-display text-3xl font-light text-[#6B7280]">Produk tidak ditemukan</p>
          <Link to="/products" className="btn-primary mt-6 inline-flex">Kembali ke Produk</Link>
        </div>
      </div>
    )
  }

  const images = product.product_images?.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)) || []
  const primaryImage = images[activeImage]?.url || null

  // Dynamic meta for share links
  usePageMeta({
    title:       product.name,
    description: product.short_description || `${product.name} — material interior premium dari Glory8 Products.`,
    image:       getPrimaryImage(product.product_images),
    url:         `https://glory8.id/products/${product.slug}`,
    type:        'product',
  })

  const handleAddToCart = () => {
    addItem(product, qty)
    toast.success(`${product.name} x${qty} ditambahkan ke keranjang`)
  }

  const handleBuyNow = () => {
    addItem(product, qty)
    setOrderModalOpen(true)
  }

  const specs = [
    { icon: Layers,   label: 'Ketebalan',          value: product.thickness || '-' },
    { icon: Ruler,    label: 'Dimensi',             value: product.dimensions || '-' },
    { icon: Droplets, label: 'Water Resistance',    value: product.water_resistance || '-' },
    { icon: Zap,      label: 'Tipe Instalasi',      value: product.installation_type || '-' },
  ]

  return (
    <div className="min-h-screen bg-[#FAF8F4] pt-20">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-[#E8E4DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 font-body text-xs text-[#9C9890]">
            <Link to="/" className="hover:text-[#C9A455] transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link to="/products" className="hover:text-[#C9A455] transition-colors">Produk</Link>
            <ChevronRight size={12} />
            <span className="text-[#6B7280] truncate max-w-48">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="aspect-square bg-[#F5F2EC] overflow-hidden mb-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full"
                >
                  {primaryImage ? (
                    <img src={primaryImage} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-display text-8xl font-light text-gray-200">G8</span>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(i)}
                    className={`flex-shrink-0 w-16 h-16 border-2 overflow-hidden transition-colors ${
                      activeImage === i ? 'border-[#C9A455]' : 'border-transparent'
                    }`}
                  >
                    <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="mb-2">
              <p className="font-body text-[10px] font-semibold tracking-widest2 text-[#C9A455] uppercase">
                {product.product_categories?.name}
              </p>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-light text-[#1C1917] leading-tight mb-3">
              {product.name}
            </h1>
            <p className="font-body text-sm text-[#9C9890] leading-relaxed mb-6">
              {product.description || product.short_description}
            </p>

            <div className="flex items-baseline gap-2 mb-8">
              <span className="font-display text-3xl font-light text-[#1C1917]">
                {formatCurrency(product.price)}
              </span>
              {product.unit && (
                <span className="font-body text-sm text-[#9C9890]">/ {product.unit}</span>
              )}
            </div>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {specs.map((spec) => spec.value !== '-' && (
                <div key={spec.label} className="flex items-center gap-3 bg-white border border-[#E8E4DC] p-3">
                  <spec.icon size={15} strokeWidth={1.5} className="text-[#C9A455] shrink-0" />
                  <div>
                    <p className="font-body text-[10px] text-[#9C9890]">{spec.label}</p>
                    <p className="font-body text-xs font-medium text-[#1C1917]">{spec.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Features */}
            {product.features && Array.isArray(product.features) && product.features.length > 0 && (
              <div className="mb-8">
                <h3 className="font-body text-xs font-semibold tracking-wide text-[#6B7280] uppercase mb-3">Fitur Utama</h3>
                <ul className="space-y-2">
                  {product.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 font-body text-sm text-[#6B7280]">
                      <CheckCircle2 size={14} strokeWidth={1.5} className="text-[#C9A455] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quantity & Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-[#E8E4DC]">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="p-3 text-[#9C9890] hover:text-[#1C1917] transition-colors"
                  >
                    <Minus size={14} strokeWidth={1.5} />
                  </button>
                  <span className="w-12 text-center font-body text-sm font-medium text-[#1C1917]">{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="p-3 text-[#9C9890] hover:text-[#1C1917] transition-colors"
                  >
                    <Plus size={14} strokeWidth={1.5} />
                  </button>
                </div>
                {product.stock !== null && product.stock !== undefined && (
                  <span className="font-body text-xs text-[#9C9890]">
                    Stok: {product.stock} {product.unit || 'unit'}
                  </span>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={handleAddToCart} className="flex-1 btn-outline justify-center text-sm">
                  <ShoppingBag size={15} strokeWidth={1.5} />
                  Keranjang
                </button>
                <button onClick={handleBuyNow} className="flex-1 btn-primary justify-center text-sm">
                  Pesan Sekarang
                </button>
              </div>
            </div>

            {/* Collection badge */}
            {product.product_collections && (
              <div className="mt-6 pt-6 border-t border-[#E8E4DC]">
                <p className="font-body text-xs text-[#9C9890]">
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
