import { verifySession } from '@/lib/auth-server';
import { getProfiles, updateProfile, deleteProfile } from '@/services/profilesService';

export async function GET(request) {
  try {
    const session = await verifySession();
    if (session.error) return Response.json({ error: session.error }, { status: session.status });

    const { searchParams } = new URL(request.url);
    const fetchCurrentOnly = searchParams.get('current') === 'true';

    const result = await getProfiles(session, fetchCurrentOnly);
    if (result.error) return Response.json({ error: result.error }, { status: result.status });

    return Response.json(result.data);
  } catch (error) {
    console.error('GET /api/profiles error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = await verifySession();
    if (session.error) return Response.json({ error: session.error }, { status: session.status });

    const body = await request.json();
    const result = await updateProfile(session, body);

    if (result.error) return Response.json({ error: result.error }, { status: result.status });

    return Response.json(result.data);
  } catch (error) {
    console.error('PATCH /api/profiles error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await verifySession();
    if (session.error) return Response.json({ error: session.error }, { status: session.status });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const result = await deleteProfile(session, id);

    if (result.error) return Response.json({ error: result.error }, { status: result.status });

    return Response.json(result.data);
  } catch (error) {
    console.error('DELETE /api/profiles error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
