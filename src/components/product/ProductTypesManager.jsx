import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Trash2, Edit2, Save, X, Loader2, ChevronUp, ChevronDown, Upload, Image as ImageIcon } from 'lucide-react'
import { productTypeService } from '@/services/productService'
import { formatCurrency } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

const F = 'Inter, sans-serif'

const EMPTY_TYPE = {
  name:        '',
  code:        '',
  price:       '',
  unit:        '',
  stock:       '',
  description: '',
  is_active:   true,
  sort_order:  0,
}

function formatRupiah(raw) {
  const digits = String(raw).replace(/\D/g, '')
  if (!digits) return ''
  return new Intl.NumberFormat('id-ID').format(Number(digits))
}
function parseRupiah(formatted) {
  if (!formatted) return ''
  return formatted.replace(/\./g, '').replace(/,/g, '')
}

/* ── Uploader foto per tipe ─────────────────────────────── */
function TypeImageUploader({ typeId, currentUrl, onUploaded }) {
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  async function handleFile(file) {
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Bukan file gambar'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Ukuran maks. 5MB'); return }
    setUploading(true)
    try {
      const ext  = file.name.split('.').pop().toLowerCase()
      const path = `product-types/${typeId}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('glory8-assets')
        .upload(path, file, { upsert: true, cacheControl: '3600' })
      if (upErr) throw upErr
      const { data: { publicUrl } } = supabase.storage
        .from('glory8-assets')
        .getPublicUrl(path)
      const { error: dbErr } = await supabase
        .from('product_types')
        .update({ image_url: publicUrl })
        .eq('id', typeId)
      if (dbErr) throw dbErr
      onUploaded(publicUrl)
      toast.success('Foto tipe berhasil diunggah')
    } catch (err) {
      toast.error(err.message || 'Gagal upload foto')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div
      className="relative border border-dashed border-[#E8E4DC] hover:border-[#C9A455] transition-colors cursor-pointer overflow-hidden rounded-sm"
      style={{ width: 56, height: 56 }}
      onClick={() => fileRef.current?.click()}
      title="Klik untuk upload foto tipe"
    >
      {currentUrl ? (
        <>
          <img src={currentUrl} alt="foto tipe" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Upload size={14} className="text-white" />
          </div>
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-0.5 bg-[#FAF8F4]">
          {uploading
            ? <Loader2 size={14} className="text-[#C9A455] animate-spin" />
            : <><ImageIcon size={14} strokeWidth={1.5} className="text-[#C4BEB5]" />
               <span className="text-[8px] text-[#9C9890]" style={{ fontFamily: F }}>Foto</span></>
          }
        </div>
      )}
      {uploading && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
          <Loader2 size={14} className="text-[#C9A455] animate-spin" />
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={e => handleFile(e.target.files[0])} />
    </div>
  )
}

/* ── Form tambah / edit tipe ────────────────────────────── */
function TypeForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(() => ({
    ...EMPTY_TYPE,
    ...initial,
    price: initial?.price != null && initial.price !== ''
      ? formatRupiah(String(initial.price))
      : '',
  }))

  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(f => ({ ...f, [k]: v }))
  }

  function handlePriceChange(e) {
    setForm(f => ({ ...f, price: formatRupiah(e.target.value) }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Nama tipe wajib diisi'); return }
    onSave({ ...form, price: parseRupiah(form.price) })
  }

  const inputCls = 'w-full px-3 py-2 border border-[#E8E4DC] text-[13px] text-[#1C1917] bg-white focus:outline-none focus:border-[#C9A455] transition-colors'
  const labelCls = 'block text-[10px] font-semibold text-[#9C9890] uppercase tracking-widest mb-1'

  return (
    <form onSubmit={handleSubmit} className="bg-[#FAF8F4] border border-[#E8E4DC] p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">

        <div className="col-span-2 sm:col-span-1">
          <label className={labelCls} style={{ fontFamily: F }}>Nama Tipe *</label>
          <input className={inputCls} value={form.name} onChange={set('name')}
            placeholder="3D Motif, Polos, Kayu Oak..." style={{ fontFamily: F }} required />
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className={labelCls} style={{ fontFamily: F }}>Kode SKU</label>
          <input className={inputCls} value={form.code} onChange={set('code')}
            placeholder="WPC-3D-01 (opsional)" style={{ fontFamily: F }} />
        </div>

        {/* Harga — format Rupiah saat ketik */}
        <div>
          <label className={labelCls} style={{ fontFamily: F }}>Harga (Rp)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9C9890] text-[13px] select-none pointer-events-none"
              style={{ fontFamily: F }}>Rp</span>
            <input
              className={inputCls + ' pl-9'}
              inputMode="numeric"
              value={form.price}
              onChange={handlePriceChange}
              placeholder="0"
              style={{ fontFamily: F }}
            />
          </div>
          <p className="text-[10px] text-[#9C9890] mt-0.5" style={{ fontFamily: F }}>
            Kosongkan jika sama dengan harga produk utama
          </p>
        </div>

        {/* Unit */}
        <div>
          <label className={labelCls} style={{ fontFamily: F }}>Unit</label>
          <input className={inputCls} value={form.unit} onChange={set('unit')}
            placeholder="m², lembar, pcs" style={{ fontFamily: F }} />
        </div>

        {/* Stok */}
        <div>
          <label className={labelCls} style={{ fontFamily: F }}>Stok</label>
          <input className={inputCls} type="number" min="0" value={form.stock}
            onChange={set('stock')} placeholder="Kosong = tidak dilacak" style={{ fontFamily: F }} />
        </div>

        <div className="col-span-2">
          <label className={labelCls} style={{ fontFamily: F }}>Deskripsi Singkat</label>
          <input className={inputCls} value={form.description} onChange={set('description')}
            placeholder="Penjelasan singkat tentang tipe ini (opsional)" style={{ fontFamily: F }} />
        </div>

        <div className="col-span-2 flex items-center gap-2">
          <input type="checkbox" id="type-active" checked={form.is_active}
            onChange={set('is_active')} className="accent-[#C9A455]" />
          <label htmlFor="type-active" className="text-[13px] text-[#6B7280] cursor-pointer"
            style={{ fontFamily: F }}>
            Aktif (tampil di halaman produk)
          </label>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#1C1917] text-white text-[12px] hover:bg-[#C9A455] transition-colors disabled:opacity-50"
          style={{ fontFamily: F }}>
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} strokeWidth={1.5} />}
          {saving ? 'Menyimpan...' : 'Simpan Tipe'}
        </button>
        <button type="button" onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2 border border-[#E8E4DC] text-[#6B7280] text-[12px] hover:border-[#1C1917] transition-colors"
          style={{ fontFamily: F }}>
          <X size={12} strokeWidth={1.5} />
          Batal
        </button>
      </div>
    </form>
  )
}

/* ── Main ───────────────────────────────────────────────── */
export default function ProductTypesManager({ productId }) {
  const [types, setTypes]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId]     = useState(null)

  const load = useCallback(async () => {
    if (!productId) return
    setLoading(true)
    try {
      const data = await productTypeService.getByProduct(productId)
      setTypes(data)
    } catch (_) {
      toast.error('Gagal memuat tipe produk')
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => { load() }, [load])

  async function handleSave(form) {
    setSaving(true)
    try {
      const payload = {
        ...form,
        product_id: productId,
        sort_order: editId
          ? (types.find(t => t.id === editId)?.sort_order ?? types.length)
          : types.length,
      }
      if (editId) payload.id = editId
      await productTypeService.upsert(payload)
      toast.success(editId ? 'Tipe diperbarui' : 'Tipe ditambahkan')
      setShowForm(false)
      setEditId(null)
      await load()
    } catch (err) {
      toast.error(err?.message || 'Gagal menyimpan tipe')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Hapus tipe "${name}"?`)) return
    try {
      await productTypeService.delete(id)
      toast.success('Tipe dihapus')
      await load()
    } catch (_) {
      toast.error('Gagal menghapus tipe')
    }
  }

  async function handleMove(id, dir) {
    const idx     = types.findIndex(t => t.id === id)
    const swapIdx = idx + dir
    if (swapIdx < 0 || swapIdx >= types.length) return
    const updated = [...types]
    const aOrder  = updated[idx].sort_order
    const bOrder  = updated[swapIdx].sort_order
    updated[idx].sort_order     = bOrder
    updated[swapIdx].sort_order = aOrder
    ;[updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]]
    setTypes(updated)
    try {
      await productTypeService.reorder([
        { id: updated[idx].id,     sort_order: updated[idx].sort_order },
        { id: updated[swapIdx].id, sort_order: updated[swapIdx].sort_order },
      ])
    } catch (_) {
      toast.error('Gagal mengubah urutan')
      await load()
    }
  }

  const editingType = editId ? types.find(t => t.id === editId) : null

  if (!productId) {
    return (
      <div className="py-10 text-center">
        <p className="text-[13px] text-[#9C9890]" style={{ fontFamily: F }}>
          Simpan produk terlebih dahulu sebelum menambahkan tipe.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px] font-medium text-[#1C1917]" style={{ fontFamily: F }}>
            Tipe / Varian Produk
          </p>
          <p className="text-[11px] text-[#9C9890] mt-0.5" style={{ fontFamily: F }}>
            Setiap tipe bisa punya harga, unit, stok, dan foto sendiri
          </p>
        </div>
        {!showForm && (
          <button onClick={() => { setEditId(null); setShowForm(true) }}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#1C1917] text-white text-[12px] hover:bg-[#C9A455] transition-colors"
            style={{ fontFamily: F }}>
            <Plus size={13} strokeWidth={1.5} />
            Tambah Tipe
          </button>
        )}
      </div>

      {showForm && (
        <TypeForm
          initial={editingType ? {
            name:        editingType.name,
            code:        editingType.code        || '',
            price:       editingType.price       ?? '',
            unit:        editingType.unit        || '',
            stock:       editingType.stock       ?? '',
            description: editingType.description || '',
            is_active:   editingType.is_active,
            sort_order:  editingType.sort_order,
          } : undefined}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditId(null) }}
          saving={saving}
        />
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={20} className="animate-spin text-[#C9A455]" />
        </div>
      ) : types.length === 0 ? (
        <div className="py-8 text-center border border-dashed border-[#E8E4DC]">
          <p className="text-[12px] text-[#9C9890]" style={{ fontFamily: F }}>
            Belum ada tipe. Klik "Tambah Tipe" untuk mulai.
          </p>
        </div>
      ) : (
        <div className="border border-[#E8E4DC] divide-y divide-[#F0EDE8]">
          {types.map((type, idx) => (
            <div key={type.id}
              className={`flex items-start gap-2 px-3 py-3 ${!type.is_active ? 'opacity-50' : ''} hover:bg-[#FAF8F4] transition-colors`}>

              {/* Urutan ▲▼ */}
              <div className="flex flex-col gap-0.5 flex-shrink-0 pt-0.5">
                <button onClick={() => handleMove(type.id, -1)} disabled={idx === 0}
                  className="p-0.5 text-[#9C9890] hover:text-[#1C1917] disabled:opacity-20 transition-colors">
                  <ChevronUp size={13} strokeWidth={2} />
                </button>
                <button onClick={() => handleMove(type.id, 1)} disabled={idx === types.length - 1}
                  className="p-0.5 text-[#9C9890] hover:text-[#1C1917] disabled:opacity-20 transition-colors">
                  <ChevronDown size={13} strokeWidth={2} />
                </button>
              </div>

              {/* Nomor */}
              <span className="text-[10px] text-[#C9A455] w-4 text-center flex-shrink-0 pt-2" style={{ fontFamily: F }}>
                {String(idx + 1).padStart(2, '0')}
              </span>

              {/* Foto tipe — klik untuk upload */}
              <div className="flex-shrink-0 pt-0.5">
                <TypeImageUploader
                  typeId={type.id}
                  currentUrl={type.image_url || null}
                  onUploaded={(url) => {
                    setTypes(prev => prev.map(t => t.id === type.id ? { ...t, image_url: url } : t))
                  }}
                />
              </div>

              {/* Info tipe */}
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13px] font-medium text-[#1C1917]" style={{ fontFamily: F }}>
                    {type.name}
                  </span>
                  {type.code && (
                    <span className="text-[10px] text-[#9C9890] font-mono bg-[#F5F3EF] px-1.5 py-0.5">
                      {type.code}
                    </span>
                  )}
                  {!type.is_active && (
                    <span className="text-[10px] text-[#9C9890] bg-gray-100 px-1.5 py-0.5" style={{ fontFamily: F }}>
                      Hidden
                    </span>
                  )}
                </div>
                {type.description && (
                  <p className="text-[11px] text-[#9C9890] mt-0.5 truncate" style={{ fontFamily: F }}>
                    {type.description}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-[11px] text-[#1C1917]" style={{ fontFamily: F }}>
                    {type.price != null ? formatCurrency(type.price) : <span className="text-[#9C9890]">Harga induk</span>}
                    {type.unit && <span className="text-[#9C9890]"> / {type.unit}</span>}
                  </span>
                  {type.stock != null && (
                    <span className="text-[11px] text-[#9C9890]" style={{ fontFamily: F }}>
                      Stok: {type.stock}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0 pt-1">
                <button onClick={() => { setEditId(type.id); setShowForm(true) }}
                  className="p-1.5 text-[#9C9890] hover:text-[#C9A455] transition-colors" title="Edit tipe">
                  <Edit2 size={13} strokeWidth={1.5} />
                </button>
                <button onClick={() => handleDelete(type.id, type.name)}
                  className="p-1.5 text-[#9C9890] hover:text-red-500 transition-colors" title="Hapus tipe">
                  <Trash2 size={13} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {types.length > 0 && (
        <p className="text-[10px] text-[#9C9890]" style={{ fontFamily: F }}>
          {types.length} tipe · ▲▼ untuk urutan · Klik foto kecil untuk upload/ganti foto tipe
        </p>
      )}
    </div>
  )
}
