// This service handles all operations related to managing study participants in the database.

// Retrieves a list of participants, optionally filtered by a specific study ID.
export async function getParticipants(session, studyId) {
  let query = session.supabaseClient
    .from('participants')
    .select('*')
    .order('created_at', { ascending: false });

  if (studyId) query = query.eq('study_id', studyId);

  const { data, error } = await query;
  if (error) throw error;
  return { data };
}

// Adds a new participant to the database for a specific study.
export async function addParticipant(session, body) {
  const { id, consent, status, age, gender, healthStatus, enrollmentDate, studyId } = body;

  if (!studyId) {
    return { error: 'A study must be selected before adding a participant.', status: 400 };
  }

  // Create participant
  const { data, error } = await session.supabaseClient
    .from('participants')
    .insert({
      id,
      consent,
      status: status || 'Active',
      age: parseInt(age) || null,
      gender,
      health_status: healthStatus,
      study_id: studyId,
      enrollment_date: enrollmentDate || new Date().toISOString().split('T')[0]
    })
    .select();

  if (error) throw error;
  return { data: data[0] };
}

// Updates the current status of an existing participant in a study.
export async function updateParticipantStatus(session, body) {
  const { id, status, studyId } = body;

  if (!studyId) {
    return { error: 'A study must be selected before updating a participant.', status: 400 };
  }

  // Update status
  const { data, error } = await session.supabaseClient
    .from('participants')
    .update({ status })
    .eq('id', id)
    .eq('study_id', studyId)
    .select();

  if (error) throw error;
  return { data: data[0] };
}
