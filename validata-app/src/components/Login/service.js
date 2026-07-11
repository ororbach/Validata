import { supabase } from '@/lib/supabase';
import { setCookie } from '@/lib/cookies';

// This file contains service functions for login and registration with the server.

// This function performs the login process with the database server and saves the cookies.
export const signInWithSupabase = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  const session = data.session;
  if (!session) throw new Error('Could not establish session.');

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  let role = 'team_member';
  let status = 'pending';

  if (profileError || !profile) {
    // Create profile
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        email: data.user.email,
        role: 'team_member',
        status: 'pending'
      })
      .select()
      .single();
    
    if (!createError && newProfile) {
      role = newProfile.role;
      status = newProfile.status;
    }
  } else {
    role = profile.role;
    status = profile.status;
  }

  setCookie('sb-access-token', session.access_token, 7);
  setCookie('user-role', role, 7);
  setCookie('user-status', status, 7);

  return { success: true };
};

// This function performs the registration process and creates a new user in the system.
export const signUpWithSupabase = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  return { success: true };
};
