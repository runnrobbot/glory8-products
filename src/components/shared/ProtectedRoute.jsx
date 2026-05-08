import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

/**
 * requireStaff  → super_admin, admin, staff boleh masuk
 * requireAdmin  → hanya super_admin, admin
 * requireSuperAdmin → hanya super_admin
 */
export function ProtectedRoute({
  children,
  requireStaff = false,
  requireAdmin = false,
  requireSuperAdmin = false,
}) {
  const { user, role, loading, initialized } = useAuthStore()
  const location = useLocation()

  if (!initialized || loading) return <LoadingSpinner fullScreen />

  // Belum login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Tidak punya role sama sekali (profile belum terbentuk)
  if (!role) {
    return <Navigate to="/login" replace />
  }

  if (requireSuperAdmin && role !== 'super_admin') {
    return <Navigate to="/admin" replace />
  }

  if (requireAdmin && !['super_admin', 'admin'].includes(role)) {
    return <Navigate to="/admin" replace />
  }

  if (requireStaff && !['super_admin', 'admin', 'staff'].includes(role)) {
    return <Navigate to="/" replace />
  }

  return children
}
