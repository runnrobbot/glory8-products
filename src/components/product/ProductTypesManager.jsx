import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Trash2, Edit2, Save, X, Loader2, ChevronUp, ChevronDown, Upload, Image as ImageIcon } from 'lucide-react'
import { productTypeService } from '@/services/productService'
import { formatCurrency } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

const F = 'Inter, sans-serif'

const EMPTY_TYPE = {
  name: '', code: '', price: '', unit: '',
  stock: '', description: '', is_active: true, sort_order: 0,
}

/* ── Rupiah helpers ─────────────────────────────────────── */
function fmtRupiah(raw) {
  const digits = String(raw ?? '').replace(/\D/g, '')
  if (!digits) return ''
  return new Intl.NumberFormat('id-ID').format(Number(digits))
}
function parseRupiah(str) {
  if (!str && str !== 0) return ''
  return String(str).replace(/\./g, '').replace(/,/g, '')
}

/* ── Upload helper (untuk DB type) ─────────────────────── */
async function uploadTypeImage(file, typeId) {
  const ext  = file.name.split('.').pop().toLowerCase()
  const path = `product-types/${typeId}/${Date.now()}.${ext}`
  const { error: upErr } = await supabase.storage
    .from('glory8-assets')
    .upload(path, file, { upsert: true, cacheControl: '3600' })
  if (upErr) throw upErr
  const { data: { publicUrl } } = supabase.storage
    .from('glory8-assets')
    .getPublicUrl(path)
  return publicUrl
}

/* ── ImageField — dipakai di dalam TypeForm ────────────── */
function ImageField({ preview, onChange, isPending }) {
  const fileRef = useRef()

  function handleFile(file) {
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Bukan file gambar'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Ukuran maks. 5MB'); return }
    const url = URL.createObjectURL(file)
    onChange(file, url)
  }

  return (
    <div className="col-span-2">
      <label className="block text-[10px] font-semibold text-[#9C9890] uppercase tracking-widest mb-1" style={{ fontFamily: F }}>
        Foto Tipe
        {isPending && <span className="normal-case font-normal tracking-normal text-amber-600 ml-1">(foto diupload saat produk disimpan)</span>}
      </label>

      <div className="flex items-start gap-3">
        {/* Preview */}
        <div className="w-16 h-16 flex-shrink-0 bg-[#F5F3EF] border border-[#E8E4DC] overflow-hidden">
          {preview
            ? <img src={preview} alt="preview" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={16} strokeWidth={1.5} className="text-[#C4BEB5]" /></div>
          }
        </div>

        {/* Button + drag area */}
        <div
          className="flex-1 border border-dashed border-[#E8E4DC] hover:border-[#C9A455] transition-colors cursor-pointer bg-[#FAF8F4] flex items-center justify-center gap-2 px-3 h-16"
          onClick={() => fileRef.current?.click()}
          onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
          onDragOver={e => e.preventDefault()}
        >
          <Upload size={14} strokeWidth={1.5} className="text-[#C9A455] flex-shrink-0" />
          <span className="text-[12px] text-[#6B7280]" style={{ fontFamily: F }}>
            {preview ? 'Ganti foto' : 'Pilih atau seret foto'}
          </span>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={e => handleFile(e.target.files[0])} />
      </div>
      <p className="text-[10px] text-[#9C9890] mt-1" style={{ fontFamily: F }}>PNG, JPG, WebP — maks. 5MB</p>
    </div>
  )
}

