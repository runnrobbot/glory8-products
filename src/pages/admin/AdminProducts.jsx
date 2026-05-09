import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Plus, Search, Edit2, Trash2, Eye, EyeOff,
  Upload, X, Star, Image as ImageIcon, Loader2
} from 'lucide-react'
import { productService } from '@/services/productService'
import { useCategories, useCollections, invalidateCache } from '@/hooks/useProducts'
import { formatCurrency, slugify } from '@/lib/utils'
import Modal from '@/components/ui/Modal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import ProductTypesManager from '@/components/product/ProductTypesManager'
import toast from 'react-hot-toast'

/* ─── constants ──────────────────────────────────────────────── */
const EMPTY_FORM = {
  name: '', slug: '', short_description: '', description: '',
  price: '', unit: 'm²', stock: '', category_id: '', collection_id: '',
  thickness: '', dimensions: '', installation_type: '', water_resistance: '',
  is_active: true, is_featured: false, features: '',
}

const F = 'Inter, sans-serif'
const SERIF = 'Cormorant Garamond, serif'

/* ─── Styled helpers ─────────────────────────────────────────── */
function Label({ children }) {
  return (
    <label className="block text-[11px] font-medium text-[#6B7280] tracking-[0.06em] uppercase mb-1.5" style={{ fontFamily: F }}>
      {children}
    </label>
  )
}
function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full px-3 py-2.5 border border-[#E8E4DC] text-[13px] text-[#1C1917] bg-white focus:outline-none focus:border-[#C9A455] transition-colors ${className}`}
      style={{ fontFamily: F }}
      {...props}
    />
  )
}

