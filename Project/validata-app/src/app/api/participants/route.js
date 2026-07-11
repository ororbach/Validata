// This router file handles requests related to study participants.
import { verifySession } from '@/lib/auth-server';
import { getParticipants, addParticipant, updateParticipantStatus } from '@/services/participantsService';

// This function processes GET requests to fetch the list of participants.
export async function GET(request) {
  try {
    const session = await verifySession();
    if (session.error) {
      return Response.json({ error: session.error }, { status: session.status });
    }

    const { searchParams } = new URL(request.url);
    const studyId = searchParams.get('study_id');

    const result = await getParticipants(session, studyId);
    if (result.error) {
      return Response.json({ error: result.error }, { status: result.status });
    }

    return Response.json(result.data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// This function handles POST requests to add a new participant to a study.
export async function POST(request) {
  try {
    const session = await verifySession();
    if (session.error) {
      return Response.json({ error: session.error }, { status: session.status });
    }

    const body = await request.json();
    const result = await addParticipant(session, body);

    if (result.error) {
      return Response.json({ error: result.error }, { status: result.status });
    }

    return Response.json(result.data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// This function manages PATCH requests to update a participant's status.
export async function PATCH(request) {
  try {
    const session = await verifySession();
    if (session.error) {
      return Response.json({ error: session.error }, { status: session.status });
    }

    const body = await request.json();
    const result = await updateParticipantStatus(session, body);

    if (result.error) {
      return Response.json({ error: result.error }, { status: result.status });
    }

    return Response.json(result.data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
