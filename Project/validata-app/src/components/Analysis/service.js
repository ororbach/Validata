// This file contains service functions for fetching analysis data from the server.

// This function sends a request to the server to fetch the statistical data of measurements.
export const fetchAnalysisData = async (localThreshold, participants, measurements) => {
  const res = await fetch(`/api/measurements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'analysis',
      threshold: localThreshold,
      participants,
      measurements
    })
  });
  
  return res.json();
};
