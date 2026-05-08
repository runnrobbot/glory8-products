import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import CartDrawer from '@/components/cart/CartDrawer'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import LiveChatWidget from '@/components/chat/LiveChatWidget'

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<LoadingSpinner fullScreen />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <CartDrawer />
      <LiveChatWidget />
    </div>
  )
}
