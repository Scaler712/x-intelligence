import { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');
  const [isLoading, setIsLoading] = useState(true);

  // Load theme from localStorage on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = localStorage.getItem('theme');
        if (saved && (saved === 'dark' || saved === 'light')) {
          setTheme(saved);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
      setIsLoading(false);
    };

    loadTheme();
  }, []);

  // Apply theme to document root and save to localStorage
  useEffect(() => {
    if (!isLoading) {
      const root = document.documentElement;
      root.setAttribute('data-theme', theme);
      root.classList.remove('no-transition');
      localStorage.setItem('theme', theme);
      
      // Force a reflow to ensure CSS variables update
      void root.offsetHeight;
    } else {
      // Prevent flash of wrong theme on initial load
      document.documentElement.classList.add('no-transition');
    }
  }, [theme, isLoading]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
