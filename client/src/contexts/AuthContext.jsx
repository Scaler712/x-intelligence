/**
 * Authentication Context
 * Manages user authentication state and provides auth methods
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Register new user
  const register = useCallback(async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        setSession(data.session);
        setUser(data.user);
      }

      return { user: data.user, session: data.session, error: null };
    } catch (error) {
      console.error('Registration error:', error);
      return { user: null, session: null, error: error.message };
    }
  }, []);

  // Login
  const login = useCallback(async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setSession(data.session);
      setUser(data.user);

      return { user: data.user, session: data.session, error: null };
    } catch (error) {
      console.error('Login error:', error);
      return { user: null, session: null, error: error.message };
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setSession(null);
      setUser(null);
      return { error: null };
    } catch (error) {
      console.error('Logout error:', error);
      return { error: error.message };
    }
  }, []);

  // Get access token for API calls
  const getAccessToken = useCallback(() => {
    return session?.access_token || null;
  }, [session]);

  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    return !!user && !!session;
  }, [user, session]);

  const value = {
    user,
    session,
    loading,
    register,
    login,
    logout,
    getAccessToken,
    isAuthenticated,
    supabase, // Expose supabase client if needed
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


