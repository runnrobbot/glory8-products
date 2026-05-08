import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Save } from 'lucide-react'

export default function AdminSettings() {
  const { profile, fetchProfile, user } = useAuthStore()
  const [form, setForm] = useState({ full_name: profile?.full_name || '', phone: profile?.phone || '' })
  const [pwdForm, setPwdForm] = useState({ password: '', confirm: '' })
  const [saving, setSaving] = useState(false)

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await supabase.from('profiles').update(form).eq('id', user.id)
      await fetchProfile(user)
      toast.success('Profil diperbarui')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (pwdForm.password !== pwdForm.confirm) {
      toast.error('Password tidak cocok')
      return
    }
    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: pwdForm.password })
      if (error) throw error
      toast.success('Password berhasil diperbarui')
      setPwdForm({ password: '', confirm: '' })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-light text-[#1C1917]">Pengaturan</h1>
        <p className="font-body text-sm text-[#9C9890] mt-1">Kelola profil dan keamanan akun</p>
      </div>

      {/* Profile */}
      <div className="bg-white border border-[#E8E4DC] shadow-luxury p-6 mb-6">
        <h2 className="font-display text-lg font-light text-[#1C1917] mb-5">Profil</h2>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="block font-body text-xs font-medium text-[#6B7280] mb-1.5">Email</label>
            <input value={user?.email || ''} disabled className="input-luxury text-sm bg-[#FAF8F4] text-[#9C9890] cursor-not-allowed" />
          </div>
          <div>
            <label className="block font-body text-xs font-medium text-[#6B7280] mb-1.5">Nama Lengkap</label>
            <input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="input-luxury text-sm"
            />
          </div>
          <div>
            <label className="block font-body text-xs font-medium text-[#6B7280] mb-1.5">Telepon</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input-luxury text-sm"
            />
          </div>
          <button type="submit" disabled={saving} className="btn-primary text-xs">
            <Save size={13} strokeWidth={1.5} />
            {saving ? 'Menyimpan...' : 'Simpan Profil'}
          </button>
        </form>
      </div>

      {/* Password */}
      <div className="bg-white border border-[#E8E4DC] shadow-luxury p-6">
        <h2 className="font-display text-lg font-light text-[#1C1917] mb-5">Ubah Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block font-body text-xs font-medium text-[#6B7280] mb-1.5">Password Baru</label>
            <input
              type="password"
              value={pwdForm.password}
              onChange={(e) => setPwdForm({ ...pwdForm, password: e.target.value })}
              required
              minLength={8}
              className="input-luxury text-sm"
              placeholder="Min. 8 karakter"
            />
          </div>
          <div>
            <label className="block font-body text-xs font-medium text-[#6B7280] mb-1.5">Konfirmasi Password</label>
            <input
              type="password"
              value={pwdForm.confirm}
              onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })}
              required
              className="input-luxury text-sm"
            />
          </div>
          <button type="submit" disabled={saving} className="btn-primary text-xs">
            {saving ? 'Menyimpan...' : 'Ubah Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
