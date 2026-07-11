// This service provides utility functions for managing and formatting participant data.

// Counts and returns the total number of active participants.
export const countActiveParticipants = (participants) => {
  return participants.filter((p) => p.status === 'Active').length;
};

// Counts participants who are currently active or have successfully completed the study.
export const countRecruitedParticipants = (participants) => {
  return participants.filter((p) => p.status === 'Active' || p.status === 'Completed').length;
};

// Returns the current date formatted as a string.
export const getTodayDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Formats a given date string or object into a user-friendly display format.
export const formatDateForDisplay = (value) => {
  if (!value) return '—';

  const parsedDate = new Date(value);
  // Validate date
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  const day = String(parsedDate.getDate()).padStart(2, '0');
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
  const year = parsedDate.getFullYear();

  return `${day}/${month}/${year}`;
};
