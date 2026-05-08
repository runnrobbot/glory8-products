import { useState, useEffect } from 'react';
import { Star, Plus, Trash2, GripVertical, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminFeatured() {
  const [featured, setFeatured] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchFeatured();
    fetchAllProducts();
  }, []);

  async function fetchFeatured() {
    setLoading(true);
    const { data, error } = await supabase
      .from('featured_products')
      .select(`
        id, sort_order,
        products (id, name, slug, price, unit, is_active,
          product_images (url, is_primary)
        )
      `)
      .order('sort_order', { ascending: true });
    if (!error) setFeatured(data || []);
    setLoading(false);
  }

  async function fetchAllProducts() {
    const { data } = await supabase
      .from('products')
      .select('id, name, slug, price, unit')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('name');
    setAllProducts(data || []);
  }

  async function addFeatured() {
    if (!selectedProduct) return toast.error('Pilih produk terlebih dahulu');
    const alreadyFeatured = featured.find(f => f.products?.id === selectedProduct);
    if (alreadyFeatured) return toast.error('Produk sudah ada di unggulan');
    setSaving(true);
    const maxOrder = featured.length > 0 ? Math.max(...featured.map(f => f.sort_order)) : 0;
    const { error } = await supabase
      .from('featured_products')
      .insert({ product_id: selectedProduct, sort_order: maxOrder + 1 });
    if (error) toast.error('Gagal menambahkan produk unggulan');
    else { toast.success('Produk ditambahkan ke unggulan'); setShowAddModal(false); setSelectedProduct(''); fetchFeatured(); }
    setSaving(false);
  }

  async function removeFeatured(id) {
    const { error } = await supabase.from('featured_products').delete().eq('id', id);
    if (error) toast.error('Gagal menghapus produk unggulan');
    else { toast.success('Produk dihapus dari unggulan'); fetchFeatured(); }
  }

  async function moveOrder(id, direction) {
    const idx = featured.findIndex(f => f.id === id);
    if ((direction === -1 && idx === 0) || (direction === 1 && idx === featured.length - 1)) return;
    const swapIdx = idx + direction;
    const updates = [
      { id: featured[idx].id, sort_order: featured[swapIdx].sort_order },
      { id: featured[swapIdx].id, sort_order: featured[idx].sort_order },
    ];
    for (const u of updates) {
      await supabase.from('featured_products').update({ sort_order: u.sort_order }).eq('id', u.id);
    }
    fetchFeatured();
  }

  if (loading) return (
    <div className="p-8 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#C9A455] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Produk Unggulan</h1>
          <p className="text-sm text-[#9C9890] mt-1">Kelola produk yang ditampilkan di halaman utama</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#1C1917] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#C9A455] transition-colors"
        >
          <Plus size={16} />
          Tambah Unggulan
        </button>
      </div>

      {/* Featured List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {featured.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#9C9890]">
            <Star size={40} className="mb-4 opacity-30" />
            <p className="font-medium">Belum ada produk unggulan</p>
            <p className="text-sm mt-1">Tambahkan produk untuk ditampilkan di halaman utama</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {featured.map((item, idx) => {
              const product = item.products;
              const primaryImage = product?.product_images?.find(i => i.is_primary) || product?.product_images?.[0];
              return (
                <div key={item.id} className="flex items-center gap-4 p-4">
                  <div className="flex flex-col gap-1">
                    <button onClick={() => moveOrder(item.id, -1)} disabled={idx === 0} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 transition-colors">
                      <GripVertical size={14} className="text-[#9C9890] rotate-90" />
                    </button>
                    <span className="text-xs text-[#9C9890] text-center">{idx + 1}</span>
                    <button onClick={() => moveOrder(item.id, 1)} disabled={idx === featured.length - 1} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 transition-colors">
                      <GripVertical size={14} className="text-[#9C9890] -rotate-90" />
                    </button>
                  </div>
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {primaryImage ? (
                      <img src={primaryImage.url} alt={product?.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#C4BEB5]">
                        <Star size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{product?.name}</p>
                    <p className="text-sm text-[#C9A455] mt-0.5">{formatCurrency(product?.price)} / {product?.unit}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${product?.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-[#9C9890]'}`}>
                      {product?.is_active ? <Eye size={10} /> : <EyeOff size={10} />}
                      {product?.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                    <button
                      onClick={() => removeFeatured(item.id)}
                      className="p-2 text-[#9C9890] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tambah Produk Unggulan</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#1C1917] mb-2">Pilih Produk</label>
              <select
                value={selectedProduct}
                onChange={e => setSelectedProduct(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="">-- Pilih produk --</option>
                {allProducts.map(p => (
                  <option key={p.id} value={p.id}>{p.name} — {formatCurrency(p.price)}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm text-[#6B7280] hover:bg-gray-100 rounded-lg transition-colors">Batal</button>
              <button onClick={addFeatured} disabled={saving} className="px-4 py-2 text-sm bg-[#1C1917] text-white rounded-lg hover:bg-[#C9A455] transition-colors disabled:opacity-50">
                {saving ? 'Menyimpan...' : 'Tambah'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
