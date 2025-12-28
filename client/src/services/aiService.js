/**
 * AI service for API calls
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Get all API keys for current user (masked)
 * @param {string} accessToken - Access token
 * @returns {Promise<Object>} - API keys object
 */
export async function getApiKeys(accessToken) {
  try {
    const response = await fetch(`${API_URL}/api/api-keys`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch AI API keys');
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
    const response = await fetch(`${API_URL}/api/api-keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ provider, apiKey }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save AI API key');
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
