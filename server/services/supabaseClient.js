/**
 * Supabase client initialization
 * Creates both admin (service role) and user (anon key) clients
 */
const { createClient } = require('@supabase/supabase-js');
const config = require('../config');

// Admin client (for server-side operations with service role key)
const supabaseAdmin = createClient(
  config.SUPABASE_URL,
  config.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Create user client from access token (for client-side operations)
function createUserClient(accessToken) {
  return createClient(
    config.SUPABASE_URL,
    config.SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  );
}

module.exports = {
  supabaseAdmin,
  createUserClient
};


