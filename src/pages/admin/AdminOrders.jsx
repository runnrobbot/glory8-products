import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, RefreshCw } from 'lucide-react'
import { useOrders, useUpdateOrderStatus } from '@/hooks/useOrders'
import { formatCurrency, formatDate, ORDER_STATUSES } from '@/lib/utils'
import Modal from '@/components/ui/Modal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import Pagination from '@/components/ui/Pagination'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  pending:    'bg-amber-50 text-amber-700 border-amber-200',
  confirmed:  'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-purple-50 text-purple-700 border-purple-200',
  shipped:    'bg-indigo-50 text-indigo-700 border-indigo-200',
  completed:  'bg-green-50 text-green-700 border-green-200',
  cancelled:  'bg-red-50 text-red-700 border-red-200',
}

export default function AdminOrders() {
  const { data: orders, loading, refetch } = useOrders()
  const { update, loading: updating } = useUpdateOrderStatus()
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [page, setPage] = useState(1)
  const PER_PAGE = 15

  const handleUpdateStatus = async (id, status) => {
    try {
      await update(id, status)
      toast.success('Status pesanan diperbarui')
      refetch()
      if (selectedOrder?.id === id) {
        setSelectedOrder((o) => ({ ...o, status }))
      }
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-light text-[#1C1917]">Pesanan</h1>
          <p className="font-body text-sm text-[#9C9890] mt-1">{orders.length} pesanan</p>
        </div>
        <button onClick={refetch} className="btn-ghost text-xs gap-2">
          <RefreshCw size={13} strokeWidth={1.5} />
          Refresh
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : orders.length === 0 ? (
        <EmptyState title="Belum ada pesanan" />
      ) : (() => {
        const totalPages = Math.ceil(orders.length / PER_PAGE)
        const paginated  = orders.slice((page - 1) * PER_PAGE, page * PER_PAGE)
        return (
          <>
            <div className="bg-white border border-[#E8E4DC] overflow-hidden shadow-luxury">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-[#E8E4DC] bg-[#FAF8F4]">
                      {['ID', 'Pelanggan', 'Wilayah', 'Total', 'Status', 'Tanggal', ''].map((h) => (
                        <th key={h} className="px-4 py-3 text-left font-body text-[10px] font-semibold text-[#9C9890] uppercase tracking-widest">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EDE6]">
                    {paginated.map((order) => (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-[#FAF8F4]"
                      >
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-[#9C9890]">#{order.id.slice(-6).toUpperCase()}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-body text-sm text-[#1C1917]">{order.customer_name || '-'}</p>
                          <p className="font-body text-xs text-[#9C9890]">{order.customer_phone || ''}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-body text-xs text-[#6B7280] capitalize">{order.admin_region || '-'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-body text-sm font-medium text-[#1C1917]">{formatCurrency(order.total)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-[10px] font-body font-semibold px-2 py-1 border ${STATUS_COLORS[order.status] || 'bg-gray-50 text-[#6B7280]'}`}>
                        {ORDER_STATUSES[order.status]?.label || order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-body text-xs text-[#9C9890]">{formatDate(order.created_at)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 text-[#9C9890] hover:text-[#C9A455] transition-colors"
                      >
                        <Eye size={14} strokeWidth={1.5} />
                      </button>
                    </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage}
              total={orders.length} perPage={PER_PAGE} />
          </>
        )
      })()}

      {/* Order Detail Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Pesanan #${selectedOrder?.id?.slice(-6).toUpperCase()}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-[#9C9890] mb-1">Pelanggan</p>
                <p className="font-body font-medium text-[#1C1917]">{selectedOrder.customer_name || '-'}</p>
                <p className="font-body text-xs text-[#9C9890]">{selectedOrder.customer_phone || ''}</p>
              </div>
              <div>
                <p className="text-xs text-[#9C9890] mb-1">Wilayah Admin</p>
                <p className="font-body font-medium text-[#1C1917] capitalize">{selectedOrder.admin_region || '-'}</p>
              </div>
              {selectedOrder.notes && (
                <div className="col-span-2">
                  <p className="text-xs text-[#9C9890] mb-1">Catatan</p>
                  <p className="font-body text-sm text-[#1C1917]">{selectedOrder.notes}</p>
                </div>
              )}
            </div>

            {/* Items */}
            {selectedOrder.order_items?.length > 0 && (
              <div>
                <p className="font-body text-xs font-semibold text-[#9C9890] uppercase tracking-wide mb-3">Item Pesanan</p>
                <div className="space-y-2">
                  {selectedOrder.order_items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b border-[#F0EDE6] last:border-0">
                      <div>
                        <p className="font-body text-sm text-[#1C1917]">{item.product_name}</p>
                        <p className="font-body text-xs text-[#9C9890]">x{item.quantity} × {formatCurrency(item.unit_price)}</p>
                      </div>
                      <p className="font-body text-sm font-medium text-[#1C1917]">{formatCurrency(item.subtotal)}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between pt-3 font-body text-sm font-semibold text-[#1C1917]">
                  <span>Total</span>
                  <span>{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
            )}

            {/* Status update */}
            <div>
              <p className="font-body text-xs font-semibold text-[#9C9890] uppercase tracking-wide mb-3">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(ORDER_STATUSES).map(([key, { label }]) => (
                  <button
                    key={key}
                    onClick={() => handleUpdateStatus(selectedOrder.id, key)}
                    disabled={updating || selectedOrder.status === key}
                    className={`px-3 py-1.5 text-xs font-body font-medium border transition-all ${
                      selectedOrder.status === key
                        ? 'bg-[#C9A455] text-white border-[#C9A455]'
                        : 'bg-white text-[#6B7280] border-[#E8E4DC] hover:border-[#C9A455]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
