// This service defines and provides the navigation items available in the application sidebar.
import { Users, Eye, ClipboardList, BarChart2, ShieldAlert, Table2 } from 'lucide-react';

// Retrieves the list of navigation items based on the specified user role.
export const getNavItems = (userRole) => {
  // Defining items
  const items = [
    { id: 'participants', label: 'Participant Management', icon: Users },
    { id: 'participantsView', label: 'Participants View', icon: Eye },
    { id: 'data', label: 'Data Collection', icon: ClipboardList },
    { id: 'results', label: 'Results', icon: Table2 },
  ];

  if (userRole === 'mentor') {
    items.push({ id: 'analysis', label: 'View & Analysis', icon: BarChart2 });
    items.push({ id: 'userManagement', label: 'User Access Control', icon: ShieldAlert });
  }

  return items;
};