/* ── TypeForm ───────────────────────────────────────────── */
function TypeForm({ initial, onSave, onCancel, saving, isPending }) {
  const [form, setForm] = useState(() => ({
    ...EMPTY_TYPE,
    ...initial,
    price: initial?.price != null && initial.price !== ''
      ? fmtRupiah(String(initial.price))
      : '',
  }))
  const [imageFile, setImageFile]       = useState(null)
  const [imagePreview, setImagePreview] = useState(initial?.image_url || null)

  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(f => ({ ...f, [k]: v }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Nama tipe wajib diisi'); return }
    onSave({
      ...form,
      price:       parseRupiah(form.price),
      _imageFile:  imageFile,
      image_url:   imagePreview || initial?.image_url || null,
    })
  }

  const inp = 'w-full px-3 py-2 border border-[#E8E4DC] text-[13px] text-[#1C1917] bg-white focus:outline-none focus:border-[#C9A455] transition-colors'
  const lbl = 'block text-[10px] font-semibold text-[#9C9890] uppercase tracking-widest mb-1'

  return (
    <form onSubmit={handleSubmit} className="bg-[#FAF8F4] border border-[#E8E4DC] p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">

        <div className="col-span-2 sm:col-span-1">
          <label className={lbl} style={{ fontFamily: F }}>Nama Tipe *</label>
          <input className={inp} value={form.name} onChange={set('name')}
            placeholder="3D Motif, Polos, Kayu Oak..." style={{ fontFamily: F }} required />
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className={lbl} style={{ fontFamily: F }}>Kode SKU</label>
          <input className={inp} value={form.code} onChange={set('code')}
            placeholder="WPC-3D-01 (opsional)" style={{ fontFamily: F }} />
        </div>

        {/* Harga */}
        <div>
          <label className={lbl} style={{ fontFamily: F }}>Harga (Rp)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9C9890] text-[13px] select-none pointer-events-none" style={{ fontFamily: F }}>Rp</span>
            <input className={inp + ' pl-9'} inputMode="numeric"
              value={form.price} onChange={e => setForm(f => ({ ...f, price: fmtRupiah(e.target.value) }))}
              placeholder="0" style={{ fontFamily: F }} />
          </div>
          {form.price && <p className="text-[10px] text-[#9C9890] mt-0.5" style={{ fontFamily: F }}>Rp {form.price}</p>}
          <p className="text-[10px] text-[#9C9890] mt-0.5" style={{ fontFamily: F }}>Kosongkan = pakai harga produk utama</p>
        </div>

        {/* Unit */}
        <div>
          <label className={lbl} style={{ fontFamily: F }}>Unit</label>
          <input className={inp} value={form.unit} onChange={set('unit')}
            placeholder="m², lembar, pcs" style={{ fontFamily: F }} />
        </div>

        {/* Stok */}
        <div>
          <label className={lbl} style={{ fontFamily: F }}>Stok</label>
          <input className={inp} type="number" min="0" value={form.stock} onChange={set('stock')}
            placeholder="Kosong = tidak dilacak" style={{ fontFamily: F }} />
        </div>

        {/* Deskripsi */}
        <div>
          <label className={lbl} style={{ fontFamily: F }}>Deskripsi Singkat</label>
          <input className={inp} value={form.description} onChange={set('description')}
            placeholder="Penjelasan singkat (opsional)" style={{ fontFamily: F }} />
        </div>

        {/* Foto — field upload di dalam form */}
        <ImageField
          preview={imagePreview}
          isPending={isPending}
          onChange={(file, url) => { setImageFile(file); setImagePreview(url) }}
        />

        {/* Aktif */}
        <div className="col-span-2 flex items-center gap-2">
          <input type="checkbox" id="type-active" checked={form.is_active}
            onChange={set('is_active')} className="accent-[#C9A455]" />
          <label htmlFor="type-active" className="text-[13px] text-[#6B7280] cursor-pointer" style={{ fontFamily: F }}>
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
          <X size={12} strokeWidth={1.5} /> Batal
        </button>
      </div>
    </form>
  )
}

