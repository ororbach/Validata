// This service provides functions for managing and analyzing measurement data.
import {
  normalizeRecord,
  aggregateByParticipant,
  calculateDescriptiveStats,
  calculateRMSE,
  calculateMAE,
  calculateBlandAltman,
  calculatePassRate,
  binDifferences,
  calculateRMSEPerSession,
  getDifferences,
  getProgressChartData,
  getStatusChartData,
  generateAnalysisText
} from './statistics';

// Fetches all measurements for a specific study or across all studies.
export async function getMeasurements(session, studyId) {
  let query = session.supabaseClient
    .from('measurements')
    .select('*')
    .order('timestamp', { ascending: false });

  if (studyId) query = query.eq('study_id', studyId);

  const { data, error } = await query;
  if (error) throw error;
  return { data };
}

// Performs a comprehensive statistical analysis on the provided measurement data.
export function calculateAnalysis(session, body) {
  // Process data
  const threshold = parseFloat(body.threshold) || 5;
  const rawMeasurements = body.measurements || [];
  const participants = body.participants || [];

  const progressData = getProgressChartData(participants, rawMeasurements);
  const statusData = getStatusChartData(participants);
  const aiResult = generateAnalysisText(participants, rawMeasurements);

  const normalizedData = rawMeasurements
    .filter((m) => m.isValid !== false)
    .map(normalizeRecord)
    .filter((m) => m.goniometerAngle > 0 && m.aiAngle > 0);

  const statsData = aggregateByParticipant(normalizedData);
  const descriptiveStats = calculateDescriptiveStats(statsData);

  const rmse = calculateRMSE(statsData);
  const mae = calculateMAE(statsData);
  const { meanDiff, upperLimit, lowerLimit, isNormal, method } = calculateBlandAltman(statsData);
  const { pass, fail, percentage } = calculatePassRate(statsData, threshold);

  return {
    data: {
      progressData,
      statusData,
      aiResult,
      statsData,
      summaryStats: { rmse, mae, meanBias: meanDiff, passRate: percentage },
      descriptiveStats,
      charts: {
        blandAltman: { plotData: getDifferences(statsData), meanDiff, upperLimit, lowerLimit, isNormal, method },
        errorHistogram: { bins: binDifferences(statsData) },
        performanceTrend: { sessions: calculateRMSEPerSession(statsData) },
        thresholdDonut: { pass, fail, percentage, threshold }
      }
    }
  };
}

// Adds a new measurement record to the database for a specific participant.
export async function addMeasurement(session, body) {
  const { participantId, goniometer, aiModel, notes, testDate, studyId } = body;

  if (!studyId) {
    return { error: 'A study must be selected before logging a measurement.', status: 400 };
  }

  const parsedGoniometer = parseFloat(goniometer.toString().replace('°', '')) || 0.0;
  const parsedAiModel = parseFloat(aiModel.toString().replace('°', '')) || 0.0;

  // Save measurement
  const { data, error } = await session.supabaseClient
    .from('measurements')
    .insert({
      participant_id: participantId,
      goniometer: parsedGoniometer,
      ai_model: parsedAiModel,
      notes,
      study_id: studyId,
      timestamp: new Date().toISOString(),
      test_date: testDate || new Date().toISOString().split('T')[0]
    })
    .select();

  if (error) throw error;
  return { data: data[0] };
}

// Updates the validity status of a specific measurement or all measurements for a participant.
export async function toggleMeasurementValidity(session, body) {
  const { id, isValid, participantId, studyId } = body;

  // Update validity
  if (participantId) {
    if (!studyId) {
      return { error: 'A study must be selected before updating measurements.', status: 400 };
    }

    const { data, error } = await session.supabaseClient
      .from('measurements')
      .update({ is_valid: isValid })
      .eq('participant_id', participantId)
      .eq('study_id', studyId)
      .select();

    if (error) throw error;
    return { data };
  }

  const { data, error } = await session.supabaseClient
    .from('measurements')
    .update({ is_valid: isValid })
    .eq('id', id)
    .select();

  if (error) throw error;
  return { data: data[0] };
}
