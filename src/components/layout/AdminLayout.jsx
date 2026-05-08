import { useState } from 'react'
import { Outlet, NavLink, Link } from 'react-router-dom'
import {
  LayoutDashboard, Package, Grid3X3, ShoppingBag,
  Users, Settings, LogOut, Menu,
  Image, Star, Layers, MessageCircle
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const NAV = [
  { to: '/admin',             label: 'Dashboard',  icon: LayoutDashboard, exact: true },
  { to: '/admin/products',    label: 'Produk',     icon: Package },
  { to: '/admin/categories',  label: 'Kategori',   icon: Grid3X3 },
  { to: '/admin/collections', label: 'Koleksi',    icon: Layers },
  { to: '/admin/orders',      label: 'Pesanan',    icon: ShoppingBag },
  { to: '/admin/featured',    label: 'Unggulan',   icon: Star },
  { to: '/admin/gallery',     label: 'Galeri',     icon: Image },
  { to: '/admin/users',       label: 'Pengguna',   icon: Users,    superAdminOnly: true },
  { to: '/admin/chat',        label: 'Live Chat',  icon: MessageCircle },
  { to: '/admin/settings',    label: 'Pengaturan', icon: Settings },
]

const ROLE_LABEL = {
  super_admin: '👑 Super Admin',
  admin:       '🛡 Admin',
  staff:       '👤 Staff',
}

// ── Sidebar dipindah ke luar AdminLayout ──────────────────────
// Agar tidak di-recreate setiap render AdminLayout
function AdminSidebar({ profile, role, visibleNav, onNavClick, onSignOut }) {
  return (
    <div className="flex flex-col h-full bg-white border-r border-[#E8E4DC]">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-[#E8E4DC]">
        <Link to="/" className="flex items-center gap-2">
          <span
            className="text-[#1C1917] text-[18px]"
            style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, letterSpacing: '0.2em' }}
          >
            GLORY8
          </span>
          <span
            className="text-[#C9A455] text-[8px]"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, letterSpacing: '0.3em' }}
          >
            ADMIN
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {visibleNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            onClick={onNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-2.5 text-[13px] transition-colors duration-150 ${
                isActive
                  ? 'bg-[#1C1917] text-white'
                  : 'text-[#6B7280] hover:bg-[#FAF8F4] hover:text-[#1C1917]'
              }`
            }
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, letterSpacing: '0.03em' }}
          >
            {({ isActive }) => (
              <>
                <item.icon size={15} strokeWidth={1.5} className={isActive ? 'text-[#C9A455]' : ''} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-[#E8E4DC] p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-[#FAF8F4] border border-[#E8E4DC] flex items-center justify-center flex-shrink-0">
            <span className="text-[#C9A455] text-xs font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
              {(profile?.full_name || 'A')[0].toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-[#1C1917] text-[12px] font-medium truncate" style={{ fontFamily: 'Inter, sans-serif' }}>
              {profile?.full_name || 'Admin'}
            </p>
            <p className="text-[#C9A455] text-[10px] tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
              {ROLE_LABEL[role] || role}
            </p>
          </div>
        </div>
        <button
          onClick={onSignOut}
          className="flex items-center gap-2 w-full px-3 py-2 text-[12px] text-[#9C9890] hover:text-red-500 hover:bg-red-50 transition-colors"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <LogOut size={13} strokeWidth={1.5} />
          Keluar
        </button>
      </div>
    </div>
  )
}

// ── Main Layout ───────────────────────────────────────────────
export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { profile, role, signOut } = useAuthStore()

  const visibleNav = NAV.filter(n => {
    if (n.superAdminOnly) return role === 'super_admin'
    if (n.adminOnly)      return ['super_admin', 'admin'].includes(role)
    return true
  })

  const sidebarProps = {
    profile,
    role,
    visibleNav,
    onNavClick:  () => setSidebarOpen(false),
    onSignOut:   signOut,
  }

  return (
    <div className="flex h-screen bg-[#FAF8F4] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-56 xl:w-60 flex-shrink-0">
        <AdminSidebar {...sidebarProps} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-60 shadow-2xl">
            <AdminSidebar {...sidebarProps} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-[#E8E4DC] h-14 flex items-center px-5 gap-4 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 text-[#9C9890] hover:text-[#1C1917] transition-colors"
          >
            <Menu size={20} strokeWidth={1.5} />
          </button>
          <div className="flex-1" />
          <Link
            to="/"
            className="text-[12px] text-[#9C9890] hover:text-[#C9A455] transition-colors"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            ← Lihat Website
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-5 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