/* ── TypeRow — baris di list (gambar static, bukan upload) ─ */
function TypeRow({ type, idx, total, onEdit, onDelete, onMove, isPending }) {
  return (
    <div className={`flex items-start gap-2 px-3 py-3 ${!type.is_active ? 'opacity-50' : ''} hover:bg-[#FAF8F4] transition-colors`}>

      {/* ▲▼ */}
      <div className="flex flex-col gap-0.5 flex-shrink-0 pt-0.5">
        <button onClick={() => onMove(type, -1)} disabled={idx === 0}
          className="p-0.5 text-[#9C9890] hover:text-[#1C1917] disabled:opacity-20 transition-colors">
          <ChevronUp size={13} strokeWidth={2} />
        </button>
        <button onClick={() => onMove(type, 1)} disabled={idx === total - 1}
          className="p-0.5 text-[#9C9890] hover:text-[#1C1917] disabled:opacity-20 transition-colors">
          <ChevronDown size={13} strokeWidth={2} />
        </button>
      </div>

      {/* Nomor */}
      <span className="text-[10px] text-[#C9A455] w-4 text-center flex-shrink-0 pt-2" style={{ fontFamily: F }}>
        {String(idx + 1).padStart(2, '0')}
      </span>

      {/* Foto — hanya tampil, tidak clickable */}
      <div className="flex-shrink-0 w-[48px] h-[48px] bg-[#F5F3EF] border border-[#E8E4DC] overflow-hidden">
        {type.image_url
          ? <img src={type.image_url} alt={type.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={13} strokeWidth={1.5} className="text-[#D0CCBF]" /></div>
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 pt-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[13px] font-medium text-[#1C1917]" style={{ fontFamily: F }}>{type.name}</span>
          {type.code && (
            <span className="text-[10px] text-[#9C9890] font-mono bg-[#F5F3EF] px-1.5 py-0.5">{type.code}</span>
          )}
          {isPending && (
            <span className="text-[9px] text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5" style={{ fontFamily: F }}>
              belum disimpan
            </span>
          )}
          {!type.is_active && (
            <span className="text-[10px] text-[#9C9890] bg-gray-100 px-1.5 py-0.5" style={{ fontFamily: F }}>Hidden</span>
          )}
        </div>
        {type.description && (
          <p className="text-[11px] text-[#9C9890] mt-0.5 truncate" style={{ fontFamily: F }}>{type.description}</p>
        )}
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="text-[11px] text-[#1C1917]" style={{ fontFamily: F }}>
            {type.price !== '' && type.price != null
              ? formatCurrency(Number(type.price))
              : <span className="text-[#9C9890]">Harga induk</span>}
            {type.unit && <span className="text-[#9C9890]"> / {type.unit}</span>}
          </span>
          {type.stock !== '' && type.stock != null && (
            <span className="text-[11px] text-[#9C9890]" style={{ fontFamily: F }}>Stok: {type.stock}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0 pt-1">
        <button onClick={() => onEdit(type)}
          className="p-1.5 text-[#9C9890] hover:text-[#C9A455] transition-colors" title="Edit tipe">
          <Edit2 size={13} strokeWidth={1.5} />
        </button>
        <button onClick={() => onDelete(type)}
          className="p-1.5 text-[#9C9890] hover:text-red-500 transition-colors" title="Hapus tipe">
          <Trash2 size={13} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}

/* ── Main ───────────────────────────────────────────────── */
export default function ProductTypesManager({
  productId,
  pendingTypes   = [],
  onPendingChange = null,
}) {
  const [dbTypes, setDbTypes]       = useState([])
  const [loading, setLoading]       = useState(false)
  const [saving, setSaving]         = useState(false)
  const [showForm, setShowForm]     = useState(false)
  const [editTarget, setEditTarget] = useState(null)

  const isPendingMode = !productId

  const loadDb = useCallback(async () => {
    if (!productId) return
    setLoading(true)
    try {
      const data = await productTypeService.getByProduct(productId)
      setDbTypes(data)
    } catch (_) {
      toast.error('Gagal memuat tipe produk')
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => { loadDb() }, [loadDb])

  /* ── DB mode handlers ── */
  async function handleSaveDb(form) {
    setSaving(true)
    try {
      const isEdit = editTarget?.mode === 'db'
      const payload = {
        ...form,
        product_id: productId,
        sort_order: isEdit
          ? (editTarget.data.sort_order ?? dbTypes.length)
          : dbTypes.length,
      }
      if (isEdit) payload.id = editTarget.data.id

      // Upload gambar jika ada file baru
      if (form._imageFile) {
        const targetId = isEdit ? editTarget.data.id : null
        if (targetId) {
          // Edit: upload pakai ID yang sudah ada
          const url = await uploadTypeImage(form._imageFile, targetId)
          payload.image_url = url
        }
        // Jika insert baru (tidak ada ID): upload setelah insert
      }
      delete payload._imageFile

      const saved = await productTypeService.upsert(payload)

      // Jika insert baru + ada file baru: upload sekarang setelah dapat ID
      if (!isEdit && form._imageFile && saved?.id) {
        const url = await uploadTypeImage(form._imageFile, saved.id)
        await supabase.from('product_types').update({ image_url: url }).eq('id', saved.id)
      }

      toast.success(isEdit ? 'Tipe diperbarui' : 'Tipe ditambahkan')
      setShowForm(false)
      setEditTarget(null)
      await loadDb()
    } catch (err) {
      toast.error(err?.message || 'Gagal menyimpan tipe')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteDb(type) {
    if (!confirm(`Hapus tipe "${type.name}"?`)) return
    try {
      await productTypeService.delete(type.id)
      toast.success('Tipe dihapus')
      await loadDb()
    } catch (_) { toast.error('Gagal menghapus tipe') }
  }

  async function handleMoveDb(type, dir) {
    const arr = [...dbTypes]
    const idx = arr.findIndex(t => t.id === type.id)
    const swapIdx = idx + dir
    if (swapIdx < 0 || swapIdx >= arr.length) return
    const aOrder = arr[idx].sort_order
    arr[idx].sort_order = arr[swapIdx].sort_order
    arr[swapIdx].sort_order = aOrder
    ;[arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]]
    setDbTypes(arr)
    try {
      await productTypeService.reorder([
        { id: arr[idx].id,     sort_order: arr[idx].sort_order },
        { id: arr[swapIdx].id, sort_order: arr[swapIdx].sort_order },
      ])
    } catch (_) { toast.error('Gagal urutan'); await loadDb() }
  }

  /* ── Pending mode handlers ── */
  function handleSavePending(form) {
    const isEdit = editTarget?.mode === 'pending'
    const data = { ...form }
    if (isEdit) {
      onPendingChange(pendingTypes.map(t =>
        t._tempId === editTarget.data._tempId ? { ...data, _tempId: t._tempId } : t
      ))
    } else {
      onPendingChange([...pendingTypes, { ...data, _tempId: Date.now() }])
    }
    setShowForm(false)
    setEditTarget(null)
  }

  function handleDeletePending(type) {
    if (!confirm(`Hapus tipe "${type.name}"?`)) return
    onPendingChange(pendingTypes.filter(t => t._tempId !== type._tempId))
  }

  function handleMovePending(type, dir) {
    const arr = [...pendingTypes]
    const idx = arr.findIndex(t => t._tempId === type._tempId)
    const swapIdx = idx + dir
    if (swapIdx < 0 || swapIdx >= arr.length) return
    ;[arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]]
    onPendingChange(arr)
  }

  /* ── Unified ── */
  function handleSave(form) {
    if (isPendingMode) handleSavePending(form)
    else handleSaveDb(form)
  }
  function handleDelete(type) {
    if (isPendingMode) handleDeletePending(type)
    else handleDeleteDb(type)
  }
  function handleMove(type, dir) {
    if (isPendingMode) handleMovePending(type, dir)
    else handleMoveDb(type, dir)
  }

  const displayList = isPendingMode ? pendingTypes : dbTypes

  const editInitial = editTarget?.data ? {
    name:        editTarget.data.name,
    code:        editTarget.data.code        || '',
    price:       editTarget.data.price       ?? '',
    unit:        editTarget.data.unit        || '',
    stock:       editTarget.data.stock       ?? '',
    description: editTarget.data.description || '',
    is_active:   editTarget.data.is_active   ?? true,
    image_url:   editTarget.data.image_url   || null,
  } : undefined

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-[13px] font-medium text-[#1C1917]" style={{ fontFamily: F }}>
            Tipe / Varian Produk
          </p>
          {isPendingMode ? (
            <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 px-2 py-1 mt-1" style={{ fontFamily: F }}>
              Tipe yang ditambahkan di sini akan disimpan otomatis saat kamu klik "Simpan Produk &amp; Tipe" di tab Informasi.
            </p>
          ) : (
            <p className="text-[11px] text-[#9C9890] mt-0.5" style={{ fontFamily: F }}>
              Setiap tipe bisa punya harga, unit, stok, dan foto sendiri
            </p>
          )}
        </div>
        {!showForm && (
          <button onClick={() => { setEditTarget(null); setShowForm(true) }}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#1C1917] text-white text-[12px] hover:bg-[#C9A455] transition-colors flex-shrink-0"
            style={{ fontFamily: F }}>
            <Plus size={13} strokeWidth={1.5} /> Tambah Tipe
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <TypeForm
          initial={editInitial}
          isPending={isPendingMode}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditTarget(null) }}
          saving={saving}
        />
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={20} className="animate-spin text-[#C9A455]" />
        </div>
      ) : displayList.length === 0 ? (
        <div className="py-8 text-center border border-dashed border-[#E8E4DC]">
          <p className="text-[12px] text-[#9C9890]" style={{ fontFamily: F }}>
            Belum ada tipe. Klik "Tambah Tipe" untuk mulai.
          </p>
        </div>
      ) : (
        <div className="border border-[#E8E4DC] divide-y divide-[#F0EDE8]">
          {displayList.map((type, idx) => (
            <TypeRow
              key={isPendingMode ? type._tempId : type.id}
              type={type}
              idx={idx}
              total={displayList.length}
              isPending={isPendingMode}
              onEdit={(t) => { setEditTarget({ mode: isPendingMode ? 'pending' : 'db', data: t }); setShowForm(true) }}
              onDelete={handleDelete}
              onMove={handleMove}
            />
          ))}
        </div>
      )}

      {displayList.length > 0 && (
        <p className="text-[10px] text-[#9C9890]" style={{ fontFamily: F }}>
          {displayList.length} tipe
          {isPendingMode ? ' · Akan disimpan bersama produk' : ' · ▲▼ untuk mengubah urutan'}
        </p>
      )}
    </div>
  )
}
