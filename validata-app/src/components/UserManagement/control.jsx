import React, { useState, useEffect } from 'react';
import UserManagementDisplay from './display';
import { fetchUsersAPI, updateRoleAPI, updateStatusAPI, deleteUserAPI } from './service';

// This component controls the logic for managing system users.
const UserManagementControl = ({ currentUserEmail }) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetches the list of users from the server.
  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Fetch users
      const data = await fetchUsersAPI();
      setUsers(data);
    } catch (err) {
      console.error('Fetch users error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Changes the role of a specific user.
  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateRoleAPI(userId, newRole);
      setUsers(prevUsers =>
        prevUsers.map(user => (user.id === userId ? { ...user, role: newRole } : user))
      );
    } catch (err) {
      alert('Error updating user role: ' + err.message);
    }
  };

  // Changes the status of a specific user.
  const handleStatusChange = async (userId, newStatus) => {
    try {
      await updateStatusAPI(userId, newStatus);
      setUsers(prevUsers =>
        prevUsers.map(user => (user.id === userId ? { ...user, status: newStatus } : user))
      );
    } catch (err) {
      alert('Error updating user status: ' + err.message);
    }
  };

  // Deletes a user profile from the system.
  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user profile? The user will lose access to this portal.')) {
      return;
    }

    try {
      // Delete user
      await deleteUserAPI(userId);
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    } catch (err) {
      alert('Error deleting user: ' + err.message);
    }
  };

  return (
    <UserManagementDisplay
      users={users}
      isLoading={isLoading}
      error={error}
      currentUserEmail={currentUserEmail}
      onRoleChange={handleRoleChange}
      onStatusChange={handleStatusChange}
      onDelete={handleDelete}
      onRefresh={fetchUsers}
    />
  );
};

export default UserManagementControl;
