import { supabase } from '@/lib/supabase'

export const orderService = {
  async createOrder({ items, notes, customer_name, customer_phone, admin_region }) {
    const subtotal = items.reduce(
      (sum, i) => sum + (i.product.price || 0) * i.quantity,
      0
    )

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name,
        customer_phone,
        notes,
        admin_region,
        subtotal,
        total: subtotal,
        status: 'pending',
      })
      .select()
      .single()

    if (orderError) throw orderError

    const orderItems = items.map((i) => ({
      order_id: order.id,
      product_id: i.product.id,
      product_name: i.product.name,
      quantity: i.quantity,
      unit_price: i.product.price || 0,
      subtotal: (i.product.price || 0) * i.quantity,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    return order
  },

  async getOrders({ status, limit = 50, offset = 0 } = {}) {
    let query = supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) query = query.eq('status', status)

    const { data, error } = await query
    if (error) throw error
    return data
  },

  async updateOrderStatus(id, status) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getOrderById(id) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },
}
