import { supabase } from '@/lib/supabase'

const PRODUCT_SELECT = `
  *,
  product_categories(id, name, slug),
  product_images(id, url, alt, is_primary, sort_order),
  product_collections(id, name, slug),
  product_types(id, name, code, price, stock, description, is_active, sort_order)
`

// Helper: konversi empty string ke null untuk UUID fields
function sanitizeUUID(val) {
  if (!val || val === '') return null
  return val
}

export const productService = {
  async getProducts({ category, collection, search, featured, limit = 20, offset = 0 } = {}) {
    let query = supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (category)   query = query.eq('category_id', category)
    if (featured)   query = query.eq('is_featured', true)
    if (search)     query = query.ilike('name', `%${search}%`)
    if (collection) query = query.eq('collection_id', collection)

    const { data, error, count } = await query
    if (error) throw error
    return { data: data || [], count: count || 0 }
  },

  async getProductBySlug(slug) {
    if (!slug) throw new Error('Slug tidak valid')
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('slug', slug)
      .eq('is_active', true)
      .single()
    if (error) throw error
    return data
  },

  // Admin: semua produk (termasuk nonaktif)
  async getAllProducts({ search, limit = 100 } = {}) {
    let query = supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (search) query = query.ilike('name', `%${search}%`)
    const { data, error } = await query
    if (error) throw error
    return { data: data || [], count: data?.length || 0 }
  },

  async getCategories() {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    if (error) throw error
    return data || []
  },

  async getCollections() {
    const { data, error } = await supabase
      .from('product_collections')
      .select('*, products(count)')
      .eq('is_active', true)
      .order('sort_order')
    if (error) throw error
    return data || []
  },

  async getFeaturedProducts() {
    const { data, error } = await supabase
      .from('featured_products')
      .select(`
        *,
        products(
          *,
          product_categories(name, slug),
          product_images(url, alt, is_primary)
        )
      `)
      .order('sort_order')
      .limit(8)
    if (error) throw error
    return (data || []).map(f => f.products).filter(Boolean)
  },

  async getRelatedProducts(productId, categoryId, limit = 4) {
    if (!productId || !categoryId) return []
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .neq('id', productId)
      .limit(limit)
    if (error) throw error
    return data || []
  },

  // ── Admin: Product CRUD ─────────────────────────────────────
  async upsertProduct(product) {
    // Sanitasi UUID fields — empty string akan error di Postgres
    const payload = {
      ...product,
      category_id:   sanitizeUUID(product.category_id),
      collection_id: sanitizeUUID(product.collection_id),
      price:         product.price !== '' && product.price != null ? Number(product.price) : null,
      stock:         product.stock !== '' && product.stock != null ? parseInt(product.stock) : null,
    }

    const { data, error } = await supabase
      .from('products')
      .upsert(payload)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async deleteProduct(id) {
    // Hapus gambar di storage dulu
    const { data: images } = await supabase
      .from('product_images')
      .select('url')
      .eq('product_id', id)

    if (images?.length) {
      const paths = images
        .map(img => {
          const marker = '/glory8-assets/'
          const idx = img.url.indexOf(marker)
          return idx !== -1 ? img.url.substring(idx + marker.length) : null
        })
        .filter(Boolean)
      if (paths.length) {
        await supabase.storage.from('glory8-assets').remove(paths)
      }
    }

    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw error
  },

  // ── Image management ────────────────────────────────────────
  async uploadProductImage(file, productId, isPrimary = false) {
    const ext  = file.name.split('.').pop().toLowerCase()
    const path = `products/${productId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('glory8-assets')
      .upload(path, file, { cacheControl: '3600', upsert: false })
    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('glory8-assets')
      .getPublicUrl(path)

    if (isPrimary) {
      await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', productId)
    }

    const { count } = await supabase
      .from('product_images')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', productId)

    const { data: imgRecord, error: dbError } = await supabase
      .from('product_images')
      .insert({
        product_id: productId,
        url:        publicUrl,
        alt:        file.name,
        is_primary: isPrimary,
        sort_order: count || 0,
      })
      .select()
      .single()
    if (dbError) throw dbError
    return imgRecord
  },

  async deleteProductImage(imageId, imageUrl) {
    const marker = '/glory8-assets/'
    const idx    = imageUrl.indexOf(marker)
    if (idx !== -1) {
      const path = imageUrl.substring(idx + marker.length)
      await supabase.storage.from('glory8-assets').remove([path])
    }
    const { error } = await supabase.from('product_images').delete().eq('id', imageId)
    if (error) throw error
  },

  async setImagePrimary(imageId, productId) {
    await supabase
      .from('product_images')
      .update({ is_primary: false })
      .eq('product_id', productId)
    const { error } = await supabase
      .from('product_images')
      .update({ is_primary: true })
      .eq('id', imageId)
    if (error) throw error
  },

  async getProductImages(productId) {
    if (!productId) return []
    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('sort_order')
    if (error) throw error
    return data || []
  },
}

// ── Product Types CRUD ──────────────────────────────────────
export const productTypeService = {
  async getByProduct(productId) {
    const { data, error } = await supabase
      .from('product_types')
      .select('*')
      .eq('product_id', productId)
      .order('sort_order')
    if (error) throw error
    return data || []
  },

  async upsert(type) {
    const payload = {
      ...type,
      price: type.price !== '' && type.price != null ? Number(type.price) : null,
      stock: type.stock !== '' && type.stock != null ? parseInt(type.stock) : null,
    }
    const { data, error } = await supabase
      .from('product_types')
      .upsert(payload)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase
      .from('product_types')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  async reorder(items) {
    // items: [{id, sort_order}]
    for (const item of items) {
      await supabase
        .from('product_types')
        .update({ sort_order: item.sort_order })
        .eq('id', item.id)
    }
  },
}
