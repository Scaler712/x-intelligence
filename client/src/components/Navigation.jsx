import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ui/ThemeToggle';
import { useState, useEffect, useRef } from 'react';

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  const navItems = [
    { path: '/', label: 'Analyzer' },
    { path: '/batch', label: 'Batch' },
    { path: '/compare', label: 'Compare' },
    { path: '/history', label: 'History' },
    { path: '/settings', label: 'Settings' },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setShowUserMenu(false);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const showNavItems = isAuthenticated();

  return (
    <nav className="topbar" style={{ position: 'sticky' }}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-full">
        <div className="flex items-center gap-2">
          <Link to="/" className="text-xl font-semibold" style={{ color: 'var(--color-text)', transition: 'opacity var(--transition-fast)' }} onMouseEnter={(e) => e.target.style.opacity = '0.8'} onMouseLeave={(e) => e.target.style.opacity = '1'}>
            X Intelligence
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {showNavItems && (
            <div className="tabs">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`tab ${isActive(item.path) ? 'tab--active' : ''}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          {showNavItems && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="user-menu"
                style={{ padding: 'var(--space-2) var(--space-3)' }}
              >
                <span className="user-avatar">
                  {user?.email?.substring(0, 2).toUpperCase() || 'U'}
                </span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showUserMenu && (
                <div className="glass-panel animate-fade-in" style={{ position: 'absolute', right: 0, marginTop: 'var(--space-2)', width: '12rem', zIndex: 'var(--z-dropdown)', overflow: 'hidden' }}>
                  <div style={{ padding: 'var(--space-2)' }}>
                    <div style={{ padding: 'var(--space-3) var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', borderBottom: '1px solid var(--glass-border)', marginBottom: 'var(--space-1)' }}>
                      {user?.email}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="btn-ghost"
                      style={{ width: '100%', textAlign: 'left', padding: 'var(--space-3)', fontSize: 'var(--text-sm)', justifyContent: 'flex-start' }}
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
