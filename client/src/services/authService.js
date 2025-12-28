/**
 * Auth service for API calls
 * Handles authentication with the backend API
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Register a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - User and session data
 */
export async function register(email, password) {
  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - User and session data
 */
export async function login(email, password) {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Logout user
 * @param {string} accessToken - Access token
 * @returns {Promise<void>}
 */
export async function logout(accessToken) {
  try {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (error) {
    console.error('Logout error:', error);
    // Don't throw - logout should always succeed client-side
  }
}

/**
 * Get current user
 * @param {string} accessToken - Access token
 * @returns {Promise<Object>} - User data
 */
export async function getCurrentUser(accessToken) {
  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get user');
    }

    return data.user;
  } catch (error) {
    console.error('Get user error:', error);
    throw error;
  }
}

/**
 * Refresh session
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>} - New session data
 */
export async function refreshSession(refreshToken) {
  try {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to refresh session');
    }

    return data.session;
  } catch (error) {
    console.error('Refresh error:', error);
    throw error;
  }
}


