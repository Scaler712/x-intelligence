import { Link, useLocation } from 'react-router-dom';
import '../styles/electric.css';
import ThemeToggle from './ui/ThemeToggle';

export default function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Scraper' },
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

  return (
    <nav className="bg-electric-muted border-b border-electric-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Link to="/" className="electric-heading text-xl text-electric-text hover:text-electric-lime transition-colors">
              Twitter <span className="electric-accent">Scraper</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    inline-flex items-center justify-center rounded-lg font-light transition-all duration-200 h-9 px-4 text-sm
                    ${
                      isActive(item.path)
                        ? 'bg-electric-lime text-black electric-glow'
                        : 'text-electric-text hover:bg-electric-dark border border-electric-border'
                    }
                  `}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}

