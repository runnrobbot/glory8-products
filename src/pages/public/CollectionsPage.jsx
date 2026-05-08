import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useCollections } from '@/hooks/useProducts'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'

export default function CollectionsPage() {
  const { data: collections, loading } = useCollections()

  return (
    <div className="min-h-screen bg-[#FAF8F4] pt-20">
      <div className="bg-white border-b border-[#E8E4DC] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="section-subtitle">Koleksi</p>
          <h1 className="section-title">Semua Koleksi</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <LoadingSpinner />
        ) : collections.length === 0 ? (
          <EmptyState title="Belum ada koleksi" description="Koleksi akan segera hadir" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {collections.map((col, i) => (
              <motion.div
                key={col.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={`/collections/${col.slug}`}
                  className="group relative block aspect-[16/9] bg-gray-800 overflow-hidden"
                >
                  {col.banner_url ? (
                    <img
                      src={col.banner_url}
                      alt={col.name}
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-75 group-hover:scale-105 transition-all duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900" />
                  )}
                  <div className="absolute inset-0 p-4 sm:p-8 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent">
                    <p className="font-body text-[10px] text-[#C9A455] tracking-widest uppercase mb-2">Koleksi Premium</p>
                    <h2 className="font-display text-2xl font-light text-white mb-2">{col.name}</h2>
                    {col.description && (
                      <p className="font-body text-sm text-gray-300 mb-4 line-clamp-2">{col.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-[#C9A455] text-sm font-body">
                      Lihat Koleksi <ArrowRight size={14} strokeWidth={1.5} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
