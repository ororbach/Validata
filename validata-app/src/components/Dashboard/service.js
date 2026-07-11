import { supabase } from '@/lib/supabase';

// This file contains service functions that interact with the database for various system operations.

// This function signs the user out of the database.
export const signOut = async () => {
  return await supabase.auth.signOut();
};

// This function verifies the validity of the user's session with the database.
export const verifySession = async (token) => {
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) throw new Error('Auth session invalid');
  return user;
};

// This function fetches the user's profile data.
export const fetchUserProfile = async (userId) => {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (profileError || !profile) {
    throw new Error(profileError?.message || 'Profile not found');
  }
  return profile;
};

// This function fetches the list of studies from the server.
export const fetchStudies = async () => {
  const res = await fetch('/api/studies');
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error || 'Failed to fetch studies');
  return data;
};

// This function creates a new study via the server.
export const createStudy = async (name, recruitmentGoal) => {
  const res = await fetch('/api/studies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, recruitmentGoal })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create study');
  return data;
};

// This function deletes an existing study via the server.
export const deleteStudy = async (id) => {
  const res = await fetch(`/api/studies?id=${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete study');
  return data;
};

// This function updates the recruitment goal of a study.
export const updateRecruitmentGoal = async (id, recruitmentGoal) => {
  const res = await fetch('/api/studies', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, recruitmentGoal })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update recruitment goal');
  return data;
};

// This function fetches the list of participants for a given study.
export const fetchParticipants = async (studyId) => {
  const res = await fetch(`/api/participants?study_id=${studyId}`);
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error || 'Failed to fetch participants');
  return data;
};

// This function registers a new participant in the system.
export const createParticipant = async (participantData) => {
  const res = await fetch('/api/participants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(participantData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to add participant');
  return data;
};

// This function updates the status of a participant.
export const updateParticipantStatus = async (id, status, studyId) => {
  const res = await fetch('/api/participants', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, status, studyId })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update participant status');
  return data;
};

// This function fetches measurement data for a specific study.
export const fetchMeasurements = async (studyId) => {
  const res = await fetch(`/api/measurements?study_id=${studyId}`);
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error || 'Failed to fetch measurements');
  return data;
};

// This function saves a new measurement to the server.
export const createMeasurement = async (measurementData) => {
  const res = await fetch('/api/measurements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(measurementData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to log measurement');
  return data;
};

// This function invalidates all measurements for a specific participant.
export const invalidateParticipantMeasurements = async (participantId, studyId) => {
  const res = await fetch('/api/measurements', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ participantId, studyId, isValid: false })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to invalidate participant measurements');
  return data;
};

// This function updates the validity status of a specific measurement.
export const updateMeasurementValidity = async (id, isValid) => {
  const res = await fetch('/api/measurements', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, isValid })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update measurement validity');
  return data;
};
