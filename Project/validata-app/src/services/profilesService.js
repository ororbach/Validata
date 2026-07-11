// This service is responsible for managing user profiles and access roles within the system.

// Retrieves user profiles, either fetching only the current user or all profiles for mentors.
export async function getProfiles(session, fetchCurrentOnly) {
  // Fetch profiles
  if (fetchCurrentOnly) {
    const { data: profile, error } = await session.supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) {
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

// Updates the details of an existing user profile, restricted to mentor roles.
export async function updateProfile(session, body) {
  if (session.profile.role !== 'mentor') {
    return { error: 'Forbidden. Mentors only.', status: 403 };
  }

  const { id, role, status } = body;

  // Update data
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

// Deletes a user profile from the database, restricted to mentor roles.
export async function deleteProfile(session, id) {
  if (session.profile.role !== 'mentor') {
    return { error: 'Forbidden. Mentors only.', status: 403 };
  }

  if (!id) {
    return { error: 'Missing user ID', status: 400 };
  }

  // Delete profile
  const { error } = await session.supabaseClient
    .from('profiles')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { data: { success: true, deletedId: id } };
}
