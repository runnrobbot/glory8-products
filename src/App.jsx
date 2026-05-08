import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import PublicLayout from '@/components/layout/PublicLayout'
import AdminLayout from '@/components/layout/AdminLayout'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'

// Public pages
const HomePage          = lazy(() => import('@/pages/public/HomePage'))
const ProductsPage      = lazy(() => import('@/pages/public/ProductsPage'))
const ProductDetailPage = lazy(() => import('@/pages/public/ProductDetailPage'))
const CollectionsPage   = lazy(() => import('@/pages/public/CollectionsPage'))
const InspirationPage   = lazy(() => import('@/pages/public/InspirationPage'))
const AboutPage         = lazy(() => import('@/pages/public/AboutPage'))
const ContactPage       = lazy(() => import('@/pages/public/ContactPage'))
const LoginPage         = lazy(() => import('@/pages/public/LoginPage'))

// Admin pages
const AdminDashboard   = lazy(() => import('@/pages/admin/AdminDashboard'))
const AdminProducts    = lazy(() => import('@/pages/admin/AdminProducts'))
const AdminCategories  = lazy(() => import('@/pages/admin/AdminCategories'))
const AdminCollections = lazy(() => import('@/pages/admin/AdminCollections'))
const AdminOrders      = lazy(() => import('@/pages/admin/AdminOrders'))
const AdminFeatured    = lazy(() => import('@/pages/admin/AdminFeatured'))
const AdminGallery     = lazy(() => import('@/pages/admin/AdminGallery'))
const AdminUsers       = lazy(() => import('@/pages/admin/AdminUsers'))
const AdminSettings    = lazy(() => import('@/pages/admin/AdminSettings'))
const AdminChat        = lazy(() => import('@/pages/admin/AdminChat'))

export default function App() {
  const { initialize, loading } = useAuthStore()

  useEffect(() => {
    initialize()
  }, []) // eslint-disable-line

  if (loading) return <LoadingSpinner fullScreen />

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#374151',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '13px',
            border: '1px solid #f5ede0',
            borderRadius: 0,
            boxShadow: '0 4px 40px rgba(0,0,0,0.08)',
          },
        }}
      />

      <Suspense fallback={<LoadingSpinner fullScreen />}>
        <Routes>
          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />

          {/* Public */}
          <Route element={<PublicLayout />}>
            <Route path="/"                    element={<HomePage />} />
            <Route path="/products"            element={<ProductsPage />} />
            <Route path="/products/:slug"      element={<ProductDetailPage />} />
            <Route path="/collections"         element={<CollectionsPage />} />
            <Route path="/collections/:slug"   element={<CollectionsPage />} />
            <Route path="/inspiration"         element={<InspirationPage />} />
            <Route path="/about"               element={<AboutPage />} />
            <Route path="/contact"             element={<ContactPage />} />
          </Route>

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireStaff>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index                  element={<AdminDashboard />} />
            <Route path="products"        element={<AdminProducts />} />
            <Route path="categories"      element={<AdminCategories />} />
            <Route path="collections"     element={<AdminCollections />} />
            <Route path="orders"          element={<AdminOrders />} />
            <Route path="featured"        element={<AdminFeatured />} />
            <Route path="gallery"         element={<AdminGallery />} />
            <Route path="users"           element={<AdminUsers />} />
            <Route path="chat"            element={<AdminChat />} />
            <Route path="settings"        element={<AdminSettings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  )
}
