// This service provides utility functions to process and aggregate participant data for viewing.

// Computes aggregate demographic and health statistics from the provided participant list.
export const getParticipantStats = (participants) => {
  if (!participants || participants.length === 0) {
    return { avgAge: 0, healthyCount: 0, ankleInjuredCount: 0, totalCount: 0 };
  }

  // Filter valid ages
  const validAges = participants
    .map(p => Number(p.age))
    .filter(age => !isNaN(age) && age > 0);
  
  const avgAge = validAges.length > 0
    ? (validAges.reduce((sum, age) => sum + age, 0) / validAges.length).toFixed(1)
    : 0;

  const healthyCount = participants.filter(p => p.healthStatus === 'Healthy').length;
  const ankleInjuredCount = participants.filter(p => p.healthStatus === 'Ankle Injured').length;

  return {
    avgAge,
    healthyCount,
    ankleInjuredCount,
    totalCount: participants.length
  };
};
