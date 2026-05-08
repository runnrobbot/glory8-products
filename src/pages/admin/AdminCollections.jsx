import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Layers } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { slugify } from '@/lib/utils'
import Modal from '@/components/ui/Modal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import toast from 'react-hot-toast'

const EMPTY = { name: '', slug: '', description: '', banner_url: '', is_active: true, sort_order: 0 }

export default function AdminCollections() {
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [edit, setEdit] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchCollections() }, [])

  async function fetchCollections() {
    setLoading(true)
    const { data } = await supabase.from('product_collections').select('*').order('sort_order', { ascending: true })
    setCollections(data || [])
    setLoading(false)
  }

  function openCreate() { setEdit(null); setForm(EMPTY); setShowModal(true) }
  function openEdit(col) {
    setEdit(col)
    setForm({ name: col.name, slug: col.slug, description: col.description || '', banner_url: col.banner_url || '', is_active: col.is_active, sort_order: col.sort_order || 0 })
    setShowModal(true)
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    const v = type === 'checkbox' ? checked : value
    if (name === 'name' && !edit) setForm(f => ({ ...f, name: v, slug: slugify(v) }))
    else setForm(f => ({ ...f, [name]: v }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (edit) {
        const { error } = await supabase.from('product_collections').update(form).eq('id', edit.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('product_collections').insert(form)
        if (error) throw error
      }
      toast.success(edit ? 'Koleksi diperbarui' : 'Koleksi ditambahkan')
      setShowModal(false); fetchCollections()
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  async function handleDelete(col) {
    if (!confirm(`Hapus koleksi "${col.name}"?`)) return
    const { error } = await supabase.from('product_collections').delete().eq('id', col.id)
    if (error) toast.error(error.message)
    else { toast.success('Koleksi dihapus'); fetchCollections() }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-light text-[#1C1917]">Koleksi</h1>
          <p className="font-body text-sm text-[#9C9890] mt-1">{collections.length} koleksi produk</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-xs">
          <Plus size={15} strokeWidth={1.5} /> Tambah Koleksi
        </button>
      </div>

      {loading ? <LoadingSpinner /> : collections.length === 0 ? (
        <EmptyState icon={Layers} title="Belum ada koleksi" description="Buat koleksi untuk mengelompokkan produk secara tematik" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map(col => (
            <div key={col.id} className="bg-white border border-[#E8E4DC] shadow-luxury overflow-hidden group">
              {col.banner_url ? (
                <div className="h-32 overflow-hidden">
                  <img src={col.banner_url} alt={col.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              ) : (
                <div className="h-32 bg-[#FAF8F4] flex items-center justify-center">
                  <Layers size={28} className="text-[#C4BEB5]" strokeWidth={1} />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-display text-base font-medium text-[#1C1917] truncate">{col.name}</p>
                    <p className="font-mono text-[10px] text-[#9C9890] mt-0.5">{col.slug}</p>
                    {col.description && <p className="font-body text-xs text-[#9C9890] mt-1.5 line-clamp-2">{col.description}</p>}
                  </div>
                  <span className={`text-[10px] font-body font-semibold px-2 py-0.5 flex-shrink-0 ${col.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-[#9C9890]'}`}>
                    {col.is_active ? 'Aktif' : 'Hidden'}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-[#F0EDE6]">
                  <span className="font-body text-[10px] text-[#9C9890] flex-1">Urutan: {col.sort_order}</span>
                  <button onClick={() => openEdit(col)} className="p-1.5 text-[#9C9890] hover:text-[#C9A455] transition-colors"><Edit2 size={13} strokeWidth={1.5} /></button>
                  <button onClick={() => handleDelete(col)} className="p-1.5 text-[#9C9890] hover:text-red-500 transition-colors"><Trash2 size={13} strokeWidth={1.5} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={edit ? 'Edit Koleksi' : 'Tambah Koleksi'} size="sm">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block font-body text-xs font-medium text-[#6B7280] mb-1.5">Nama Koleksi *</label>
            <input name="name" value={form.name} onChange={handleChange} required className="input-luxury text-sm" placeholder="Contoh: Luxury SPC Collection" />
          </div>
          <div>
            <label className="block font-body text-xs font-medium text-[#6B7280] mb-1.5">Slug *</label>
            <input name="slug" value={form.slug} onChange={handleChange} required className="input-luxury text-sm font-mono" placeholder="luxury-spc-collection" />
          </div>
          <div>
            <label className="block font-body text-xs font-medium text-[#6B7280] mb-1.5">Deskripsi</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={2} className="input-luxury text-sm resize-none" placeholder="Deskripsi singkat koleksi" />
          </div>
          <div>
            <label className="block font-body text-xs font-medium text-[#6B7280] mb-1.5">URL Banner (gambar)</label>
            <input name="banner_url" value={form.banner_url} onChange={handleChange} className="input-luxury text-sm" placeholder="https://..." />
            {form.banner_url && (
              <div className="mt-2 h-20 overflow-hidden border border-[#E8E4DC]">
                <img src={form.banner_url} alt="Preview" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block font-body text-xs font-medium text-[#6B7280] mb-1.5">Urutan Tampil</label>
              <input name="sort_order" type="number" value={form.sort_order} onChange={handleChange} className="input-luxury text-sm" />
            </div>
            <div className="flex items-center gap-2 mt-5">
              <input type="checkbox" name="is_active" id="col_active" checked={form.is_active} onChange={handleChange} className="accent-[#C9A455]" />
              <label htmlFor="col_active" className="font-body text-sm text-[#6B7280] cursor-pointer">Aktif</label>
            </div>
          </div>
          <div className="flex gap-3 pt-2 border-t border-[#E8E4DC]">
            <button type="button" onClick={() => setShowModal(false)} className="btn-outline text-xs flex-1 justify-center">Batal</button>
            <button type="submit" disabled={saving} className="btn-primary text-xs flex-1 justify-center">{saving ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
