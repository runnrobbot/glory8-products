import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, ArrowUpRight } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { formatCurrency } from '@/lib/utils'

export default function ProductCard({ product, onBuyNow }) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [hovered, setHovered] = useState(false)
  const { addItem } = useCartStore()

  const primaryImage = product.product_images?.find(i => i.is_primary) || product.product_images?.[0]

  function handleAddToCart(e) {
    e.preventDefault()
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      quantity: 1,
      image: primaryImage?.url || '',
    })
  }

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group block bg-white"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-[#F0EDE6]" style={{ aspectRatio: '4/3' }}>
        {!imgLoaded && (
          <div className="absolute inset-0 bg-[#E8E4DC] animate-pulse" />
        )}
        {primaryImage?.url ? (
          <img
            src={primaryImage.url}
            alt={product.name}
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span
              className="text-[48px] font-light text-[#E8E4DC]"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              G8
            </span>
          </div>
        )}

        {/* Category badge */}
        {product.product_categories?.name && (
          <div className="absolute top-3 left-3">
            <span
              className="px-2.5 py-1 text-[9px] tracking-[0.1em] uppercase bg-white/90 text-[#1C1917]"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
            >
              {product.product_categories.name}
            </span>
          </div>
        )}

        {/* Hover overlay — add to cart */}
        <div className={`absolute inset-0 bg-[#1C1917]/40 flex items-center justify-center transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={handleAddToCart}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#1C1917] text-[11px] tracking-[0.06em] hover:bg-[#C9A455] hover:text-white transition-colors"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
          >
            <ShoppingCart size={13} strokeWidth={1.5} />
            Tambah ke Keranjang
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3
          className="text-[#1C1917] text-[15px] leading-snug mb-1 line-clamp-1 group-hover:text-[#C9A455] transition-colors"
          style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 500 }}
        >
          {product.name}
        </h3>
        {product.short_description && (
          <p
            className="text-[#9C9890] text-[11px] leading-relaxed line-clamp-2 mb-3"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {product.short_description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span
            className="text-[#1C1917] text-[14px] font-medium"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {formatCurrency(product.price)}
            <span className="text-[#9C9890] text-[11px] font-normal ml-1">/ {product.unit}</span>
          </span>
          <ArrowUpRight
            size={14}
            strokeWidth={1.5}
            className="text-[#C4BEB5] group-hover:text-[#C9A455] transition-colors"
          />
        </div>
      </div>
    </Link>
  )
}
