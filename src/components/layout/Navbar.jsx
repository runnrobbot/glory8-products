import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'

const NAV_LINKS = [
  { to: '/',            label: 'Beranda' },
  { to: '/products',    label: 'Produk' },
  { to: '/collections', label: 'Koleksi' },
  { to: '/inspiration', label: 'Inspirasi' },
  { to: '/about',       label: 'Tentang' },
  { to: '/contact',     label: 'Kontak' },
]

export default function Navbar() {
  const [scrolled, setScrolled]     = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { items, toggleCart } = useCartStore()
  const { user } = useAuthStore()

  const totalItems = items.reduce((s, i) => s + i.quantity, 0)
  const isHome     = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMobileOpen(false), [location.pathname])

  const navBg    = scrolled
    ? 'bg-[#FAF8F4]/90 backdrop-blur-md shadow-[0_1px_24px_rgba(0,0,0,0.07)]'
    : isHome
    ? 'bg-transparent'
    : 'bg-[#FAF8F4]/95 backdrop-blur-md shadow-[0_1px_20px_rgba(0,0,0,0.05)]'

  const textColor = scrolled || !isHome ? 'text-[#1C1917]' : 'text-white'

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navBg}`}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 h-[72px] flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <span
                className={`font-display text-[22px] transition-colors duration-300 ${scrolled || !isHome ? 'text-[#1C1917]' : 'text-white'}`}
                style={{ fontWeight: 600, letterSpacing: '0.25em' }}
              >
                GLORY8
              </span>
              <span className="absolute -bottom-0.5 left-0 right-0 h-[1px] bg-[#C9A455] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </div>
            <span
              className="hidden sm:block text-[9px] text-[#C9A455] mt-1"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, letterSpacing: '0.3em' }}
            >
              PRODUCTS
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `relative text-[13px] tracking-[0.08em] transition-colors duration-300 group ${
                    isActive
                      ? 'text-[#C9A455]'
                      : `${textColor} hover:text-[#C9A455]`
                  }`
                }
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    {isActive && <span className="absolute -bottom-1 left-0 right-0 h-px bg-[#C9A455]" />}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Admin Dashboard link — hanya muncul kalau sudah login, tanpa teks "Masuk" */}
            {user && (
              <Link
                to="/admin"
                className={`hidden lg:flex items-center gap-1.5 text-[12px] tracking-[0.06em] border px-3 py-1.5 transition-all duration-300 ${
                  scrolled || !isHome
                    ? 'border-[#C9A455] text-[#C9A455] hover:bg-[#C9A455] hover:text-white'
                    : 'border-white/60 text-white hover:border-[#C9A455] hover:text-[#C9A455]'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Dashboard
              </Link>
            )}

            {/* Cart */}
            <button
              onClick={toggleCart}
              className={`relative p-2.5 transition-colors duration-300 ${
                scrolled || !isHome ? 'text-[#1C1917] hover:text-[#C9A455]' : 'text-white hover:text-[#C9A455]'
              }`}
              aria-label="Keranjang"
            >
              <ShoppingCart size={20} strokeWidth={1.5} />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#C9A455] text-white text-[9px] rounded-full flex items-center justify-center"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
                >
                  {totalItems > 9 ? '9+' : totalItems}
                </motion.span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen((p) => !p)}
              className={`lg:hidden p-2.5 transition-colors duration-300 ${
                scrolled || !isHome ? 'text-[#1C1917] hover:text-[#C9A455]' : 'text-white hover:text-[#C9A455]'
              }`}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-[72px] left-0 right-0 z-40 bg-[#FAF8F4]/98 backdrop-blur-md border-b border-[#E8E4DC] shadow-lg"
          >
            <div className="max-w-[1400px] mx-auto px-6 py-6 flex flex-col gap-1">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <NavLink
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) =>
                      `block py-3 text-[14px] tracking-[0.06em] border-b border-[#F0EDE6] transition-colors ${
                        isActive ? 'text-[#C9A455]' : 'text-[#1C1917] hover:text-[#C9A455]'
                      }`
                    }
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {link.label}
                  </NavLink>
                </motion.div>
              ))}
              {/* Dashboard link di mobile — hanya kalau sudah login */}
              {user && (
                <Link
                  to="/admin"
                  className="mt-3 text-center py-3 border border-[#C9A455] text-[#C9A455] text-[13px] tracking-[0.06em]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Admin Dashboard
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
