import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Users, ShieldCheck, Eye, EyeOff, X, Save } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { formatDate } from '@/lib/utils'
import Modal from '@/components/ui/Modal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import Pagination from '@/components/ui/Pagination'
import toast from 'react-hot-toast'

const EMPTY_FORM = { full_name: '', email: '', phone: '', password: '', role_id: '', is_active: true }

const ROLE_STYLE = {
  super_admin: 'bg-amber-50 text-amber-700 border border-amber-200',
  admin:       'bg-blue-50 text-blue-700 border border-blue-200',
  staff:       'bg-green-50 text-green-700 border border-green-200',
}
const ROLE_LABEL = {
  super_admin: 'Super Admin',
  admin:       'Admin',
  staff:       'Staff',
}
const ROLE_DESC = {
  super_admin: 'Akses penuh: kelola semua data, pengguna, dan pengaturan sistem.',
  admin:       'Kelola produk, kategori, koleksi, pesanan, dan galeri.',
  staff:       'Hanya bisa melihat dan memproses pesanan.',
}

export default function AdminUsers() {
  const { isSuperAdmin, user: currentUser } = useAuthStore()
  const [users, setUsers]     = useState([])
  const [roles, setRoles]     = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [edit, setEdit]       = useState(null)
  const [form, setForm]       = useState(EMPTY_FORM)
  const [saving, setSaving]   = useState(false)
  const [search, setSearch]   = useState('')
  const [showPass, setShowPass] = useState(false)
  const canManage = isSuperAdmin()

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const [{ data: usersData }, { data: rolesData }] = await Promise.all([
      supabase.from('profiles').select('*, roles(id, name)').order('created_at', { ascending: false }),
      supabase.from('roles').select('*').order('name'),
    ])
    setUsers(usersData || [])
    setRoles(rolesData || [])
    setLoading(false)
  }

  function openCreate() { setEdit(null); setForm(EMPTY_FORM); setShowPass(false); setShowModal(true) }

  function openEdit(user) {
    setEdit(user)
    setForm({
      full_name: user.full_name || '',
      email:     user.email || '',
      phone:     user.phone || '',
      password:  '',
      role_id:   user.role_id || '',
      is_active: user.is_active !== false,
    })
    setShowPass(false)
    setShowModal(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!canManage) return toast.error('Hanya Super Admin yang bisa mengelola pengguna')
    setSaving(true)

    try {
      if (edit) {
        // ── EDIT: update profile saja
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: form.full_name,
            phone:     form.phone,
            role_id:   form.role_id || null,
            is_active: form.is_active,
          })
          .eq('id', edit.id)
        if (error) throw error
        toast.success('Pengguna diperbarui')

      } else {
        // ── CREATE: panggil Edge Function dengan service_role
        if (!form.email)    throw new Error('Email wajib diisi')
        if (!form.password) throw new Error('Password wajib diisi')
        if (form.password.length < 8) throw new Error('Password minimal 8 karakter')

        const { data: { session } } = await supabase.auth.getSession()

        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({
              email:     form.email,
              password:  form.password,
              full_name: form.full_name,
              phone:     form.phone,
              role_id:   form.role_id || null,
              is_active: form.is_active,
            }),
          }
        )

        const result = await res.json()
        if (!result.success) throw new Error(result.error || 'Gagal membuat pengguna')
        toast.success(`Pengguna ${form.email} berhasil dibuat`)
      }

      setShowModal(false)
      fetchAll()
    } catch (err) {
      toast.error(err.message || 'Terjadi kesalahan')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(user) {
    if (!canManage) return toast.error('Hanya Super Admin yang bisa mengubah status')
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: !user.is_active })
      .eq('id', user.id)
    if (error) toast.error(error.message)
    else { toast.success(user.is_active ? 'Dinonaktifkan' : 'Diaktifkan'); fetchAll() }
  }

  async function handleDelete(user) {
    if (!canManage) return toast.error('Hanya Super Admin yang bisa menghapus pengguna')
    if (!confirm(`Hapus pengguna "${user.full_name || user.email}"? Tindakan ini tidak dapat dibatalkan.`)) return
    const { error } = await supabase.from('profiles').delete().eq('id', user.id)
    if (error) toast.error(error.message)
    else { toast.success('Pengguna dihapus'); fetchAll() }
  }

  const filtered = users.filter(u =>
    !search ||
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )
  const selectedRole = roles.find(r => r.id === form.role_id)

  /* ── UI ── */
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[#1C1917] text-[28px]" style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400 }}>
            Pengguna
          </h1>
          <p className="text-[#9C9890] text-[13px] mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
            {users.length} pengguna terdaftar
          </p>
        </div>
        {canManage && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1C1917] text-white text-[12px] tracking-[0.04em] hover:bg-[#C9A455] transition-colors"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <Plus size={14} strokeWidth={1.5} /> Tambah Pengguna
          </button>
        )}
      </div>

      {/* Role Legend */}
      <div className="flex flex-wrap gap-2 mb-5">
        {Object.entries(ROLE_LABEL).map(([key, label]) => (
          <span key={key} className={`text-[10px] px-2.5 py-1 ${ROLE_STYLE[key]}`} style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            {label}
          </span>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari nama atau email..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="w-full max-w-xs px-4 py-2.5 border border-[#E8E4DC] text-[13px] focus:outline-none focus:border-[#C9A455] bg-white"
          style={{ fontFamily: 'Inter, sans-serif' }}
        />
      </div>

      {/* Table */}
      {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
        <EmptyState icon={Users} title="Belum ada pengguna" description="Klik 'Tambah Pengguna' untuk menambah anggota tim" />
      ) : (() => {
        const totalPages = Math.ceil(filtered.length / PER_PAGE)
        const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
        return (
          <>
            <div className="bg-white border border-[#E8E4DC] overflow-x-auto shadow-luxury">
              <table className="w-full min-w-[660px]">
                <thead>
                  <tr className="border-b border-[#E8E4DC] bg-[#FAF8F4]">
                    {['Pengguna', 'Email', 'Telepon', 'Role', 'Bergabung', 'Status', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-[#9C9890] uppercase tracking-widest" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EDE6]">
                  {paginated.map(user => (
                    <tr key={user.id} className="hover:bg-[#FAF8F4] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 bg-[#FAF8F4] border border-[#E8E4DC] flex items-center justify-center flex-shrink-0">
                            <span className="text-[#C9A455] text-[11px] font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                              {(user.full_name || user.email || 'U')[0].toUpperCase()}
                            </span>
                          </div>
                          <span className="text-[#1C1917] text-[13px]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {user.full_name || <span className="text-[#C4BEB5] italic text-[12px]">Tanpa nama</span>}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#9C9890] text-[13px]" style={{ fontFamily: 'Inter, sans-serif' }}>{user.email || '—'}</td>
                      <td className="px-4 py-3 text-[#9C9890] text-[13px]" style={{ fontFamily: 'Inter, sans-serif' }}>{user.phone || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 whitespace-nowrap ${ROLE_STYLE[user.roles?.name] || 'bg-gray-100 text-gray-500'}`} style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                          {ROLE_LABEL[user.roles?.name] || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#9C9890] text-[12px] whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>{formatDate(user.created_at)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 ${user.is_active !== false ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`} style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                          {user.is_active !== false ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {canManage && (
                          <div className="flex items-center gap-1 justify-end">
                            <button onClick={() => toggleActive(user)} className="p-1.5 text-[#9C9890] hover:text-blue-500 transition-colors" title={user.is_active ? 'Nonaktifkan' : 'Aktifkan'}>
                              {user.is_active !== false ? <EyeOff size={13} strokeWidth={1.5} /> : <Eye size={13} strokeWidth={1.5} />}
                            </button>
                            <button onClick={() => openEdit(user)} className="p-1.5 text-[#9C9890] hover:text-[#C9A455] transition-colors">
                              <Edit2 size={13} strokeWidth={1.5} />
                            </button>
                            <button onClick={() => handleDelete(user)} className="p-1.5 text-[#9C9890] hover:text-red-500 transition-colors">
                              <Trash2 size={13} strokeWidth={1.5} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage}
              total={filtered.length} perPage={PER_PAGE} />
          </>
        )
      })()}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={edit ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
        size="sm"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-[#6B7280] tracking-[0.08em] uppercase mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
              Nama Lengkap *
            </label>
            <input
              value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              required
              className="w-full px-4 py-2.5 border border-[#E8E4DC] text-[13px] text-[#1C1917] focus:outline-none focus:border-[#C9A455] bg-white"
              style={{ fontFamily: 'Inter, sans-serif' }}
              placeholder="Nama lengkap"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#6B7280] tracking-[0.08em] uppercase mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
              Email *
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
              disabled={!!edit}
              className={`w-full px-4 py-2.5 border border-[#E8E4DC] text-[13px] focus:outline-none focus:border-[#C9A455] ${edit ? 'bg-[#FAF8F4] text-[#9C9890] cursor-not-allowed' : 'bg-white text-[#1C1917]'}`}
              style={{ fontFamily: 'Inter, sans-serif' }}
              placeholder="email@example.com"
            />
            {edit && <p className="text-[11px] text-[#C4BEB5] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>Email tidak dapat diubah</p>}
          </div>

          {/* Password — hanya saat create */}
          {!edit && (
            <div>
              <label className="block text-[11px] font-medium text-[#6B7280] tracking-[0.08em] uppercase mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  minLength={8}
                  className="w-full px-4 py-2.5 pr-10 border border-[#E8E4DC] text-[13px] text-[#1C1917] focus:outline-none focus:border-[#C9A455] bg-white"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                  placeholder="Min. 8 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9C9890] hover:text-[#1C1917] transition-colors"
                >
                  {showPass
                    ? <EyeOff size={14} strokeWidth={1.5} />
                    : <Eye size={14} strokeWidth={1.5} />
                  }
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-[#6B7280] tracking-[0.08em] uppercase mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
              Telepon
            </label>
            <input
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="w-full px-4 py-2.5 border border-[#E8E4DC] text-[13px] text-[#1C1917] focus:outline-none focus:border-[#C9A455] bg-white"
              style={{ fontFamily: 'Inter, sans-serif' }}
              placeholder="08xxxxxxxxxx"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#6B7280] tracking-[0.08em] uppercase mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
              Role / Jabatan *
            </label>
            <select
              value={form.role_id}
              onChange={e => setForm(f => ({ ...f, role_id: e.target.value }))}
              required
              className="w-full px-4 py-2.5 border border-[#E8E4DC] text-[13px] text-[#1C1917] focus:outline-none focus:border-[#C9A455] bg-white"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <option value="">-- Pilih role --</option>
              {roles.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name === 'super_admin' ? 'Super Admin' : r.name === 'admin' ? 'Admin' : 'Staff'}
                </option>
              ))}
            </select>
            {selectedRole && (
              <div className="mt-2 flex items-start gap-1.5 bg-[#FAF8F4] border border-[#E8E4DC] px-3 py-2">
                <ShieldCheck size={11} className="text-[#C9A455] mt-0.5 flex-shrink-0" />
                <span className="text-[11px] text-[#9C9890]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {ROLE_DESC[selectedRole.name]}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="u_active"
              checked={form.is_active}
              onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
              className="accent-[#C9A455]"
            />
            <label htmlFor="u_active" className="text-[13px] text-[#6B7280] cursor-pointer" style={{ fontFamily: 'Inter, sans-serif' }}>
              Pengguna aktif
            </label>
          </div>

          <div className="flex gap-3 pt-3 border-t border-[#E8E4DC]">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex items-center gap-1.5 flex-1 justify-center px-4 py-2.5 border border-[#E8E4DC] text-[12px] text-[#6B7280] hover:border-[#1C1917] hover:text-[#1C1917] transition-colors"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <X size={12} /> Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 flex-1 justify-center px-4 py-2.5 bg-[#1C1917] text-white text-[12px] hover:bg-[#C9A455] transition-colors disabled:opacity-50"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <Save size={12} />
              {saving ? 'Menyimpan...' : edit ? 'Perbarui' : 'Buat Pengguna'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
