import { supabase } from '@/lib/supabase'

export const analyticsService = {
  async getDashboardStats() {
    // Pakai count: 'exact' + head: true untuk semua — tidak fetch rows ke browser
    const [productsRes, ordersCountRes, pendingRes, completedRes] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    ])

    return {
      products:  productsRes.count  || 0,
      orders:    ordersCountRes.count || 0,
      pending:   pendingRes.count   || 0,
      completed: completedRes.count || 0,
      revenue:   null, // Perlu aggregate query — bisa ditambah nanti
    }
  },

  async getRecentActivity(limit = 20) {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  },

  async logActivity(action, entity_type, entity_id, metadata = {}) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action,
        entity_type,
        entity_id,
        metadata,
      })
    } catch {
      // Log gagal tidak boleh crash fitur utama
    }
  },
}
