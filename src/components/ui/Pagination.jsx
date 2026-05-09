import { ChevronLeft, ChevronRight } from 'lucide-react'

const F = 'Inter, sans-serif'

export default function Pagination({ page, totalPages, onPageChange, total, perPage }) {
  if (totalPages <= 1) return null

  // Generate page numbers: show max 5, with ellipsis if needed
  function getPages() {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages = []
    if (page <= 4) {
      pages.push(1, 2, 3, 4, 5, '…', totalPages)
    } else if (page >= totalPages - 3) {
      pages.push(1, '…', totalPages-4, totalPages-3, totalPages-2, totalPages-1, totalPages)
    } else {
      pages.push(1, '…', page-1, page, page+1, '…', totalPages)
    }
    return pages
  }

  const from = (page - 1) * perPage + 1
  const to   = Math.min(page * perPage, total)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-[#E8E4DC]">
      {/* Info */}
      <p className="text-[11px] text-[#9C9890] order-2 sm:order-1" style={{ fontFamily: F }}>
        Menampilkan {from}–{to} dari {total}
      </p>

      {/* Controls */}
      <div className="flex items-center gap-1 order-1 sm:order-2">
        {/* Prev */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-2 border border-[#E8E4DC] text-[#9C9890] hover:border-[#C9A455] hover:text-[#C9A455] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={13} strokeWidth={1.5} />
        </button>

        {/* Page numbers */}
        {getPages().map((p, i) =>
          p === '…' ? (
            <span key={`e${i}`} className="w-8 text-center text-[12px] text-[#9C9890]" style={{ fontFamily: F }}>…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 text-[12px] border transition-colors ${
                p === page
                  ? 'border-[#C9A455] bg-[#C9A455] text-white'
                  : 'border-[#E8E4DC] text-[#6B7280] hover:border-[#C9A455] hover:text-[#C9A455]'
              }`}
              style={{ fontFamily: F }}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="p-2 border border-[#E8E4DC] text-[#9C9890] hover:border-[#C9A455] hover:text-[#C9A455] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={13} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}
