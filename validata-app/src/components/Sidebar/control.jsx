// This component manages the state and logic for the application's sidebar navigation.
import { useState, useEffect } from 'react';
import SidebarDisplay from './display';
import { getNavItems } from './service';

// Renders the sidebar based on the current user's role and navigational state.
const SidebarControl = ({
  currentView,
  onNavigate,
  userRole,
  currentUserEmail,
  onLogout,
  studies = [],
  currentStudyId,
  onSwitchStudy
}) => {
  // Managing view
  const navItems = getNavItems(userRole);
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window === 'undefined') return true;

    const saved = window.localStorage.getItem('validata-sidebar-expanded');
    return saved === null ? true : saved === 'true';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('validata-sidebar-expanded', String(isExpanded));
    }
  }, [isExpanded]);

  // Toggles the visual expansion state of the sidebar.
  const handleToggleExpanded = () => {
    // Toggling state
    setIsExpanded((prev) => !prev);
  };

  return (
    <SidebarDisplay
      currentView={currentView}
      onNavigate={onNavigate}
      navItems={navItems}
      userRole={userRole}
      currentUserEmail={currentUserEmail}
      onLogout={onLogout}
      isExpanded={isExpanded}
      onToggleExpanded={handleToggleExpanded}
      studies={studies}
      currentStudyId={currentStudyId}
      onSwitchStudy={onSwitchStudy}
    />
  );
};

export default SidebarControl;
