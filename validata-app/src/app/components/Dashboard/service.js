import { supabase } from '../../../lib/supabase';

// --- Auth & Profiles ---
export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const verifySession = async (token) => {
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) throw new Error('Auth session invalid');
  return user;
};

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

// --- Studies ---
export const fetchStudies = async () => {
  const res = await fetch('/api/studies');
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error || 'Failed to fetch studies');
  return data;
};

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

export const deleteStudy = async (id) => {
  const res = await fetch(`/api/studies?id=${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete study');
  return data;
};

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

// --- Participants ---
export const fetchParticipants = async (studyId) => {
  const res = await fetch(`/api/participants?study_id=${studyId}`);
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error || 'Failed to fetch participants');
  return data;
};

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

// --- Measurements ---
export const fetchMeasurements = async (studyId) => {
  const res = await fetch(`/api/measurements?study_id=${studyId}`);
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error || 'Failed to fetch measurements');
  return data;
};

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
