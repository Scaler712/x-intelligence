/**
 * API Key management routes
 * Handles storing, retrieving, updating, and deleting user AI API keys
 */
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { supabaseAdmin } = require('../services/supabaseClient');
const encryptionService = require('../services/encryptionService');

const VALID_PROVIDERS = ['openai', 'anthropic'];

/**
 * Get all API keys for current user (masked)
 * GET /api/api-keys
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabaseAdmin
      .from('user_api_keys')
      .select('id, provider, created_at, updated_at')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching API keys:', error);
      return res.status(500).json({ error: 'Failed to fetch API keys' });
    }

    res.json({ apiKeys: data || [] });
  } catch (error) {
    console.error('Get API keys error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Store or update an API key
 * POST /api/api-keys
 * Body: { provider: 'openai' | 'anthropic', apiKey: '...' }
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { provider, apiKey } = req.body;

    if (!provider || !VALID_PROVIDERS.includes(provider)) {
      return res.status(400).json({ 
        error: `Provider must be one of: ${VALID_PROVIDERS.join(', ')}` 
      });
    }

    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      return res.status(400).json({ error: 'API key is required' });
    }

    // Encrypt the API key
    const encryptedKey = encryptionService.encrypt(apiKey.trim());

    // Check if key already exists
    const { data: existing } = await supabaseAdmin
      .from('user_api_keys')
      .select('id')
      .eq('user_id', userId)
      .eq('provider', provider)
      .single();

    let result;
    if (existing) {
      // Update existing key
      const { data, error } = await supabaseAdmin
        .from('user_api_keys')
        .update({
          encrypted_key: encryptedKey,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating API key:', error);
        return res.status(500).json({ error: 'Failed to update API key' });
      }

      result = data;
    } else {
      // Insert new key
      const { data, error } = await supabaseAdmin
        .from('user_api_keys')
        .insert({
          user_id: userId,
          provider: provider,
          encrypted_key: encryptedKey
        })
        .select()
        .single();

      if (error) {
        console.error('Error storing API key:', error);
        return res.status(500).json({ error: 'Failed to store API key' });
      }

      result = data;
    }

    // Return without encrypted key
    const { encrypted_key, ...responseData } = result;
    res.json({ apiKey: responseData });
  } catch (error) {
    console.error('Store API key error:', error);
    if (error.message.includes('ENCRYPTION_KEY')) {
      return res.status(500).json({ error: 'Server configuration error: encryption key not set' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Update an API key
 * PUT /api/api-keys/:id
 * Body: { apiKey: '...' }
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const keyId = req.params.id;
    const { apiKey } = req.body;

    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      return res.status(400).json({ error: 'API key is required' });
    }

    // Verify ownership
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('user_api_keys')
      .select('id, provider')
      .eq('id', keyId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: 'API key not found' });
    }

    // Encrypt the API key
    const encryptedKey = encryptionService.encrypt(apiKey.trim());

    // Update key
    const { data, error } = await supabaseAdmin
      .from('user_api_keys')
      .update({
        encrypted_key: encryptedKey,
        updated_at: new Date().toISOString()
      })
      .eq('id', keyId)
      .select()
      .single();

    if (error) {
      console.error('Error updating API key:', error);
      return res.status(500).json({ error: 'Failed to update API key' });
    }

    const { encrypted_key, ...responseData } = data;
    res.json({ apiKey: responseData });
  } catch (error) {
    console.error('Update API key error:', error);
    if (error.message.includes('ENCRYPTION_KEY')) {
      return res.status(500).json({ error: 'Server configuration error: encryption key not set' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Delete an API key
 * DELETE /api/api-keys/:id
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const keyId = req.params.id;

    // Verify ownership and delete
    const { error } = await supabaseAdmin
      .from('user_api_keys')
      .delete()
      .eq('id', keyId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting API key:', error);
      return res.status(500).json({ error: 'Failed to delete API key' });
    }

    res.json({ message: 'API key deleted successfully' });
  } catch (error) {
    console.error('Delete API key error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Helper function to get decrypted API key (for internal use)
 * This should only be called server-side, never exposed to client
 */
async function getDecryptedApiKey(userId, provider) {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_api_keys')
      .select('encrypted_key')
      .eq('user_id', userId)
      .eq('provider', provider)
      .single();

    if (error || !data) {
      return null;
    }

    return encryptionService.decrypt(data.encrypted_key);
  } catch (error) {
    console.error('Error decrypting API key:', error);
    return null;
  }
}

// Export router as default
module.exports = router;

// Export helper function separately
module.exports.getDecryptedApiKey = getDecryptedApiKey;