/* ─── Image uploader ─────────────────────────────────────────── */
function ImageUploader({ productId }) {
  const [images, setImages]       = useState([])
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver]   = useState(false)
  const [loadingImgs, setLoadingImgs] = useState(false)
  const fileInputRef              = useRef()

  // Load existing images saat productId pertama tersedia
  useEffect(() => {
    if (!productId) return
    let cancel = false
    setLoadingImgs(true)
    productService.getProductImages(productId).then(imgs => {
      if (cancel) return
      setImages(imgs)
    }).catch(() => {}).finally(() => {
      if (!cancel) setLoadingImgs(false)
    })
    return () => { cancel = true }
  }, [productId])

  const handleFiles = useCallback(async (files) => {
    const valid = Array.from(files).filter(f => {
      if (!f.type.startsWith('image/')) { toast.error(`${f.name} bukan gambar`); return false }
      if (f.size > 5 * 1024 * 1024)    { toast.error(`${f.name} melebihi 5MB`);  return false }
      return true
    })
    if (!valid.length || !productId) return

    setUploading(true)
    const uploaded = []
    for (const file of valid) {
      try {
        const isPrimary = images.length === 0 && uploaded.length === 0
        const record    = await productService.uploadProductImage(file, productId, isPrimary)
        uploaded.push(record)
      } catch (err) {
        toast.error(`Gagal upload ${file.name}: ${err.message}`)
      }
    }
    setImages(prev => [...prev, ...uploaded])
    setUploading(false)
    if (uploaded.length) toast.success(`${uploaded.length} foto berhasil diunggah`)
  }, [productId, images.length]) // eslint-disable-line

  const handleDelete = async (img) => {
    if (!confirm('Hapus foto ini?')) return
    try {
      await productService.deleteProductImage(img.id, img.url)
      setImages(prev => prev.filter(i => i.id !== img.id))
      toast.success('Foto dihapus')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleSetPrimary = async (img) => {
    if (img.is_primary) return
    try {
      await productService.setImagePrimary(img.id, productId)
      setImages(prev => prev.map(i => ({ ...i, is_primary: i.id === img.id })))
      toast.success('Foto utama diperbarui')
    } catch (err) {
      toast.error(err.message)
    }
  }

  if (!productId) {
    return (
      <p className="text-[12px] text-[#9C9890] py-4 text-center" style={{ fontFamily: F }}>
        Simpan informasi produk terlebih dahulu, lalu foto dapat diunggah.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 py-8
          ${dragOver ? 'border-[#C9A455] bg-[#FDF6E7]' : 'border-[#E8E4DC] hover:border-[#C9A455] bg-[#FAF8F4]'}`}
      >
        {uploading ? (
          <>
            <Loader2 size={22} className="text-[#C9A455] animate-spin" />
            <p className="text-[12px] text-[#9C9890]" style={{ fontFamily: F }}>Mengunggah...</p>
          </>
        ) : (
          <>
            <Upload size={22} strokeWidth={1.5} className="text-[#C9A455]" />
            <p className="text-[12px] text-[#1C1917] font-medium" style={{ fontFamily: F }}>Klik atau seret foto ke sini</p>
            <p className="text-[11px] text-[#9C9890]" style={{ fontFamily: F }}>PNG, JPG, WebP — maks. 5MB per file</p>
          </>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
      </div>

      {/* Loading indicator */}
      {loadingImgs && (
        <div className="flex items-center justify-center py-4">
          <Loader2 size={18} className="text-[#C9A455] animate-spin" />
        </div>
      )}

      {/* Preview grid */}
      {!loadingImgs && images.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map(img => (
            <div key={img.id} className="relative group aspect-square bg-[#F5F2EC] overflow-hidden">
              <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                <button type="button" onClick={() => handleSetPrimary(img)} title="Jadikan foto utama"
                  className={`p-1.5 rounded-sm transition-colors ${img.is_primary ? 'bg-[#C9A455] text-white' : 'bg-white text-[#1C1917] hover:bg-[#C9A455] hover:text-white'}`}>
                  <Star size={11} strokeWidth={2} />
                </button>
                <button type="button" onClick={() => handleDelete(img)} title="Hapus foto"
                  className="p-1.5 bg-white text-red-500 hover:bg-red-500 hover:text-white rounded-sm transition-colors">
                  <X size={11} strokeWidth={2} />
                </button>
              </div>
              {img.is_primary && (
                <div className="absolute top-1 left-1">
                  <span className="bg-[#C9A455] text-white text-[8px] px-1.5 py-0.5 flex items-center gap-0.5" style={{ fontFamily: F }}>
                    <Star size={7} strokeWidth={2} fill="white" /> Utama
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loadingImgs && images.length === 0 && !uploading && (
        <p className="text-[11px] text-[#9C9890] text-center" style={{ fontFamily: F }}>Belum ada foto — upload foto di atas</p>
      )}
    </div>
  )
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function AdminProducts() {
  const [search, setSearch]             = useState('')
  const [products, setProducts]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [showModal, setShowModal]       = useState(false)
  const [editProduct, setEditProduct]   = useState(null)
  const [form, setForm]                 = useState(EMPTY_FORM)
  const [saving, setSaving]             = useState(false)
  const [savedProductId, setSavedProductId] = useState(null)
  const [activeTab, setActiveTab]       = useState('info')
  const searchTimerRef                  = useRef(null)
  const activeRequestRef                = useRef(0) // untuk batalkan request lama

  const { data: categories } = useCategories()
  const { data: collections } = useCollections()

  /* ── Fetch products ── */
  const fetchProducts = useCallback(async (q = '') => {
    const requestId = ++activeRequestRef.current
    setLoading(true)
    try {
      const result = await productService.getAllProducts({ search: q || undefined })
      // Abaikan jika ada request lebih baru
      if (requestId !== activeRequestRef.current) return
      setProducts(result.data || [])
    } catch (err) {
      if (requestId !== activeRequestRef.current) return
      toast.error(err.message)
    } finally {
      if (requestId === activeRequestRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts('')
    return () => { activeRequestRef.current++ } // cancel saat unmount
  }, [fetchProducts])

  const handleSearchChange = (val) => {
    setSearch(val)
    clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => fetchProducts(val), 350)
  }

  /* ── Modal helpers ── */
  function openCreate() {
    setEditProduct(null)
    setSavedProductId(null)
    setForm(EMPTY_FORM)
    setActiveTab('info')
    setShowModal(true)
  }

  function openEdit(product) {
    setEditProduct(product)
    setSavedProductId(product.id)
    setForm({
      name:              product.name              || '',
      slug:              product.slug              || '',
      short_description: product.short_description || '',
      description:       product.description       || '',
      price:             product.price             ?? '',
      unit:              product.unit              || 'm²',
      stock:             product.stock             ?? '',
      category_id:       product.category_id       || '',
      collection_id:     product.collection_id     || '',
      thickness:         product.thickness         || '',
      dimensions:        product.dimensions        || '',
      installation_type: product.installation_type || '',
      water_resistance:  product.water_resistance  || '',
      is_active:         product.is_active         ?? true,
      is_featured:       product.is_featured       ?? false,
      features:          Array.isArray(product.features) ? product.features.join('\n') : '',
    })
    setActiveTab('info')
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditProduct(null)
    setSavedProductId(null)
    setActiveTab('info')
    invalidateCache('products:')
    fetchProducts(search)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const v = type === 'checkbox' ? checked : value
    setForm(f => ({
      ...f,
      [name]: v,
      ...(name === 'name' && !editProduct ? { slug: slugify(v) } : {}),
    }))
  }

  /* ── Save product info ── */
  const handleSaveInfo = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        // Sanitasi di sini juga sebagai lapisan kedua
        category_id:   form.category_id   || null,
        collection_id: form.collection_id || null,
        price:         form.price !== '' ? parseFloat(form.price) : null,
        stock:         form.stock !== '' ? parseInt(form.stock)   : null,
        features:      form.features ? form.features.split('\n').filter(Boolean) : [],
      }
      if (editProduct) payload.id = editProduct.id

      const saved = await productService.upsertProduct(payload)
      setSavedProductId(saved.id)
      if (!editProduct) setEditProduct(saved)

      toast.success(editProduct ? 'Produk diperbarui' : 'Produk disimpan — isi tipe produk sekarang')
      if (!editProduct) setActiveTab('types')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  /* ── Delete ── */
  const handleDelete = async (product) => {
    if (!confirm(`Hapus "${product.name}"? Semua foto produk juga akan dihapus.`)) return
    try {
      await productService.deleteProduct(product.id)
      invalidateCache('products:')
      toast.success('Produk dihapus')
      fetchProducts(search)
    } catch (err) {
      toast.error(err.message)
    }
  }

  /* ── Primary image helper ── */
  const getPrimaryImg = (product) => {
    const imgs = product.product_images || []
    return imgs.find(i => i.is_primary)?.url || imgs[0]?.url || null
  }

  /* ─── RENDER ─────────────────────────────────────────────── */
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[#1C1917] text-[28px]" style={{ fontFamily: SERIF, fontWeight: 400 }}>Produk</h1>
          <p className="text-[#9C9890] text-[13px] mt-0.5" style={{ fontFamily: F }}>{products.length} produk</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1C1917] text-white text-[12px] tracking-[0.04em] hover:bg-[#C9A455] transition-colors"
          style={{ fontFamily: F }}>
          <Plus size={14} strokeWidth={1.5} /> Tambah Produk
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9C9890]" />
        <input type="text" placeholder="Cari produk..." value={search}
          onChange={e => handleSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-[#E8E4DC] text-[13px] text-[#1C1917] bg-white focus:outline-none focus:border-[#C9A455] transition-colors"
          style={{ fontFamily: F }} />
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner />
      ) : products.length === 0 ? (
        <EmptyState icon={ImageIcon} title="Belum ada produk" description="Tambahkan produk pertama Anda"
          action={<button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-[#1C1917] text-white text-[12px] hover:bg-[#C9A455] transition-colors" style={{ fontFamily: F }}><Plus size={14} />Tambah Produk</button>} />
      ) : (
        <div className="bg-white border border-[#E8E4DC] overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-[#E8E4DC] bg-[#FAF8F4]">
                {['Produk', 'Kategori', 'Harga', 'Stok', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-[#9C9890] uppercase tracking-widest" style={{ fontFamily: F }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EDE6]">
              {products.map(product => {
                const img = getPrimaryImg(product)
                return (
                  <tr key={product.id} className="hover:bg-[#FAF8F4] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#F5F2EC] flex-shrink-0 overflow-hidden border border-[#E8E4DC]">
                          {img ? (
                            <img src={img} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon size={13} strokeWidth={1} className="text-[#C4BEB5]" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[#1C1917] text-[13px] font-medium truncate" style={{ fontFamily: F }}>{product.name}</p>
                          <p className="text-[#C4BEB5] text-[10px] font-mono">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#9C9890] text-[13px]" style={{ fontFamily: F }}>
                      {product.product_categories?.name || '—'}
                    </td>
                    <td className="px-4 py-3 text-[#1C1917] text-[13px] font-medium whitespace-nowrap" style={{ fontFamily: F }}>
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-4 py-3 text-[#9C9890] text-[13px]" style={{ fontFamily: F }}>
                      {product.stock ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 ${product.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-[#9C9890]'}`} style={{ fontFamily: F }}>
                        {product.is_active ? <Eye size={9} /> : <EyeOff size={9} />}
                        {product.is_active ? 'Aktif' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => openEdit(product)} className="p-1.5 text-[#9C9890] hover:text-[#C9A455] transition-colors">
                          <Edit2 size={13} strokeWidth={1.5} />
                        </button>
                        <button onClick={() => handleDelete(product)} className="p-1.5 text-[#9C9890] hover:text-red-500 transition-colors">
                          <Trash2 size={13} strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Product Modal ── */}
      <Modal isOpen={showModal} onClose={closeModal} title={editProduct ? `Edit: ${editProduct.name}` : 'Tambah Produk Baru'} size="lg">
        {/* Tabs */}
        <div className="flex border-b border-[#E8E4DC] mb-5 -mt-1">
          {[
            { key: 'info',     label: 'Informasi Produk' },
            { key: 'types',    label: savedProductId ? 'Tipe Produk' : 'Tipe (simpan dulu)' },
            { key: 'photos',   label: savedProductId ? 'Foto Produk' : 'Foto (simpan dulu)' },
          ].map(tab => (
            <button key={tab.key} type="button"
              disabled={tab.key !== 'info' && !savedProductId}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 text-[12px] tracking-[0.04em] border-b-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                activeTab === tab.key
                  ? 'border-[#C9A455] text-[#1C1917] font-medium'
                  : 'border-transparent text-[#9C9890] hover:text-[#1C1917]'
              }`}
              style={{ fontFamily: F }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Informasi */}
        {activeTab === 'info' && (
          <form onSubmit={handleSaveInfo} className="space-y-4">
            <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">

              <div className="col-span-2">
                <Label>Nama Produk *</Label>
                <Input name="name" value={form.name} onChange={handleChange} required placeholder="Nama produk" />
              </div>

              <div className="col-span-2">
                <Label>Slug *</Label>
                <Input name="slug" value={form.slug} onChange={handleChange} required className="font-mono text-[12px]" />
              </div>

              <div>
                <Label>Harga (Rp)</Label>
                <Input name="price" type="number" min="0" value={form.price} onChange={handleChange} placeholder="0" />
              </div>

              <div>
                <Label>Unit</Label>
                <Input name="unit" value={form.unit} onChange={handleChange} placeholder="m², lembar, pcs" />
              </div>

              <div>
                <Label>Stok</Label>
                <Input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} placeholder="0" />
              </div>

              <div>
                <Label>Kategori</Label>
                <select name="category_id" value={form.category_id} onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-[#E8E4DC] text-[13px] text-[#1C1917] bg-white focus:outline-none focus:border-[#C9A455] transition-colors"
                  style={{ fontFamily: F }}>
                  <option value="">Pilih kategori...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <Label>Koleksi</Label>
                <select name="collection_id" value={form.collection_id} onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-[#E8E4DC] text-[13px] text-[#1C1917] bg-white focus:outline-none focus:border-[#C9A455] transition-colors"
                  style={{ fontFamily: F }}>
                  <option value="">Pilih koleksi...</option>
                  {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <Label>Ketebalan</Label>
                <Input name="thickness" value={form.thickness} onChange={handleChange} placeholder="12mm" />
              </div>

              <div>
                <Label>Dimensi</Label>
                <Input name="dimensions" value={form.dimensions} onChange={handleChange} placeholder="120x20cm" />
              </div>

              <div>
                <Label>Tipe Instalasi</Label>
                <Input name="installation_type" value={form.installation_type} onChange={handleChange} placeholder="Interlocking, Lem, dll" />
              </div>

              <div>
                <Label>Water Resistance</Label>
                <Input name="water_resistance" value={form.water_resistance} onChange={handleChange} placeholder="100%, Waterproof" />
              </div>

              <div className="col-span-2">
                <Label>Deskripsi Singkat</Label>
                <Input name="short_description" value={form.short_description} onChange={handleChange} placeholder="Ringkasan singkat produk" />
              </div>

              <div className="col-span-2">
                <Label>Deskripsi Lengkap</Label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                  className="w-full px-3 py-2.5 border border-[#E8E4DC] text-[13px] text-[#1C1917] bg-white focus:outline-none focus:border-[#C9A455] transition-colors resize-none"
                  style={{ fontFamily: F }} placeholder="Deskripsi detail produk..." />
              </div>

              <div className="col-span-2">
                <Label>Fitur (satu per baris)</Label>
                <textarea name="features" value={form.features} onChange={handleChange} rows={3}
                  className="w-full px-3 py-2.5 border border-[#E8E4DC] text-[13px] text-[#1C1917] bg-white focus:outline-none focus:border-[#C9A455] transition-colors resize-none"
                  style={{ fontFamily: F }} placeholder={'Tahan air\nAnti gores\nMudah dipasang'} />
              </div>

              <div className="col-span-2 flex items-center gap-6">
                {[
                  { name: 'is_active',   label: 'Aktif (tampil di website)' },
                  { name: 'is_featured', label: 'Unggulan' },
                ].map(opt => (
                  <label key={opt.name} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name={opt.name} checked={form[opt.name]} onChange={handleChange} className="accent-[#C9A455]" />
                    <span className="text-[13px] text-[#6B7280]" style={{ fontFamily: F }}>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-[#E8E4DC]">
              <button type="button" onClick={closeModal}
                className="flex-1 px-4 py-2.5 border border-[#E8E4DC] text-[12px] text-[#6B7280] hover:border-[#1C1917] hover:text-[#1C1917] transition-colors"
                style={{ fontFamily: F }}>
                Batal
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1C1917] text-white text-[12px] hover:bg-[#C9A455] transition-colors disabled:opacity-50"
                style={{ fontFamily: F }}>
                {saving && <Loader2 size={13} className="animate-spin" />}
                {saving ? 'Menyimpan...' : editProduct ? 'Perbarui Produk' : 'Simpan & Lanjut ke Foto'}
              </button>
            </div>
          </form>
        )}

        {/* Tab: Foto */}
        {activeTab === 'photos' && (
          <div className="space-y-4">
            <p className="text-[12px] text-[#9C9890] leading-relaxed" style={{ fontFamily: F }}>
              Upload beberapa foto. Klik ⭐ untuk menjadikan foto utama yang tampil di listing produk.
            </p>
            <ImageUploader productId={savedProductId} />
            <div className="pt-3 border-t border-[#E8E4DC]">
              <button type="button" onClick={closeModal}
                className="w-full px-4 py-2.5 bg-[#1C1917] text-white text-[12px] hover:bg-[#C9A455] transition-colors"
                style={{ fontFamily: F }}>
                Selesai
              </button>
            </div>
          </div>
        )}

        {/* Tab: Tipe Produk */}
        {activeTab === 'types' && (
          <div className="space-y-4">
            <ProductTypesManager productId={savedProductId} />
            <div className="pt-3 border-t border-[#E8E4DC] flex gap-3">
              <button type="button" onClick={closeModal}
                className="flex-1 px-4 py-2.5 border border-[#E8E4DC] text-[12px] text-[#6B7280] hover:border-[#1C1917] hover:text-[#1C1917] transition-colors"
                style={{ fontFamily: F }}>
                Selesai
              </button>
              <button type="button" onClick={() => setActiveTab('photos')}
                className="flex-1 px-4 py-2.5 bg-[#1C1917] text-white text-[12px] hover:bg-[#C9A455] transition-colors"
                style={{ fontFamily: F }}>
                Lanjut ke Foto →
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
