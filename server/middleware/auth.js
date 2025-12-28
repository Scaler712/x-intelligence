/**
 * Authentication middleware
 * Validates JWT tokens from Supabase and extracts user information
 */
const { supabaseAdmin } = require('../services/supabaseClient');

/**
 * Middleware to authenticate requests using Supabase JWT
 * Expects Authorization header with "Bearer <token>"
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    
    // Verify token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach user to request object
    req.user = {
      id: user.id,
      email: user.email
    };
    
    // Attach token for use in Supabase client creation
    req.accessToken = token;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

/**
 * Optional authentication - doesn't fail if no token
 * Useful for routes that work with or without auth
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      
      if (!error && user) {
        req.user = {
          id: user.id,
          email: user.email
        };
        req.accessToken = token;
      }
    }
    
    next();
  } catch (error) {
    // Continue without auth if there's an error
    next();
  }
}

module.exports = {
  authenticate,
  optionalAuth
};


