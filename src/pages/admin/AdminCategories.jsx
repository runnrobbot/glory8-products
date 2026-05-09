import { useState } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { useCategories } from '@/hooks/useProducts'
import { supabase } from '@/lib/supabase'
import { slugify } from '@/lib/utils'
import Modal from '@/components/ui/Modal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Pagination from '@/components/ui/Pagination'
import toast from 'react-hot-toast'

const EMPTY = { name: '', slug: '', description: '', is_active: true, sort_order: 0 }

export default function AdminCategories() {
  const { data: categories, loading, refetch } = useCategories()
  const [showModal, setShowModal] = useState(false)
  const [edit, setEdit] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState(1)
  const PER_PAGE = 10

  const openCreate = () => { setEdit(null); setForm(EMPTY); setShowModal(true) }
  const openEdit = (cat) => {
    setEdit(cat)
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', is_active: cat.is_active, sort_order: cat.sort_order || 0 })
    setShowModal(true)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const v = type === 'checkbox' ? checked : value
    if (name === 'name' && !edit) setForm((f) => ({ ...f, name: v, slug: slugify(v) }))
    else setForm((f) => ({ ...f, [name]: v }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (edit) {
        const { error } = await supabase.from('product_categories').update(form).eq('id', edit.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('product_categories').insert(form)
        if (error) throw error
      }
      toast.success(edit ? 'Kategori diperbarui' : 'Kategori ditambahkan')
      setShowModal(false)
      refetch()
    } catch (err) {
      toast.error(err?.message || 'Gagal menyimpan kategori')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (cat) => {
    if (!confirm(`Hapus kategori "${cat.name}"?`)) return
    const { error } = await supabase.from('product_categories').delete().eq('id', cat.id)
    if (error) toast.error(error.message)
    else { toast.success('Kategori dihapus'); refetch() }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-light text-[#1C1917]">Kategori</h1>
          <p className="font-body text-sm text-[#9C9890] mt-1">{categories.length} kategori</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-xs">
          <Plus size={15} strokeWidth={1.5} />
          Tambah Kategori
        </button>
      </div>

      {loading ? <LoadingSpinner /> : (() => {
        const totalPages = Math.ceil(categories.length / PER_PAGE)
        const paginated  = categories.slice((page - 1) * PER_PAGE, page * PER_PAGE)
        return (
          <>
            <div className="bg-white border border-[#E8E4DC] overflow-hidden shadow-luxury">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E8E4DC] bg-[#FAF8F4]">
                    {['Nama', 'Slug', 'Urutan', 'Status', ''].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-body text-[10px] font-semibold text-[#9C9890] uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EDE6]">
                  {paginated.map((cat) => (
                    <tr key={cat.id} className="hover:bg-[#FAF8F4]">
                      <td className="px-4 py-3 font-body text-sm font-medium text-[#1C1917]">{cat.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-[#9C9890]">{cat.slug}</td>
                      <td className="px-4 py-3 font-body text-sm text-[#6B7280]">{cat.sort_order}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-body font-semibold px-2 py-0.5 ${cat.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-[#9C9890]'}`}>
                          {cat.is_active ? 'Aktif' : 'Hidden'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <button onClick={() => openEdit(cat)} className="p-1.5 text-[#9C9890] hover:text-[#C9A455] transition-colors"><Edit2 size={14} strokeWidth={1.5} /></button>
                          <button onClick={() => handleDelete(cat)} className="p-1.5 text-[#9C9890] hover:text-red-500 transition-colors"><Trash2 size={14} strokeWidth={1.5} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage}
              total={categories.length} perPage={PER_PAGE} />
          </>
        )
      })()}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={edit ? 'Edit Kategori' : 'Tambah Kategori'} size="sm">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block font-body text-xs font-medium text-[#6B7280] mb-1.5">Nama *</label>
            <input name="name" value={form.name} onChange={handleChange} required className="input-luxury text-sm" />
          </div>
          <div>
            <label className="block font-body text-xs font-medium text-[#6B7280] mb-1.5">Slug *</label>
            <input name="slug" value={form.slug} onChange={handleChange} required className="input-luxury text-sm" />
          </div>
          <div>
            <label className="block font-body text-xs font-medium text-[#6B7280] mb-1.5">Deskripsi</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={2} className="input-luxury text-sm resize-none" />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block font-body text-xs font-medium text-[#6B7280] mb-1.5">Urutan</label>
              <input name="sort_order" type="number" value={form.sort_order} onChange={handleChange} className="input-luxury text-sm" />
            </div>
            <div className="flex items-center gap-2 mt-5">
              <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="accent-[#C9A455]" />
              <label className="font-body text-sm text-[#6B7280]">Aktif</label>
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
