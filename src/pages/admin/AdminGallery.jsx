import { useState, useEffect, useRef } from 'react'
import { Image, Upload, Trash2, Plus, X, Eye, EyeOff, Tag } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Modal from '@/components/ui/Modal'
import toast from 'react-hot-toast'

export default function AdminGallery() {
  const [gallery, setGallery] = useState([])
  const [categories, setCategories] = useState([])   // dynamic from DB
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [filterCategory, setFilterCategory] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showCatModal, setShowCatModal] = useState(false)
  const [form, setForm] = useState({ title: '', category: '', is_active: true })
  const [newCatName, setNewCatName] = useState('')
  const [previewFile, setPreviewFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const fileInputRef = useRef()

  // Gabung jadi satu useEffect - fetchGallery bergantung pada filterCategory
  useEffect(() => {
    fetchCategories()
  }, []) // eslint-disable-line

  useEffect(() => {
    fetchGallery()
  }, [filterCategory]) // eslint-disable-line

  async function fetchCategories() {
    const { data } = await supabase.from('gallery_categories').select('*').eq('is_active', true).order('sort_order')
    setCategories(data || [])
  }

  async function fetchGallery() {
    setLoading(true)
    let query = supabase.from('inspiration_gallery').select('*').order('sort_order', { ascending: true })
    if (filterCategory) query = query.eq('category', filterCategory)
    const { data } = await query
    setGallery(data || [])
    setLoading(false)
  }

  async function addCategory() {
    if (!newCatName.trim()) return toast.error('Nama kategori wajib diisi')
    const maxOrder = categories.length > 0 ? Math.max(...categories.map(c => c.sort_order || 0)) : 0
    const { error } = await supabase.from('gallery_categories').insert({ name: newCatName.trim(), sort_order: maxOrder + 1, is_active: true })
    if (error) toast.error(error.message)
    else { toast.success('Kategori ditambahkan'); setNewCatName(''); fetchCategories() }
  }

  async function deleteCategory(cat) {
    if (!confirm(`Hapus kategori "${cat.name}"? Gambar dengan kategori ini akan tetap ada.`)) return
    const { error } = await supabase.from('gallery_categories').delete().eq('id', cat.id)
    if (error) toast.error(error.message)
    else { toast.success('Kategori dihapus'); fetchCategories() }
  }

  function handleFileSelect(e) {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('File harus berupa gambar')
    if (file.size > 5 * 1024 * 1024) return toast.error('Ukuran file maksimal 5MB')
    setPreviewFile(file); setPreviewUrl(URL.createObjectURL(file))
  }

  async function handleUpload() {
    if (!previewFile) return toast.error('Pilih gambar terlebih dahulu')
    if (!form.title) return toast.error('Judul wajib diisi')
    if (!form.category) return toast.error('Kategori wajib dipilih')
    setUploading(true)
    try {
      const ext = previewFile.name.split('.').pop()
      const filename = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage.from('glory8-assets').upload(filename, previewFile)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('glory8-assets').getPublicUrl(filename)
      const maxOrder = gallery.length > 0 ? Math.max(...gallery.map(g => g.sort_order || 0)) : 0
      const { error: dbError } = await supabase.from('inspiration_gallery').insert({
        url: publicUrl, title: form.title, category: form.category, is_active: form.is_active, sort_order: maxOrder + 1,
      })
      if (dbError) throw dbError
      toast.success('Gambar berhasil ditambahkan')
      setShowAddModal(false); setForm({ title: '', category: '', is_active: true })
      setPreviewFile(null); setPreviewUrl(''); fetchGallery()
    } catch (err) { toast.error('Gagal mengunggah: ' + err.message) }
    finally { setUploading(false) }
  }

  async function toggleActive(item) {
    const { error } = await supabase.from('inspiration_gallery').update({ is_active: !item.is_active }).eq('id', item.id)
    if (error) toast.error(error.message)
    else { toast.success('Status diperbarui'); fetchGallery() }
  }

  async function deleteItem(item) {
    if (!confirm(`Hapus gambar "${item.title}"?`)) return
    const path = item.url.split('/glory8-assets/')[1]
    if (path) await supabase.storage.from('glory8-assets').remove([path])
    const { error } = await supabase.from('inspiration_gallery').delete().eq('id', item.id)
    if (error) toast.error(error.message)
    else { toast.success('Gambar dihapus'); fetchGallery() }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl font-light text-[#1C1917]">Galeri Inspirasi</h1>
          <p className="font-body text-sm text-[#9C9890] mt-1">{gallery.length} gambar dalam galeri</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowCatModal(true)} className="btn-outline text-xs">
            <Tag size={14} strokeWidth={1.5} /> Kelola Kategori
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary text-xs">
            <Plus size={15} strokeWidth={1.5} /> Tambah Gambar
          </button>
        </div>
      </div>

      {/* Category Filter - dynamic from DB */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        <button onClick={() => setFilterCategory('')} className={`px-4 py-1.5 text-xs font-body font-medium transition-all border ${!filterCategory ? 'bg-[#C9A455] text-white border-[#C9A455]' : 'bg-white text-[#6B7280] border-[#E8E4DC] hover:border-[#C9A455]'}`}>
          Semua
        </button>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setFilterCategory(cat.name === filterCategory ? '' : cat.name)}
            className={`px-4 py-1.5 text-xs font-body font-medium transition-all border ${filterCategory === cat.name ? 'bg-[#C9A455] text-white border-[#C9A455]' : 'bg-white text-[#6B7280] border-[#E8E4DC] hover:border-[#C9A455]'}`}>
            {cat.name}
          </button>
        ))}
        {categories.length === 0 && (
          <span className="text-xs font-body text-[#9C9890] italic">Belum ada kategori — tambahkan lewat "Kelola Kategori"</span>
        )}
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="aspect-square bg-[#FAF8F4] animate-pulse" />)}
        </div>
      ) : gallery.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#9C9890]">
          <Image size={40} className="mb-4 opacity-30" strokeWidth={1} />
          <p className="font-body font-medium">Belum ada gambar</p>
          <p className="font-body text-sm mt-1">Tambahkan gambar untuk galeri inspirasi</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gallery.map(item => (
            <div key={item.id} className="group relative aspect-square overflow-hidden bg-[#FAF8F4]">
              <img src={item.url} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                <div className="flex justify-end gap-2">
                  <button onClick={() => toggleActive(item)} className="p-1.5 bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 transition-colors" title={item.is_active ? 'Sembunyikan' : 'Tampilkan'}>
                    {item.is_active ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>
                  <button onClick={() => deleteItem(item)} className="p-1.5 bg-white/20 backdrop-blur-sm text-red-300 hover:bg-red-500/50 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
                <div>
                  <p className="font-display text-sm text-white truncate">{item.title}</p>
                  <p className="font-body text-xs text-[#D4B570] mt-0.5">{item.category}</p>
                </div>
              </div>
              {!item.is_active && (
                <div className="absolute top-2 left-2">
                  <span className="text-[10px] font-body bg-[#1C1917]/80 text-[#C4BEB5] px-2 py-0.5">Tersembunyi</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Image Modal */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setPreviewFile(null); setPreviewUrl('') }} title="Tambah Gambar Galeri" size="sm">
        <div className="space-y-4">
          <div onClick={() => fileInputRef.current?.click()} className={`w-full aspect-video overflow-hidden border-2 border-dashed cursor-pointer transition-colors flex items-center justify-center ${previewUrl ? 'border-transparent' : 'border-[#E8E4DC] hover:border-[#C9A455]'}`}>
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-[#9C9890]">
                <Upload size={28} className="mx-auto mb-2" strokeWidth={1} />
                <p className="font-body text-sm">Klik untuk pilih gambar</p>
                <p className="font-body text-xs mt-1 text-[#C4BEB5]">PNG, JPG, WebP max 5MB</p>
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
          <div>
            <label className="block font-body text-xs font-medium text-[#6B7280] mb-1.5">Judul *</label>
            <input type="text" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} className="input-luxury text-sm" placeholder="Contoh: Modern Living Room" />
          </div>
          <div>
            <label className="block font-body text-xs font-medium text-[#6B7280] mb-1.5">Kategori *</label>
            {categories.length === 0 ? (
              <p className="font-body text-xs text-red-500 bg-red-50 px-3 py-2 border border-red-100">
                Belum ada kategori. Buat kategori terlebih dahulu lewat tombol "Kelola Kategori".
              </p>
            ) : (
              <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} className="input-luxury text-sm">
                <option value="">-- Pilih kategori --</option>
                {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
              </select>
            )}
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({...f, is_active: e.target.checked}))} className="accent-[#C9A455]" />
            <span className="font-body text-sm text-[#6B7280]">Tampilkan di website</span>
          </label>
          <div className="flex gap-3 pt-2 border-t border-[#E8E4DC]">
            <button onClick={() => { setShowAddModal(false); setPreviewFile(null); setPreviewUrl('') }} className="btn-outline text-xs flex-1 justify-center">Batal</button>
            <button onClick={handleUpload} disabled={uploading || categories.length === 0} className="btn-primary text-xs flex-1 justify-center disabled:opacity-50">
              {uploading ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Mengunggah...</> : <><Upload size={13} /> Unggah</>}
            </button>
          </div>
        </div>
      </Modal>

      {/* Manage Categories Modal */}
      <Modal isOpen={showCatModal} onClose={() => setShowCatModal(false)} title="Kelola Kategori Galeri" size="sm">
        <div className="space-y-4">
          {/* Add new */}
          <div className="flex gap-2">
            <input type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCategory())} className="input-luxury text-sm flex-1" placeholder="Nama kategori baru..." />
            <button onClick={addCategory} className="btn-primary text-xs px-3"><Plus size={14} /></button>
          </div>

          {/* List */}
          {categories.length === 0 ? (
            <p className="font-body text-sm text-[#9C9890] text-center py-6">Belum ada kategori</p>
          ) : (
            <div className="divide-y divide-[#F0EDE6] border border-[#E8E4DC]">
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between px-3 py-2.5">
                  <span className="font-body text-sm text-[#1C1917]">{cat.name}</span>
                  <button onClick={() => deleteCategory(cat)} className="p-1 text-[#9C9890] hover:text-red-500 transition-colors">
                    <Trash2 size={13} strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => setShowCatModal(false)} className="btn-outline text-xs w-full justify-center">Selesai</button>
        </div>
      </Modal>
    </div>
  )
}
