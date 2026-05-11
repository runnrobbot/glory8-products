import { useState, useEffect, useCallback, useRef } from 'react'
import { orderService } from '@/services/orderService'

const cache = new Map()
const CACHE_TTL = 15_000

function getCached(key) {
  const e = cache.get(key)
  if (!e || Date.now() - e.ts > CACHE_TTL) { cache.delete(key); return null }
  return e.data
}

export function useOrders(filters = {}) {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const mountedRef            = useRef(true)
  const filtersKey            = JSON.stringify(filters)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const fetchOrders = useCallback(async (bustCache = false) => {
    const cacheKey = `orders:${filtersKey}`
    if (!bustCache) {
      const cached = getCached(cacheKey)
      if (cached) {
        if (mountedRef.current) { setData(cached); setLoading(false) }
        return
      }
    } else {
      cache.delete(cacheKey)
    }

    if (mountedRef.current) { setLoading(true); setError(null) }

    try {
      const result = await orderService.getOrders(filters)
      if (!mountedRef.current) return
      cache.set(cacheKey, { data: result || [], ts: Date.now() })
      setData(result || [])
    } catch (err) {
      if (!mountedRef.current) return
      setError(err.message)
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [filtersKey]) 

  useEffect(() => { fetchOrders() }, [fetchOrders])

  return { data, loading, error, refetch: () => fetchOrders(true) }
}

export function useUpdateOrderStatus() {
  const [loading, setLoading] = useState(false)
  const update = async (id, status) => {
    setLoading(true)
    try { return await orderService.updateOrderStatus(id, status) }
    finally { setLoading(false) }
  }
  return { update, loading }
}
