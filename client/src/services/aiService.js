/**
 * AI service for API calls
 */
// Get API URL, ensuring we don't use internal Railway URLs
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  // Don't use internal Railway URLs (browsers can't access them)
  if (envUrl && envUrl.includes('railway.internal')) {
    console.warn('VITE_API_URL contains internal Railway URL. Please use the public Railway URL instead.');
    return '';
  }
  return envUrl || (import.meta.env.DEV ? 'http://localhost:3001' : '');
};

const API_URL = getApiUrl();

/**
 * Get all API keys for current user (masked)
 * @param {string} accessToken - Access token
 * @returns {Promise<Object>} - API keys object
 */
export async function getApiKeys(accessToken) {
  try {
    if (!API_URL || API_URL.includes('railway.internal')) {
      throw new Error('API URL not configured. Please set VITE_API_URL environment variable to your Railway public URL.');
    }

    const url = `${API_URL}/api/api-keys`;
    console.log('Fetching API keys from:', url);

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log('Response status:', response.status, 'Content-Type:', response.headers.get('content-type'));

    if (!response.ok) {
      // Try to parse JSON error, but handle HTML responses
      const contentType = response.headers.get('content-type');
      const text = await response.text();
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || `Failed to fetch AI API keys: ${response.status}`);
        } catch (parseError) {
          throw new Error(`Server returned invalid JSON. Status: ${response.status}, Response: ${text.substring(0, 200)}`);
        }
      } else {
        // HTML response (likely an error page)
        console.error('Server returned HTML instead of JSON:', text.substring(0, 500));
        throw new Error(`Server error (${response.status}). The server returned HTML instead of JSON. This usually means the API endpoint doesn't exist or the URL is incorrect. Check that VITE_API_URL is set to: https://x-intelligence-production.up.railway.app`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error('Get API keys error:', error);
    throw error;
  }
}

/**
 * Save an API key
 * @param {string} accessToken - Access token
 * @param {string} provider - Provider ('openai' or 'anthropic')
 * @param {string} apiKey - API key
 * @returns {Promise<Object>} - Success response
 */
export async function saveApiKey(accessToken, provider, apiKey) {
  try {
    if (!API_URL || API_URL.includes('railway.internal')) {
      throw new Error('API URL not configured. Please set VITE_API_URL environment variable to your Railway public URL.');
    }

    const url = `${API_URL}/api/api-keys`;
    console.log('Saving API key to:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ provider, apiKey }),
    });

    console.log('Response status:', response.status, 'Content-Type:', response.headers.get('content-type'));

    if (!response.ok) {
      // Try to parse JSON error, but handle HTML responses
      const contentType = response.headers.get('content-type');
      const text = await response.text();
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || `Failed to save AI API key: ${response.status}`);
        } catch (parseError) {
          throw new Error(`Server returned invalid JSON. Status: ${response.status}, Response: ${text.substring(0, 200)}`);
        }
      } else {
        // HTML response (likely an error page)
        console.error('Server returned HTML instead of JSON:', text.substring(0, 500));
        throw new Error(`Server error (${response.status}). The server returned HTML instead of JSON. This usually means the API endpoint doesn't exist or the URL is incorrect. Check that VITE_API_URL is set to: https://x-intelligence-production.up.railway.app`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error('Save API key error:', error);
    throw error;
  }
}

/**
 * Delete an API key
 * @param {string} accessToken - Access token
 * @param {string} keyId - API key ID
 * @returns {Promise<Object>} - Success response
 */
export async function deleteApiKey(accessToken, keyId) {
  try {
    const response = await fetch(`${API_URL}/api/api-keys/${keyId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete AI API key');
    }

    return await response.json();
  } catch (error) {
    console.error('Delete API key error:', error);
    throw error;
  }
}

/**
 * Generate AI recommendations
 * @param {string} accessToken - Access token
 * @param {string} scrapeId - Scrape ID
 * @param {string} provider - Provider ('openai' or 'anthropic')
 * @returns {Promise<Object>} - Recommendations
 */
export async function generateRecommendations(accessToken, scrapeId, provider) {
  try {
    const response = await fetch(`${API_URL}/api/ai/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ scrapeId, provider }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate recommendations');
    }

    return data.recommendations;
  } catch (error) {
    console.error('AI recommendations error:', error);
    throw error;
  }
}

/**
 * Get cached AI insights
 * @param {string} accessToken - Access token
 * @param {string} scrapeId - Scrape ID
 * @param {string} provider - Provider (optional)
 * @returns {Promise<Array>} - Insights array
 */
export async function getAIInsights(accessToken, scrapeId, provider) {
  try {
    const url = new URL(`${API_URL}/api/ai/insights/${scrapeId}`);
    if (provider) {
      url.searchParams.append('provider', provider);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch insights');
    }

    return data.insights || [];
  } catch (error) {
    console.error('Get AI insights error:', error);
    throw error;
  }
}

/**
 * Analyze content
 * @param {string} accessToken - Access token
 * @param {Array} tweets - Array of tweets
 * @param {string} provider - Provider ('openai' or 'anthropic')
 * @returns {Promise<Object>} - Analysis results
 */
export async function analyzeContent(accessToken, tweets, provider) {
  try {
    const response = await fetch(`${API_URL}/api/ai/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ tweets, provider }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to analyze content');
    }

    return data.analysis;
  } catch (error) {
    console.error('Content analysis error:', error);
    throw error;
  }
}

/**
 * Generate hook variations
 * @param {string} accessToken - Access token
 * @param {string} tweetContent - Tweet content
 * @param {string} provider - Provider ('openai' or 'anthropic')
 * @returns {Promise<Array>} - Array of hook variations
 */
export async function generateHookVariations(accessToken, tweetContent, provider) {
  try {
    const response = await fetch(`${API_URL}/api/ai/hooks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ tweetContent, provider }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate hooks');
    }

    return data.hooks || [];
  } catch (error) {
    console.error('Hook generation error:', error);
    throw error;
  }
}

// Default export with all methods as an object for convenience
const aiService = {
  getApiKeys,
  saveApiKey,
  deleteApiKey,
  generateRecommendations,
  getAIInsights,
  analyzeContent,
  generateHookVariations,
};

export default aiService;
