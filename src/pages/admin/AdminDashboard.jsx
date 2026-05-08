import { useDashboardStats, useRecentActivity } from '@/hooks/useAnalytics'
import { Package, ShoppingBag, Clock, TrendingUp } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

const STATUS_COLORS = {
  pending:    'bg-amber-50 text-amber-700',
  confirmed:  'bg-blue-50 text-blue-700',
  processing: 'bg-purple-50 text-purple-700',
  shipped:    'bg-indigo-50 text-indigo-700',
  delivered:  'bg-green-50 text-green-700',
  cancelled:  'bg-red-50 text-red-600',
}

export default function AdminDashboard() {
  const { data: stats, loading: statsLoading } = useDashboardStats()
  const { data: activity, loading: actLoading } = useRecentActivity()

  const CARDS = [
    { label: 'Total Produk',    value: stats?.products  ?? '—', icon: Package,     color: 'text-[#C9A455]' },
    { label: 'Total Pesanan',   value: stats?.orders    ?? '—', icon: ShoppingBag, color: 'text-blue-500' },
    { label: 'Pesanan Pending', value: stats?.pending   ?? '—', icon: Clock,       color: 'text-amber-500' },
    { label: 'Selesai',         value: stats?.completed ?? '—', icon: TrendingUp,  color: 'text-green-500' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1
          className="text-[#1C1917] text-[28px]"
          style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 500 }}
        >
          Dashboard
        </h1>
        <p className="text-[#9C9890] text-[13px] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
          Selamat datang di panel manajemen Glory8
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {CARDS.map((card) => (
          <div key={card.label} className="bg-white border border-[#E8E4DC] p-5 shadow-luxury">
            <div className="flex items-start justify-between mb-3">
              <card.icon size={18} strokeWidth={1.5} className={card.color} />
            </div>
            <p
              className="text-[#1C1917] text-[26px] font-medium mb-1"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              {statsLoading ? <span className="skeleton inline-block w-16 h-7 rounded" /> : card.value}
            </p>
            <p className="text-[#9C9890] text-[12px]" style={{ fontFamily: 'Inter, sans-serif' }}>
              {card.label}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-[#E8E4DC] shadow-luxury">
        <div className="px-6 py-4 border-b border-[#E8E4DC]">
          <h2
            className="text-[#1C1917] text-[18px]"
            style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 500 }}
          >
            Aktivitas Terbaru
          </h2>
        </div>
        {actLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 skeleton rounded" />
            ))}
          </div>
        ) : (activity || []).length === 0 ? (
          <div className="py-16 text-center text-[#9C9890] text-[13px]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Belum ada aktivitas
          </div>
        ) : (
          <div className="divide-y divide-[#F0EDE6]">
            {(activity || []).map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                <div className="w-8 h-8 bg-[#FAF8F4] border border-[#E8E4DC] flex items-center justify-center flex-shrink-0">
                  <span className="text-[#C9A455] text-xs font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {(item.profiles?.full_name || 'A')[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#1C1917] text-[13px]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <span className="font-medium">{item.profiles?.full_name || 'Admin'}</span>
                    {' '}{item.action}
                  </p>
                  <p className="text-[#9C9890] text-[11px] mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {formatDate(item.created_at)}
                  </p>
                </div>
                {item.metadata?.status && (
                  <span className={`text-[10px] px-2 py-0.5 ${STATUS_COLORS[item.metadata.status] || 'bg-gray-100 text-[#9C9890]'}`} style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                    {item.metadata.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
