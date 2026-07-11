// This router file handles study-related requests, including retrieval, creation, updates, and deletion.
import { verifySession } from '@/lib/auth-server';
import { getStudies, createStudy, updateStudyGoal, deleteStudy } from '@/services/studiesService';

// This function processes GET requests to fetch the list of studies.
export async function GET() {
  try {
    const session = await verifySession();
    if (session.error) return Response.json({ error: session.error }, { status: session.status });

    const result = await getStudies(session);
    if (result.error) return Response.json({ error: result.error }, { status: result.status });

    return Response.json(result.data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// This function handles POST requests to create a new study.
export async function POST(request) {
  try {
    const session = await verifySession();
    if (session.error) return Response.json({ error: session.error }, { status: session.status });

    const body = await request.json();
    const result = await createStudy(session, body);

    if (result.error) return Response.json({ error: result.error }, { status: result.status });

    return Response.json(result.data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// This function manages PATCH requests to update a study's participant goal.
export async function PATCH(request) {
  try {
    const session = await verifySession();
    if (session.error) return Response.json({ error: session.error }, { status: session.status });

    const body = await request.json();
    const result = await updateStudyGoal(session, body);

    if (result.error) return Response.json({ error: result.error }, { status: result.status });

    return Response.json(result.data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// This function handles DELETE requests to remove an existing study.
export async function DELETE(request) {
  try {
    const session = await verifySession();
    if (session.error) return Response.json({ error: session.error }, { status: session.status });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const result = await deleteStudy(session, id);

    if (result.error) return Response.json({ error: result.error }, { status: result.status });

    return Response.json(result.data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
