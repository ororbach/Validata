export const runtime = 'edge';

import { verifySession } from '@/lib/auth-server';
import {
  getMeasurements,
  calculateAnalysis,
  addMeasurement,
  toggleMeasurementValidity
} from '@/services/measurementsService';

export async function GET(request) {
  try {
    const session = await verifySession();
    if (session.error) return Response.json({ error: session.error }, { status: session.status });

    const { searchParams } = new URL(request.url);
    const studyId = searchParams.get('study_id');

    const result = await getMeasurements(session, studyId);
    if (result.error) return Response.json({ error: result.error }, { status: result.status });

    return Response.json(result.data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await verifySession();
    if (session.error) return Response.json({ error: session.error }, { status: session.status });

    const body = await request.json();

    if (body.type === 'analysis') {
      const result = calculateAnalysis(session, body);
      return Response.json(result.data);
    }

    const result = await addMeasurement(session, body);
    if (result.error) return Response.json({ error: result.error }, { status: result.status });

    return Response.json(result.data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = await verifySession();
    if (session.error) return Response.json({ error: session.error }, { status: session.status });

    const body = await request.json();
    const result = await toggleMeasurementValidity(session, body);

    if (result.error) return Response.json({ error: result.error }, { status: result.status });

    return Response.json(result.data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
