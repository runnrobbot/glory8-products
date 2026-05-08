import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

let authSubscription = null

export const useAuthStore = create((set, get) => ({
  user:        null,
  profile:     null,
  role:        null,
  loading:     true,
  initialized: false,

  initialize: async () => {
    if (get().initialized) return

    // Cleanup listener lama
    if (authSubscription) {
      authSubscription.unsubscribe()
      authSubscription = null
    }

    // 1. Ambil session awal
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await get()._loadProfile(session.user)
      }
    } catch (err) {
      console.error('Auth init error:', err)
    } finally {
      set({ loading: false, initialized: true })
    }

    // 2. Pasang listener — hanya react ke event yang penting
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // SIGNED_OUT: bersihkan state
        if (event === 'SIGNED_OUT') {
          set({ user: null, profile: null, role: null })
          return
        }

        // SIGNED_IN: user baru login (bukan token refresh)
        if (event === 'SIGNED_IN' && session?.user) {
          // Cek apakah user-nya berbeda — hindari re-fetch jika sama
          const currentUser = get().user
          if (currentUser?.id !== session.user.id) {
            await get()._loadProfile(session.user)
          }
          return
        }

        // TOKEN_REFRESHED, USER_UPDATED, INITIAL_SESSION: abaikan
        // Tidak perlu fetch profile ulang — session masih sama
      }
    )
    authSubscription = subscription
  },

  // Internal — tidak trigger loading global
  _loadProfile: async (user) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*, roles(name)')
        .eq('id', user.id)
        .single()

      if (error) throw error

      set({
        user,
        profile,
        role: profile?.roles?.name || null,
      })
    } catch (err) {
      console.error('Profile fetch error:', err)
      set({ user, profile: null, role: null })
    }
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  signOut: async () => {
    if (authSubscription) {
      authSubscription.unsubscribe()
      authSubscription = null
    }
    await supabase.auth.signOut()
    set({ user: null, profile: null, role: null, initialized: false })
  },

  isAdmin:      () => ['super_admin', 'admin'].includes(get().role),
  isSuperAdmin: () => get().role === 'super_admin',
  isStaff:      () => ['super_admin', 'admin', 'staff'].includes(get().role),
}))
