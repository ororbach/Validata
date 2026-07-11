// This component renders the visual interface of the navigation sidebar.
import { LogOut, Sun, Moon, ChevronLeft, ChevronRight, FlaskConical } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

// Accepts the sidebar state properties and renders the navigation elements accordingly.
const SidebarDisplay = ({
  currentView,
  onNavigate,
  navItems,
  userRole,
  currentUserEmail,
  onLogout,
  isExpanded,
  onToggleExpanded,
  studies,
  currentStudyId,
  onSwitchStudy
}) => {
  // Determine UI states based on props
  const { theme, toggleTheme } = useTheme();
  const initial = currentUserEmail ? currentUserEmail.charAt(0).toUpperCase() : 'U';
  const roleName = userRole === 'mentor' ? 'Project Mentor' : 'Team Member';
  const showLabels = isExpanded;
  const isStudyManagementActive = currentView === 'studyManagement';

  return (
    <>
    {/* Desktop Sidebar */}
    <aside
      className={`hidden md:flex md:flex-col ${isExpanded ? 'w-64' : 'w-16'} bg-slate-900 text-slate-100 shadow-xl relative shrink-0 transition-[width] duration-200`}
    >
        {/* Sidebar Header: Logo and Toggle */}
        <div className={`p-3 border-b border-slate-700 flex items-center gap-2 ${showLabels ? 'flex-row justify-between' : 'flex-col'}`}>
          <div className={`flex items-center gap-3 overflow-hidden ${showLabels ? '' : 'flex-col'}`}>
            <img src="/favicon.png" alt="Validata Logo" className="w-8 h-8 object-contain drop-shadow-md shrink-0" />
            <h1 className={`text-2xl font-bold tracking-wide whitespace-nowrap ${showLabels ? 'inline' : 'hidden'}`}>Validata</h1>
          </div>
          <button
            onClick={onToggleExpanded}
            title={isExpanded ? 'Collapse navigation' : 'Expand navigation'}
            aria-expanded={isExpanded}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            {isExpanded ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        {/* Study Switcher Section */}
        <div className={`p-3 border-b border-slate-700 ${showLabels ? '' : 'flex flex-col items-center'}`}>
          {showLabels ? (
            <>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                <FlaskConical className="w-3.5 h-3.5" /> Study
              </label>
              <select
                value={currentStudyId || ''}
                onChange={(e) => onSwitchStudy(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
              >
                {studies.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </>
          ) : (
            <button
              title="Expand to switch study"
              onClick={onToggleExpanded}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <FlaskConical className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Main Navigation Links */}
        <nav className="flex-1 p-2 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
               <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                title={item.label}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left cursor-pointer ${showLabels ? '' : 'justify-center'} ${isActive
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-slate-800 text-slate-100'
                  }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className={`whitespace-nowrap ${showLabels ? 'inline' : 'hidden'}`}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Mentor Specific Navigation */}
        {userRole === 'mentor' && (
          <div className="p-2 border-t border-slate-800">
            <button
              onClick={() => onNavigate('studyManagement')}
              title="Studies Management"
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left cursor-pointer ${showLabels ? '' : 'justify-center'} ${isStudyManagementActive
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-slate-800 text-slate-100'
                }`}
            >
              <FlaskConical className="w-5 h-5 shrink-0" />
              <span className={`whitespace-nowrap ${showLabels ? 'inline' : 'hidden'}`}>Studies Management</span>
            </button>
          </div>
        )}

        {/* User Profile and Actions Footer */}
        <div className={`p-2 bg-slate-950 text-sm flex items-center gap-2 border-t border-slate-800 ${showLabels ? 'justify-between' : 'flex-col'}`}>
          <div className={`flex items-center gap-3 overflow-hidden ${showLabels ? '' : 'justify-center'}`}>
            <div className="w-10 h-10 shrink-0 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors flex items-center justify-center text-slate-300 font-bold">
              {initial}
            </div>
            <div className={`overflow-hidden ${showLabels ? 'block' : 'hidden'}`}>
              <p className="font-bold text-slate-200 truncate" title={currentUserEmail || 'User'}>
                {currentUserEmail || 'User'}
              </p>
              <p className="text-xs text-slate-400 truncate">{roleName}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 text-slate-400 hover:text-amber-300 hover:bg-slate-900 rounded-lg transition-all cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={onLogout}
              title="Log Out"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
    </aside>

    {/* Mobile Top Header */}
    <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-slate-900 text-slate-100 border-b border-slate-700 flex items-center justify-between gap-2 px-3 py-2">
      <div className="flex items-center gap-2 min-w-0">
        <img src="/favicon.png" alt="Validata Logo" className="w-6 h-6 object-contain shrink-0" />
        <span className="font-bold tracking-wide shrink-0">Validata</span>
      </div>
      <div className="flex items-center gap-1.5 min-w-0">
        <select
          value={currentStudyId || ''}
          onChange={(e) => onSwitchStudy(e.target.value)}
          title="Switch study"
          className="max-w-[8rem] bg-slate-800 border border-slate-700 rounded-lg py-1.5 pl-2 pr-1 text-xs text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer truncate"
        >
          {studies.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        {userRole === 'mentor' && (
          <button
            onClick={() => onNavigate('studyManagement')}
            title="Studies Management"
            className={`p-2 rounded-lg transition-all cursor-pointer ${isStudyManagementActive ? 'text-blue-400 bg-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <FlaskConical className="h-5 w-5" />
          </button>
        )}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <button
          onClick={onLogout}
          title="Log Out"
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </div>

    {/* Mobile Bottom Navigation */}
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-900 text-slate-100 border-t border-slate-700 flex items-stretch pb-[env(safe-area-inset-bottom)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            title={item.label}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 cursor-pointer ${isActive ? 'text-blue-400' : 'text-slate-400'}`}
          >
            <Icon className="w-5 h-5" />
          </button>
        );
      })}
    </nav>
    </>
  );
};

export default SidebarDisplay;
