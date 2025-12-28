import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DashboardIcon, BatchIcon, CompareIcon, HistoryIcon, SettingsIcon } from './ui/Icons';
import Logo from './ui/Logo';

const navItems = [
  { path: '/', label: 'Dashboard', icon: DashboardIcon },
  { path: '/batch', label: 'Batch', icon: BatchIcon },
  { path: '/compare', label: 'Compare', icon: CompareIcon },
  { path: '/history', label: 'History', icon: HistoryIcon },
  { path: '/settings', label: 'Settings', icon: SettingsIcon },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const userInitials = user?.email?.substring(0, 2).toUpperCase() || 'U';
  const workspaceName = (user?.email?.split('@')[0] || 'User') + "'s Workspace";

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-[260px]'} border-r border-border-subtle bg-bg-primary h-full overflow-y-auto flex flex-col transition-all duration-200`}>
      {/* Workspace Header with Logo */}
      <div className="h-16 px-4 flex items-center gap-3 border-b border-border-subtle flex-shrink-0">
        {!isCollapsed ? (
          <>
            <Logo size="small" />
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="ml-auto w-8 h-8 flex items-center justify-center hover:bg-bg-hover rounded-md transition-colors"
            >
              <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-8 h-8 flex items-center justify-center hover:bg-bg-hover rounded-md transition-colors"
          >
            <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.label : ''}
              className={`
                flex w-full items-center gap-3 px-3 py-2.5 text-sm rounded-md 
                transition-all duration-150
                ${active 
                  ? 'bg-bg-nav-active text-text-primary' 
                  : 'text-text-muted hover:bg-bg-hover hover:text-text-primary'
                }
              `}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-blue-primary' : ''}`} />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Sign Out Section */}
      {!isCollapsed && (
        <div className="px-3 py-4 border-t border-border-subtle flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2.5 text-sm text-text-muted hover:bg-bg-hover hover:text-text-primary rounded-md transition-all duration-150 font-medium"
          >
            Sign Out
          </button>
        </div>
      )}
    </aside>
  );
}
