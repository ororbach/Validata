export async function getProfiles(session, fetchCurrentOnly) {
  // 1. Fetch current user's profile
  if (fetchCurrentOnly) {
    const { data: profile, error } = await session.supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) {
      // If profile doesn't exist, try to create it
      const { data: newProfile, error: createError } = await session.supabaseClient
        .from('profiles')
        .insert({
          id: session.user.id,
          email: session.user.email,
          role: 'team_member',
          status: 'pending'
        })
        .select()
        .single();

      if (createError) throw createError;
      return { data: newProfile };
    }

    return { data: profile };
  }

  // 2. Fetch all profiles (Mentors only)
  if (session.profile.role !== 'mentor') {
    return { error: 'Forbidden. Mentors only.', status: 403 };
  }

  const { data: profiles, error } = await session.supabaseClient
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return { data: profiles };
}

export async function updateProfile(session, body) {
  if (session.profile.role !== 'mentor') {
    return { error: 'Forbidden. Mentors only.', status: 403 };
  }

  const { id, role, status } = body;

  const updates = {};
  if (role !== undefined) updates.role = role;
  if (status !== undefined) updates.status = status;

  const { data, error } = await session.supabaseClient
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) throw error;
  return { data: data[0] };
}

export async function deleteProfile(session, id) {
  if (session.profile.role !== 'mentor') {
    return { error: 'Forbidden. Mentors only.', status: 403 };
  }

  if (!id) {
    return { error: 'Missing user ID', status: 400 };
  }

  const { error } = await session.supabaseClient
    .from('profiles')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { data: { success: true, deletedId: id } };
}
