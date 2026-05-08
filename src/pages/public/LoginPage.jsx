import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export default function LoginPage() {
  const { signIn } = useAuthStore()
  const navigate   = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/admin')
    } catch (err) {
      setError(err.message || 'Email atau password salah')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8F4] flex">
      {/* Left Panel — Visual */}
      <div className="hidden lg:block lg:w-[55%] relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1638885930125-85350348d266?w=1400&q=80"
          alt="Glory8"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1C1917]/80 to-[#1C1917]/40" />
        <div className="absolute inset-0 flex flex-col items-start justify-end p-16 pb-20">
          <span
            className="text-white text-[28px] tracking-[0.25em] block mb-1"
            style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600 }}
          >
            GLORY8
          </span>
          <span
            className="text-[#C9A455] text-[10px] tracking-[0.3em] block mb-10"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            PRODUCTS
          </span>
          <h2
            className="text-white text-[44px] leading-tight max-w-md"
            style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400 }}
          >
            Platform Manajemen
            <br />
            <em style={{ fontStyle: 'italic', fontWeight: 300 }}>Interior Material</em>
          </h2>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[380px]"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-10">
            <span
              className="text-[#1C1917] text-[22px] tracking-[0.25em]"
              style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600 }}
            >
              GLORY8
            </span>
            <span
              className="block text-[#C9A455] text-[9px] tracking-[0.3em] mt-0.5"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              PRODUCTS
            </span>
          </div>

          <p
            className="text-[#C9A455] text-[11px] tracking-[0.3em] uppercase mb-3"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Dashboard
          </p>
          <h1
            className="text-[#1C1917] text-[32px] mb-2"
            style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 500 }}
          >
            Masuk ke Akun
          </h1>
          <p className="text-[#9C9890] text-[13px] mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
            Akses panel manajemen Glory8
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 px-4 py-3 mb-6 text-[13px]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <AlertCircle size={15} strokeWidth={1.5} className="shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label
                className="block text-[#6B7280] text-[11px] tracking-[0.12em] uppercase mb-2"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              >
                Email
              </label>
              <div className="relative">
                <Mail size={14} strokeWidth={1.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C9890]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@glory8.com"
                  className="w-full pl-10 pr-4 py-3 border border-[#E8E4DC] bg-white text-[13px] text-[#1C1917] focus:outline-none focus:border-[#C9A455] transition-colors placeholder-[#C4BEB5]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>
            </div>
            <div>
              <label
                className="block text-[#6B7280] text-[11px] tracking-[0.12em] uppercase mb-2"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              >
                Password
              </label>
              <div className="relative">
                <Lock size={14} strokeWidth={1.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C9890]" />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 border border-[#E8E4DC] bg-white text-[13px] text-[#1C1917] focus:outline-none focus:border-[#C9A455] transition-colors placeholder-[#C4BEB5]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9C9890] hover:text-[#1C1917] transition-colors"
                >
                  {showPass ? <EyeOff size={14} strokeWidth={1.5} /> : <Eye size={14} strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-[#1C1917] text-white py-3.5 text-[13px] tracking-[0.08em] hover:bg-[#C9A455] transition-colors duration-300 disabled:opacity-60"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link
              to="/"
              className="text-[#9C9890] text-[12px] hover:text-[#C9A455] transition-colors"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              ← Kembali ke Website
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
