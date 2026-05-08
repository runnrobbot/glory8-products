import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Buat admin client dengan service_role key (hanya ada di server)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Buat client biasa untuk verifikasi caller
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Verifikasi bahwa yang memanggil adalah super_admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Tidak terautentikasi')

    const token = authHeader.replace('Bearer ', '')
    const { data: { user: caller }, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !caller) throw new Error('Token tidak valid')

    // Cek role caller
    const { data: callerProfile } = await supabaseAdmin
      .from('profiles')
      .select('roles(name)')
      .eq('id', caller.id)
      .single()

    if (callerProfile?.roles?.name !== 'super_admin') {
      throw new Error('Hanya Super Admin yang bisa membuat pengguna baru')
    }

    // Ambil data dari request body
    const { email, password, full_name, phone, role_id, is_active } = await req.json()

    if (!email || !password) throw new Error('Email dan password wajib diisi')
    if (password.length < 8) throw new Error('Password minimal 8 karakter')

    // Buat user baru menggunakan Admin API
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // langsung aktif, tidak perlu konfirmasi email
      user_metadata: { full_name },
    })

    if (createError) throw createError

    // Update profile dengan data lengkap
    if (newUser?.user) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: newUser.user.id,
          email,
          full_name: full_name || '',
          phone: phone || null,
          role_id: role_id || null,
          is_active: is_active !== false,
        })
      if (profileError) throw profileError
    }

    return new Response(
      JSON.stringify({ success: true, user: newUser.user }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
