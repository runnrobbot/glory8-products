import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, Trash2, GripVertical, Loader2, X, Check } from 'lucide-react'
import { variantService } from '@/services/productService'
import toast from 'react-hot-toast'

const F = 'Inter, sans-serif'

function Label({ children }) {
  return (
    <label className="block text-[10px] font-semibold text-[#9C9890] uppercase tracking-widest mb-1.5" style={{ fontFamily: F }}>
      {children}
    </label>
  )
}
function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full px-3 py-2 border border-[#E8E4DC] text-[13px] text-[#1C1917] bg-white focus:outline-none focus:border-[#C9A455] transition-colors placeholder:text-[#9C9890] ${className}`}
      style={{ fontFamily: F }}
      {...props}
    />
  )
}

const EMPTY_VARIANT = {
  name: '', sku: '', price: '', unit: '', stock: '',
  thickness: '', dimensions: '', color: '', description: '',
  is_active: true, sort_order: 0,
}

function VariantForm({ productId, variant, onSave, onCancel, nextOrder }) {
  const [form, setForm] = useState(
    variant
      ? { ...variant, price: variant.price ?? '', stock: variant.stock ?? '' }
      : { ...EMPTY_VARIANT, sort_order: nextOrder }
  )
  const [saving, setSaving] = useState(false)

  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Nama tipe wajib diisi'); return }
    setSaving(true)
    try {
      const payload = {
        ...form,
        product_id: productId,
        price: form.price !== '' ? parseFloat(form.price) : null,
        stock: form.stock !== '' ? parseInt(form.stock)   : null,
      }
      if (variant?.id) payload.id = variant.id
      const saved = await variantService.upsertVariant(payload)
      onSave(saved)
    } catch (err) {
      toast.error(err?.message || 'Gagal menyimpan tipe')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-[#C9A455] bg-[#FEFCF7] p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label>Nama Tipe *</Label>
          <Input placeholder="Type A, 6mm Natural Oak, Glossy White, dll" value={form.name} onChange={set('name')} required />
        </div>
        <div>
          <Label>Harga (Rp) — kosong = ikut produk</Label>
          <Input type="number" min="0" placeholder="Kosongkan jika sama" value={form.price} onChange={set('price')} />
        </div>
        <div>
          <Label>Unit — kosong = ikut produk</Label>
          <Input placeholder="m², pcs, lembar" value={form.unit} onChange={set('unit')} />
        </div>
        <div>
          <Label>SKU / Kode</Label>
          <Input placeholder="GLR-001-A" value={form.sku} onChange={set('sku')} />
        </div>
        <div>
          <Label>Stok</Label>
          <Input type="number" min="0" placeholder="0" value={form.stock} onChange={set('stock')} />
        </div>
        <div>
          <Label>Ketebalan</Label>
          <Input placeholder="6mm, 8mm, 12mm" value={form.thickness} onChange={set('thickness')} />
        </div>
        <div>
          <Label>Dimensi</Label>
          <Input placeholder="120x20cm, 60x60cm" value={form.dimensions} onChange={set('dimensions')} />
        </div>
        <div>
          <Label>Warna / Motif</Label>
          <Input placeholder="Natural Oak, Putih Glossy" value={form.color} onChange={set('color')} />
        </div>
        <div>
          <Label>Urutan Tampil</Label>
          <Input type="number" min="0" value={form.sort_order} onChange={set('sort_order')} />
        </div>
        <div className="col-span-2">
          <Label>Keterangan Tambahan</Label>
          <textarea
            className="w-full px-3 py-2 border border-[#E8E4DC] text-[13px] text-[#1C1917] bg-white focus:outline-none focus:border-[#C9A455] resize-none placeholder:text-[#9C9890]"
            style={{ fontFamily: F }}
            rows={2}
            placeholder="Info tambahan untuk tipe ini..."
            value={form.description}
            onChange={set('description')}
          />
        </div>
        <div className="col-span-2 flex items-center gap-2">
          <input type="checkbox" checked={form.is_active} onChange={set('is_active')} className="accent-[#C9A455]" id="va-active" />
          <label htmlFor="va-active" className="text-[12px] text-[#6B7280] cursor-pointer" style={{ fontFamily: F }}>
            Aktif (tampil di halaman produk)
          </label>
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2 border border-[#E8E4DC] text-[12px] text-[#6B7280] hover:border-[#1C1917] transition-colors"
          style={{ fontFamily: F }}>
          <X size={12} strokeWidth={2} /> Batal
        </button>
        <button type="submit" disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#1C1917] text-white text-[12px] hover:bg-[#C9A455] transition-colors disabled:opacity-50"
          style={{ fontFamily: F }}>
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} strokeWidth={2} />}
          {saving ? 'Menyimpan...' : 'Simpan Tipe'}
        </button>
      </div>
    </form>
  )
}

