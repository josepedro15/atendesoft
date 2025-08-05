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

    const body = await req.json()
    const { userId, email, full_name, company, phone, role } = body
    
    console.log('Update user request:', { userId, email, full_name, company, phone, role })

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

    // Atualizar email se fornecido
    if (email) {
      console.log('Updating email for user:', userId)
      const { error: emailError } = await supabaseClient.auth.admin.updateUserById(
        userId,
        { email }
      )
      if (emailError) {
        console.error('Error updating email:', emailError)
        return new Response(
          JSON.stringify({ error: 'Failed to update email: ' + emailError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      console.log('Email updated successfully')
    }

    // Atualizar profile
    console.log('Updating profile for user:', userId, 'with data:', { full_name, company, phone });
    const { data: profileData, error: profileError } = await supabaseClient
      .from('profiles')
      .upsert({
        user_id: userId,
        full_name,
        company,
        phone
      })
      .select()

    if (profileError) {
      console.error('Error updating profile:', profileError)
      return new Response(
        JSON.stringify({ error: 'Failed to update profile: ' + profileError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    console.log('Profile updated successfully:', profileData)

    // Atualizar role
    console.log('Updating role for user:', userId, 'to:', role);
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: role || 'user'
      })
      .select()

    if (roleError) {
      console.error('Error updating role:', roleError)
      return new Response(
        JSON.stringify({ error: 'Failed to update role: ' + roleError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    console.log('Role updated successfully:', roleData)

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in update-user function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})