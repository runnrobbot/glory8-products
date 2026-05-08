import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function InspirationPage() {
  const [active, setActive] = useState('')          // '' = semua
  const [images, setImages] = useState([])
  const [categories, setCategories] = useState([])  // dynamic from DB
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('gallery_categories').select('*').eq('is_active', true).order('sort_order'),
      supabase.from('inspiration_gallery').select('*').eq('is_active', true).order('sort_order'),
    ]).then(([{ data: cats }, { data: imgs }]) => {
      setCategories(cats || [])
      setImages(imgs || [])
      setLoading(false)
    })
  }, [])

  const filtered = active ? images.filter(img => img.category === active) : images

  return (
    <div className="min-h-screen bg-[#FAF8F4] pt-20">
      <div className="bg-white border-b border-[#E8E4DC] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="section-subtitle">Galeri</p>
          <h1 className="section-title">Inspirasi Interior</h1>
          <p className="font-body text-sm text-[#9C9890] mt-2 max-w-lg">
            Temukan inspirasi desain interior premium dengan material Glory8
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Category filter — fully dynamic */}
        {categories.length > 0 && (
          <div className="flex gap-3 overflow-x-auto hide-scrollbar mb-10">
            <button
              onClick={() => setActive('')}
              className={`flex-shrink-0 px-5 py-2 text-xs font-body font-medium transition-all border ${!active ? 'bg-[#C9A455] text-white border-[#C9A455]' : 'bg-white text-[#6B7280] border-[#E8E4DC] hover:border-[#C9A455]'}`}
            >
              Semua
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActive(cat.name === active ? '' : cat.name)}
                className={`flex-shrink-0 px-5 py-2 text-xs font-body font-medium transition-all border ${active === cat.name ? 'bg-[#C9A455] text-white border-[#C9A455]' : 'bg-white text-[#6B7280] border-[#E8E4DC] hover:border-[#C9A455]'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-body text-sm text-[#9C9890]">Galeri akan segera tersedia</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {filtered.map((img, i) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="break-inside-avoid overflow-hidden group relative"
              >
                <img
                  src={img.url}
                  alt={img.title || 'Inspirasi Interior'}
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {img.title && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end p-4 opacity-0 group-hover:opacity-100">
                    <div>
                      <p className="font-display text-base text-white">{img.title}</p>
                      {img.category && <p className="font-body text-xs text-[#D4B570] mt-0.5">{img.category}</p>}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
