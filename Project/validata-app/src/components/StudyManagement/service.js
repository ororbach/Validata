// This service provides validation logic for study operations.

// Validates the data required to create a new study.
export const validateStudyCreation = (name, goal) => {
  const trimmedName = name?.trim() || '';
  if (!trimmedName) return { error: 'Study name is required' };
  
  return { name: trimmedName, goal };
};

// Validates the conditions required to delete an existing study.
export const validateStudyDeletion = (id, studies) => {
  const study = studies.find((s) => s.id === id);
  if (!study) return { error: 'Study not found' };

  if (studies.length <= 1) {
    return { error: 'Cannot delete the only study. Create another study first, then delete this one.' };
  }

  return { study };
};
