/**
 * Unified AI service
 * Abstracts over OpenAI and Anthropic providers
 */
const openaiService = require('./ai/openaiService');
const anthropicService = require('./ai/anthropicService');

const VALID_PROVIDERS = {
  openai: openaiService,
  anthropic: anthropicService
};

/**
 * Generate recommendations based on scraped tweets
 * @param {Array} tweets - Array of tweet objects
 * @param {Object} analytics - Analytics data
 * @param {string} provider - Provider name ('openai' or 'anthropic')
 * @param {string} apiKey - Provider API key
 * @returns {Promise<Object>} - Recommendations object
 */
async function generateRecommendations(tweets, analytics, provider, apiKey) {
  if (!VALID_PROVIDERS[provider]) {
    throw new Error(`Invalid provider: ${provider}. Must be one of: ${Object.keys(VALID_PROVIDERS).join(', ')}`);
  }

  if (!apiKey) {
    throw new Error('API key is required');
  }

  const service = VALID_PROVIDERS[provider];
  return await service.generateRecommendations(tweets, analytics, apiKey);
}

/**
 * Generate hook variations for a tweet
 * @param {string} tweetContent - Original tweet content
 * @param {string} provider - Provider name ('openai' or 'anthropic')
 * @param {string} apiKey - Provider API key
 * @returns {Promise<Array>} - Array of hook variations
 */
async function generateHookVariations(tweetContent, provider, apiKey) {
  if (!VALID_PROVIDERS[provider]) {
    throw new Error(`Invalid provider: ${provider}. Must be one of: ${Object.keys(VALID_PROVIDERS).join(', ')}`);
  }

  if (!apiKey) {
    throw new Error('API key is required');
  }

  const service = VALID_PROVIDERS[provider];
  return await service.generateHookVariations(tweetContent, apiKey);
}

/**
 * Analyze content themes and sentiment
 * @param {Array} tweets - Array of tweet objects
 * @param {string} provider - Provider name ('openai' or 'anthropic')
 * @param {string} apiKey - Provider API key
 * @returns {Promise<Object>} - Analysis results
 */
async function analyzeContent(tweets, provider, apiKey) {
  if (!VALID_PROVIDERS[provider]) {
    throw new Error(`Invalid provider: ${provider}. Must be one of: ${Object.keys(VALID_PROVIDERS).join(', ')}`);
  }

  if (!apiKey) {
    throw new Error('API key is required');
  }

  const service = VALID_PROVIDERS[provider];
  return await service.analyzeContent(tweets, apiKey);
}

/**
 * Get strategy suggestions based on analytics
 * @param {Object} analytics - Analytics data
 * @param {string} provider - Provider name ('openai' or 'anthropic')
 * @param {string} apiKey - Provider API key
 * @returns {Promise<Array>} - Array of strategy suggestions
 */
async function getStrategySuggestions(analytics, provider, apiKey) {
  // This is included in generateRecommendations, but can be extracted separately if needed
  const recommendations = await generateRecommendations([], analytics, provider, apiKey);
  return recommendations.strategySuggestions || [];
}

module.exports = {
  generateRecommendations,
  generateHookVariations,
  analyzeContent,
  getStrategySuggestions,
  VALID_PROVIDERS: Object.keys(VALID_PROVIDERS)
};