export default function VariantManager({ productId, productPrice, productUnit }) {
  const [variants, setVariants]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [editingId, setEditingId] = useState(null)

  const load = useCallback(async () => {
    if (!productId) return
    setLoading(true)
    try {
      const data = await variantService.getVariants(productId)
      setVariants(data)
    } catch {
      toast.error('Gagal memuat tipe produk')
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => { load() }, [load])

  function handleSaved(saved) {
    setVariants(prev => {
      const idx = prev.findIndex(v => v.id === saved.id)
      if (idx >= 0) {
        const next = [...prev]; next[idx] = saved
        return next.sort((a, b) => a.sort_order - b.sort_order)
      }
      return [...prev, saved].sort((a, b) => a.sort_order - b.sort_order)
    })
    setShowForm(false)
    setEditingId(null)
    toast.success('Tipe disimpan')
  }

  async function handleDelete(v) {
    if (!confirm(`Hapus tipe "${v.name}"?`)) return
    try {
      await variantService.deleteVariant(v.id)
      setVariants(prev => prev.filter(x => x.id !== v.id))
      toast.success('Tipe dihapus')
    } catch (err) {
      toast.error(err?.message || 'Gagal menghapus')
    }
  }

  const nextOrder = variants.length > 0 ? Math.max(...variants.map(v => v.sort_order)) + 1 : 0

  if (loading) return <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-[#C9A455]" /></div>

  return (
    <div className="space-y-3 max-h-[58vh] overflow-y-auto pr-1">
      <p className="text-[12px] text-[#9C9890] leading-relaxed" style={{ fontFamily: F }}>
        Tambahkan tipe/varian — beda ketebalan, warna, atau ukuran. Setiap tipe bisa punya harga dan stok tersendiri.
      </p>

      {variants.length === 0 && !showForm && (
        <div className="py-10 text-center border border-dashed border-[#E8E4DC]">
          <p className="text-[13px] text-[#9C9890]" style={{ fontFamily: F }}>Belum ada tipe — klik tombol di bawah untuk menambah</p>
        </div>
      )}

      {variants.map((v) => (
        <div key={v.id}>
          {editingId === v.id ? (
            <VariantForm productId={productId} variant={v} onSave={handleSaved}
              onCancel={() => setEditingId(null)} nextOrder={nextOrder} />
          ) : (
            <div className={`border px-4 py-3 flex items-start gap-3 ${v.is_active ? 'border-[#E8E4DC] bg-white' : 'border-[#E8E4DC] bg-[#F9F8F6] opacity-60'}`}>
              <GripVertical size={14} className="text-[#D1CEC8] mt-0.5 flex-shrink-0" strokeWidth={1.5} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13px] font-medium text-[#1C1917]" style={{ fontFamily: F }}>{v.name}</span>
                  {!v.is_active && <span className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-[#9C9890]" style={{ fontFamily: F }}>Hidden</span>}
                  {v.sku && <span className="text-[10px] px-1.5 py-0.5 bg-[#F5F3EF] text-[#9C9890] font-mono">{v.sku}</span>}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                  {v.price != null
                    ? <span className="text-[11px] text-[#C9A455]" style={{ fontFamily: F }}>Rp {Number(v.price).toLocaleString('id-ID')} / {v.unit || productUnit}</span>
                    : <span className="text-[11px] text-[#9C9890]" style={{ fontFamily: F }}>Harga dari produk ({productUnit})</span>
                  }
                  {v.thickness  && <span className="text-[11px] text-[#9C9890]" style={{ fontFamily: F }}>Tebal: {v.thickness}</span>}
                  {v.dimensions && <span className="text-[11px] text-[#9C9890]" style={{ fontFamily: F }}>Dimensi: {v.dimensions}</span>}
                  {v.color      && <span className="text-[11px] text-[#9C9890]" style={{ fontFamily: F }}>Warna: {v.color}</span>}
                  {v.stock != null && <span className="text-[11px] text-[#9C9890]" style={{ fontFamily: F }}>Stok: {v.stock}</span>}
                </div>
                {v.description && <p className="text-[11px] text-[#9C9890] mt-0.5 italic" style={{ fontFamily: F }}>{v.description}</p>}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => { setEditingId(v.id); setShowForm(false) }}
                  className="p-1.5 text-[#9C9890] hover:text-[#C9A455] transition-colors">
                  <Edit2 size={13} strokeWidth={1.5} />
                </button>
                <button onClick={() => handleDelete(v)}
                  className="p-1.5 text-[#9C9890] hover:text-red-500 transition-colors">
                  <Trash2 size={13} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {showForm && (
        <VariantForm productId={productId} variant={null} onSave={handleSaved}
          onCancel={() => setShowForm(false)} nextOrder={nextOrder} />
      )}

      {!showForm && editingId === null && (
        <button onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-[#C9A455] text-[#C9A455] text-[12px] hover:bg-[#FDF6E7] transition-colors"
          style={{ fontFamily: F }}>
          <Plus size={14} strokeWidth={1.5} /> Tambah Tipe
        </button>
      )}
    </div>
  )
}
