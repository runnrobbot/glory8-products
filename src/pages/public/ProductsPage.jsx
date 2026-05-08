import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, SlidersHorizontal, ChevronDown } from 'lucide-react'
import ProductCard from '@/components/product/ProductCard'
import { SkeletonGrid } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import WhatsAppOrderModal from '@/components/shared/WhatsAppOrderModal'
import { useProducts, useCategories, useCollections } from '@/hooks/useProducts'
import { usePageMeta } from '@/hooks/usePageMeta'

const F = 'Inter, sans-serif'

const SORT_OPTIONS = [
  { value: 'newest',    label: 'Terbaru' },
  { value: 'price_asc', label: 'Harga: Terendah' },
  { value: 'price_desc','label': 'Harga: Tertinggi' },
  { value: 'name_asc',  label: 'Nama: A–Z' },
]

const PRICE_RANGES = [
  { label: 'Semua Harga', min: null, max: null },
  { label: '< Rp 100.000',       min: null,   max: 100000 },
  { label: 'Rp 100.000 – 300.000', min: 100000, max: 300000 },
  { label: 'Rp 300.000 – 600.000', min: 300000, max: 600000 },
  { label: '> Rp 600.000',        min: 600000, max: null },
]

// ── Chip aktif ────────────────────────────────────────────────
function ActiveChip({ label, onRemove }) {
  return (
    <span
      className="inline-flex items-center gap-1 bg-[#FAF8F4] text-[#B8933F] text-[11px] px-3 py-1 border border-[#E8E4DC]"
      style={{ fontFamily: F }}
    >
      {label}
      <button onClick={onRemove} className="hover:text-red-400 transition-colors ml-0.5">
        <X size={11} strokeWidth={2} />
      </button>
    </span>
  )
}

