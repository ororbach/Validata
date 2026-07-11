// This service provides utility functions for the data collection process.

// Filters and returns only the active participants.
export const getActiveParticipants = (participants) => {
  return participants.filter((p) => p.status === 'Active');
};

// Returns the current date formatted as a string.
export const getTodayDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
