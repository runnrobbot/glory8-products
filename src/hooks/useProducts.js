import { useState, useEffect, useCallback, useRef } from 'react'
import { productService } from '@/services/productService'

// ── In-memory cache (module-level, persists across renders) ────
const cache = new Map()
const CACHE_TTL = 30_000

function getCached(key) {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.ts > CACHE_TTL) { cache.delete(key); return null }
  return entry.data
}
function setCached(key, data) {
  cache.set(key, { data, ts: Date.now() })
}
export function invalidateCache(prefix) {
  for (const key of cache.keys()) {
    if (!prefix || key.startsWith(prefix)) cache.delete(key)
  }
}

/**
 * useFetch — fetch sekali, cache, tidak double-fetch.
 * Prinsip: satu useEffect, satu path, cancel via flag.
 */
function useFetch(key, fetcher) {
  const [state, setState] = useState(() => {
    const cached = getCached(key)
    return { data: cached ?? null, loading: !cached, error: null }
  })

  // Simpan fetcher terbaru di ref — tidak jadi dependency effect
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const keyRef = useRef(key)

  useEffect(() => {
    // Key berubah — reset state jika berbeda
    if (keyRef.current !== key) {
      keyRef.current = key
    }

    const cached = getCached(key)
    if (cached) {
      setState({ data: cached, loading: false, error: null })
      return
    }

    let cancelled = false
    setState(s => ({ ...s, loading: true, error: null }))

    fetcherRef.current().then(result => {
      if (cancelled) return
      setCached(key, result)
      setState({ data: result, loading: false, error: null })
    }).catch(err => {
      if (cancelled) return
      setState({ data: null, loading: false, error: err.message })
    })

    return () => { cancelled = true }
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  const refetch = useCallback(() => {
    cache.delete(key)
    let cancelled = false
    setState(s => ({ ...s, loading: true, error: null }))
    fetcherRef.current().then(result => {
      if (cancelled) return
      setCached(key, result)
      setState({ data: result, loading: false, error: null })
    }).catch(err => {
      if (cancelled) return
      setState(s => ({ ...s, loading: false, error: err.message }))
    })
    return () => { cancelled = true }
  }, [key])

  return { ...state, refetch }
}

// ── useProducts — dengan filter & debounced search ─────────────
export function useProducts(filters = {}) {
  const filtersKey   = JSON.stringify(filters)
  const filtersRef   = useRef(filters)
  filtersRef.current = filters

  const [state, setState] = useState(() => {
    const cacheKey = `products:${filtersKey}`
    const cached = getCached(cacheKey)
    return {
      data:    cached?.data    ?? [],
      count:   cached?.count   ?? 0,
      loading: !cached,
      error:   null,
    }
  })

  useEffect(() => {
    const cacheKey = `products:${filtersKey}`
    const cached = getCached(cacheKey)
    if (cached) {
      setState({ data: cached.data || [], count: cached.count || 0, loading: false, error: null })
      return
    }

    let cancelled = false
    setState(s => ({ ...s, loading: true, error: null }))

    productService.getProducts(filtersRef.current).then(result => {
      if (cancelled) return
      setCached(cacheKey, result)
      setState({ data: result.data || [], count: result.count || 0, loading: false, error: null })
    }).catch(err => {
      if (cancelled) return
      setState(s => ({ ...s, loading: false, error: err.message }))
    })

    return () => { cancelled = true }
  }, [filtersKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const refetch = useCallback(() => {
    invalidateCache('products:')
    const cacheKey = `products:${filtersKey}`
    let cancelled = false
    setState(s => ({ ...s, loading: true }))
    productService.getProducts(filtersRef.current).then(result => {
      if (cancelled) return
      setCached(cacheKey, result)
      setState({ data: result.data || [], count: result.count || 0, loading: false, error: null })
    }).catch(err => {
      if (cancelled) return
      setState(s => ({ ...s, loading: false, error: err.message }))
    })
    return () => { cancelled = true }
  }, [filtersKey])

  return { ...state, refetch }
}

// ── Specific hooks ─────────────────────────────────────────────
export function useProduct(slug) {
  const { data, loading, error, refetch } = useFetch(
    `product:${slug}`,
    () => productService.getProductBySlug(slug)
  )
  return { data, loading, error, refetch }
}

export function useCategories() {
  const { data, loading, refetch } = useFetch('categories', () => productService.getCategories())
  return { data: data || [], loading, refetch }
}

export function useCollections() {
  const { data, loading, refetch } = useFetch('collections', () => productService.getCollections())
  return { data: data || [], loading, refetch }
}

export function useFeaturedProducts() {
  const { data, loading, refetch } = useFetch('featured', () => productService.getFeaturedProducts())
  return { data: data || [], loading, refetch }
}