// ── Dropdown helper ───────────────────────────────────────────
function FilterDropdown({ label, value, options, onChange, valueKey = 'value', labelKey = 'label' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const selected = options.find(o => o[valueKey] === value)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 px-3 py-2 border text-[12px] transition-colors whitespace-nowrap ${
          value ? 'border-[#C9A455] text-[#C9A455]' : 'border-[#E8E4DC] text-[#6B7280] hover:border-[#1C1917]'
        }`}
        style={{ fontFamily: F }}
      >
        {selected ? selected[labelKey] : label}
        <ChevronDown size={12} strokeWidth={2} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full left-0 mt-1 bg-white border border-[#E8E4DC] shadow-lg z-50 min-w-[180px]"
          >
            {options.map((opt) => (
              <button
                key={opt[valueKey] ?? 'all'}
                onClick={() => { onChange(opt[valueKey]); setOpen(false) }}
                className={`w-full text-left px-4 py-2.5 text-[12px] hover:bg-[#FAF8F4] transition-colors ${
                  value === opt[valueKey] ? 'text-[#C9A455] font-medium' : 'text-[#1C1917]'
                }`}
                style={{ fontFamily: F }}
              >
                {opt[labelKey]}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Chip kategori ─────────────────────────────────────────────
function CategoryChips({ categories, selected, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
      <button
        onClick={() => onSelect('')}
        className={`flex-shrink-0 px-4 py-1.5 text-[12px] border transition-all ${
          !selected
            ? 'bg-[#1C1917] text-white border-[#1C1917]'
            : 'bg-white text-[#6B7280] border-[#E8E4DC] hover:border-[#1C1917]'
        }`}
        style={{ fontFamily: F }}
      >
        Semua
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(selected === cat.slug ? '' : cat.slug)}
          className={`flex-shrink-0 px-4 py-1.5 text-[12px] border transition-all ${
            selected === cat.slug
              ? 'bg-[#1C1917] text-white border-[#1C1917]'
              : 'bg-white text-[#6B7280] border-[#E8E4DC] hover:border-[#1C1917]'
          }`}
          style={{ fontFamily: F }}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}

// ── Sort client-side karena useProducts tidak support sort param ──
function sortProducts(products, sort) {
  const arr = [...products]
  switch (sort) {
    case 'price_asc':  return arr.sort((a, b) => (a.price || 0) - (b.price || 0))
    case 'price_desc': return arr.sort((a, b) => (b.price || 0) - (a.price || 0))
    case 'name_asc':   return arr.sort((a, b) => a.name.localeCompare(b.name, 'id'))
    default:           return arr // newest = default dari DB (created_at desc)
  }
}

function filterByPrice(products, rangeLabel) {
  const range = PRICE_RANGES.find(r => r.label === rangeLabel)
  if (!range || (!range.min && !range.max)) return products
  return products.filter(p => {
    const price = p.price || 0
    if (range.min && price < range.min) return false
    if (range.max && price > range.max) return false
    return true
  })
}

// ── MAIN ──────────────────────────────────────────────────────
export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [orderModalOpen, setOrderModalOpen] = useState(false)
  const [search, setSearch] = useState(searchParams.get('search') || '')

  // Filter state — semuanya dari URL agar bisa share link
  const category   = searchParams.get('category') || ''
  const collection = searchParams.get('collection') || ''
  const priceRange = searchParams.get('price') || ''
  const sort       = searchParams.get('sort') || 'newest'

  const { data: categories } = useCategories()
  const { data: collections } = useCollections()

  usePageMeta({
    title:       'Katalog Produk',
    description: 'Temukan koleksi WPC Wall Panel, SPC Flooring, Vinyl, dan PVC Panel terbaik dari Glory8 Products.',
    url:         'https://glory8.id/products',
  })

  // Cari category_id dari slug
  const selectedCat = categories.find(c => c.slug === category)

  const { data: rawProducts, loading } = useProducts({
    category:   selectedCat?.id,
    collection: collection || undefined,
    search:     search || undefined,
  })

  // Sort & filter harga di client
  const products = sortProducts(filterByPrice(rawProducts, priceRange), sort)

  function setParam(key, value) {
    const p = new URLSearchParams(searchParams)
    if (value) p.set(key, value)
    else p.delete(key)
    setSearchParams(p)
  }

  function clearAll() {
    setSearch('')
    setSearchParams({})
  }

  // Search dengan debounce ringan
  useEffect(() => {
    const t = setTimeout(() => setParam('search', search), 350)
    return () => clearTimeout(t)
  }, [search]) // eslint-disable-line

  const hasFilters = category || collection || priceRange || search || sort !== 'newest'

  // Label chip untuk filter aktif
  const activeChips = []
  if (category) {
    const cat = categories.find(c => c.slug === category)
    if (cat) activeChips.push({ label: cat.name, clear: () => setParam('category', '') })
  }
  if (collection) {
    const col = collections.find(c => c.id === collection)
    if (col) activeChips.push({ label: col.name, clear: () => setParam('collection', '') })
  }
  if (priceRange) {
    activeChips.push({ label: priceRange, clear: () => setParam('price', '') })
  }
  if (search) {
    activeChips.push({ label: `"${search}"`, clear: () => setSearch('') })
  }
  if (sort !== 'newest') {
    const s = SORT_OPTIONS.find(o => o.value === sort)
    if (s) activeChips.push({ label: s.label, clear: () => setParam('sort', '') })
  }

  return (
    <div className="min-h-screen bg-[#FAF8F4] pt-20">
      {/* Page header */}
      <div className="bg-white border-b border-[#E8E4DC] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <p className="section-subtitle">Katalog</p>
            <h1 className="section-title">Produk Premium</h1>
            <p className="font-body text-sm text-[#9C9890] mt-2">
              Material interior dan arsitektur pilihan untuk hunian dan komersial
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Kategori chips ── */}
        {categories.length > 0 && (
          <div className="mb-6">
            <CategoryChips
              categories={categories}
              selected={category}
              onSelect={(slug) => setParam('category', slug)}
            />
          </div>
        )}

        {/* ── Filter bar ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4 relative z-10">
          {/* Search — full width mobile */}
          <div className="relative w-full sm:flex-1 sm:max-w-xs">
            <Search size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9C9890]" />
            <input
              type="text"
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-[#E8E4DC] text-[13px] text-[#1C1917] bg-white focus:outline-none focus:border-[#C9A455] placeholder:text-[#9C9890] transition-colors"
              style={{ fontFamily: F }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9C9890] hover:text-[#1C1917]"
              >
                <X size={13} strokeWidth={2} />
              </button>
            )}
          </div>

          {/* Dropdowns */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Koleksi */}
            {collections.length > 0 && (
              <FilterDropdown
                label="Koleksi"
                value={collection}
                options={[
                  { value: '', label: 'Semua Koleksi' },
                  ...collections.map(c => ({ value: c.id, label: c.name })),
                ]}
                onChange={(v) => setParam('collection', v)}
              />
            )}

            {/* Harga */}
            <FilterDropdown
              label="Harga"
              value={priceRange}
              options={PRICE_RANGES.map(r => ({ value: r.label, label: r.label }))}
              onChange={(v) => setParam('price', v === 'Semua Harga' ? '' : v)}
            />

            {/* Urutkan */}
            <FilterDropdown
              label="Urutkan"
              value={sort}
              options={SORT_OPTIONS}
              onChange={(v) => setParam('sort', v)}
            />

            {/* Clear all */}
            {hasFilters && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1.5 text-[11px] text-[#9C9890] hover:text-red-400 transition-colors px-2 py-2"
                style={{ fontFamily: F }}
              >
                <X size={11} strokeWidth={2} />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* ── Active filter chips ── */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-[11px] text-[#9C9890]" style={{ fontFamily: F }}>Filter aktif:</span>
            {activeChips.map((chip, i) => (
              <ActiveChip key={i} label={chip.label} onRemove={chip.clear} />
            ))}
          </div>
        )}

        {/* ── Products ── */}
        {loading ? (
          <SkeletonGrid count={8} />
        ) : products.length === 0 ? (
          <EmptyState
            title="Produk tidak ditemukan"
            description="Coba ubah filter atau kata kunci pencarian Anda"
          />
        ) : (
          <>
            <p className="font-body text-[11px] text-[#9C9890] mb-6" style={{ fontFamily: F }}>
              {products.length} produk ditemukan
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3) }}
                >
                  <ProductCard product={product} onBuyNow={() => setOrderModalOpen(true)} />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      <WhatsAppOrderModal isOpen={orderModalOpen} onClose={() => setOrderModalOpen(false)} />
    </div>
  )
}
