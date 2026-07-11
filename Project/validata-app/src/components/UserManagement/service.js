// This service handles API calls related to user management.

// Fetches the list of all users from the server.
export const fetchUsersAPI = async () => {
  const res = await fetch('/api/profiles');
  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error || 'Failed to fetch users');
  }
  return res.json();
};

// Updates the role of a user on the server.
export const updateRoleAPI = async (userId, newRole) => {
  const res = await fetch('/api/profiles', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: userId, role: newRole })
  });

  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error || 'Failed to update role');
  }
  return res.json();
};

// Updates the status of a user on the server.
export const updateStatusAPI = async (userId, newStatus) => {
  const res = await fetch('/api/profiles', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: userId, status: newStatus })
  });

  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error || 'Failed to update status');
  }
  return res.json();
};

// Deletes a user profile from the server.
export const deleteUserAPI = async (userId) => {
  const res = await fetch(`/api/profiles?id=${userId}`, {
    method: 'DELETE'
  });

  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error || 'Failed to delete user');
  }
  return res.json();
};
