import { useRecentActivity } from '@/hooks/useAnalytics'
import { formatDate } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Activity } from 'lucide-react'

export default function AdminActivity() {
  const { data: logs, loading } = useRecentActivity()

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-light text-[#1C1917]">Log Aktivitas</h1>
        <p className="font-body text-sm text-[#9C9890] mt-1">Riwayat aktivitas sistem</p>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="bg-white border border-[#E8E4DC] shadow-luxury overflow-hidden">
          {logs.length === 0 ? (
            <div className="py-16 text-center">
              <Activity size={32} strokeWidth={1} className="text-[#C4BEB5] mx-auto mb-3" />
              <p className="font-body text-sm text-[#9C9890]">Belum ada log aktivitas</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F0EDE6]">
              {logs.map((log) => (
                <div key={log.id} className="px-6 py-4 flex items-start gap-4">
                  <div className="w-8 h-8 bg-[#FAF8F4] flex items-center justify-center shrink-0 mt-0.5">
                    <Activity size={14} strokeWidth={1.5} className="text-[#C9A455]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm text-[#1C1917]">
                      <span className="font-medium capitalize">{log.action}</span>
                      {' on '}
                      <span className="text-[#9C9890] capitalize">{log.entity_type}</span>
                      {log.entity_id && <span className="text-[#9C9890] ml-1">#{log.entity_id.toString().slice(-6)}</span>}
                    </p>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <p className="font-mono text-xs text-[#9C9890] mt-1 line-clamp-1">
                        {JSON.stringify(log.metadata)}
                      </p>
                    )}
                  </div>
                  <p className="font-body text-xs text-[#9C9890] shrink-0">{formatDate(log.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
