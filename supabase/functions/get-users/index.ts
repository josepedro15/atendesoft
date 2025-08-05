import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verificar se o usuário atual é admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar se é admin
    const { data: userRole } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!userRole || userRole.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Buscar usuários via Auth Admin API com limite e cache
    const { data: { users }, error: usersError } = await supabaseClient.auth.admin.listUsers({
      page: 1,
      perPage: 50  // Limitado a 50 para melhor performance
    })

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch users', details: usersError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify([]),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Buscar todos os profiles e roles em uma só consulta
    const userIds = users.map(user => user.id)
    
    const [profilesResult, rolesResult] = await Promise.all([
      supabaseClient.from('profiles').select('*').in('user_id', userIds),
      supabaseClient.from('user_roles').select('user_id, role').in('user_id', userIds)
    ])

    const profilesMap = new Map(profilesResult.data?.map(p => [p.user_id, p]) || [])
    const rolesMap = new Map(rolesResult.data?.map(r => [r.user_id, r]) || [])

    // Combinar dados de forma eficiente
    const usersWithDetails = users.map(authUser => ({
      id: authUser.id,
      email: authUser.email,
      created_at: authUser.created_at,
      profile: profilesMap.get(authUser.id) || null,
      role: rolesMap.get(authUser.id) || null
    }))

    console.log('Returning users with details:', usersWithDetails.length, 'users')
    console.log('Sample user data:', usersWithDetails[0])

    return new Response(
      JSON.stringify(usersWithDetails),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in get-users function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})