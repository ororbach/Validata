import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export function getSupabaseServerClient(token) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    }
  });
}

export async function verifySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('sb-access-token')?.value;
  if (!token) {
    return { error: 'Unauthorized. No session token found.', status: 401 };
  }

  // Create an authenticated client for this server-side request context
  const supabaseServer = getSupabaseServerClient(token);

  // Call Supabase API to get the user object using the access token
  const { data: { user }, error: authError } = await supabaseServer.auth.getUser();
  if (authError || !user) {
    return { error: 'Unauthorized. Invalid session token.', status: 401 };
  }

  // Fetch the user's role and status from the profiles table
  const { data: profile, error: profileError } = await supabaseServer
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    // If user exists in Auth but has no profile, let's create a pending profile
    const { data: newProfile, error: createError } = await supabaseServer
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        role: 'team_member',
        status: 'pending'
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating profile for user:', createError);
      return { error: 'Forbidden. Profile setup failed.', status: 403 };
    }

    return {
      user,
      profile: newProfile,
      supabaseClient: supabaseServer
    };
  }

  if (profile.status !== 'active') {
    return { error: `Forbidden. Account status is ${profile.status}`, status: 403 };
  }

  return {
    user,
    profile,
    supabaseClient: supabaseServer
  };
}
