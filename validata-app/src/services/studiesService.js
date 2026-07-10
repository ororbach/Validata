export async function getStudies(session) {
  const { data, error } = await session.supabaseClient
    .from('studies')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return { data };
}

export async function createStudy(session, body) {
  if (session.profile.role !== 'mentor') {
    return { error: 'Forbidden. Only mentors can create studies.', status: 403 };
  }

  const { name, recruitmentGoal } = body;

  if (!name || !name.trim()) {
    return { error: 'Study name is required.', status: 400 };
  }

  const { data, error } = await session.supabaseClient
    .from('studies')
    .insert({ name, recruitment_goal: parseInt(recruitmentGoal) || 50 })
    .select();

  if (error) throw error;
  return { data: data[0] };
}

export async function updateStudyGoal(session, body) {
  if (session.profile.role !== 'mentor') {
    return { error: 'Forbidden. Only mentors can update studies.', status: 403 };
  }

  const { id, recruitmentGoal } = body;

  const { data, error } = await session.supabaseClient
    .from('studies')
    .update({ recruitment_goal: recruitmentGoal })
    .eq('id', id)
    .select();

  if (error) throw error;
  return { data: data[0] };
}

export async function deleteStudy(session, id) {
  if (session.profile.role !== 'mentor') {
    return { error: 'Forbidden. Only mentors can delete studies.', status: 403 };
  }

  if (!id) {
    return { error: 'Study id is required.', status: 400 };
  }

  const { error: measurementsError } = await session.supabaseClient
    .from('measurements')
    .delete()
    .eq('study_id', id);
  if (measurementsError) throw measurementsError;

  const { error: participantsError } = await session.supabaseClient
    .from('participants')
    .delete()
    .eq('study_id', id);
  if (participantsError) throw participantsError;

  const { error: studyError } = await session.supabaseClient
    .from('studies')
    .delete()
    .eq('id', id);
  if (studyError) throw studyError;

  return { data: { id } };
}
