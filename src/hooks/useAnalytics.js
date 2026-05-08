import { useState, useEffect, useRef } from 'react'
import { analyticsService } from '@/services/analyticsService'

const cache = new Map()
const CACHE_TTL = 60_000

function useCachedFetch(key, fetcher) {
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const [state, setState] = useState(() => {
    const cached = cache.get(key)
    const isValid = cached && Date.now() - cached.ts < CACHE_TTL
    return { data: isValid ? cached.data : null, loading: !isValid }
  })

  useEffect(() => {
    const cached = cache.get(key)
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      setState({ data: cached.data, loading: false })
      return
    }

    let cancelled = false
    setState(s => ({ ...s, loading: true }))

    fetcherRef.current().then(result => {
      if (cancelled) return
      cache.set(key, { data: result, ts: Date.now() })
      setState({ data: result, loading: false })
    }).catch(() => {
      if (cancelled) return
      setState(s => ({ ...s, loading: false }))
    })

    return () => { cancelled = true }
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  return state
}

export function useDashboardStats() {
  return useCachedFetch('dashboard:stats', () => analyticsService.getDashboardStats())
}

export function useRecentActivity() {
  return useCachedFetch('dashboard:activity', () => analyticsService.getRecentActivity())
}
