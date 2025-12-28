/**
 * AI routes
 * Handles AI-powered recommendations and insights
 */
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { supabaseAdmin } = require('../services/supabaseClient');
const aiService = require('../services/aiService');
const apiKeysModule = require('./apiKeys');
const getDecryptedApiKey = apiKeysModule.getDecryptedApiKey || (() => null);

/**
 * Generate AI recommendations for a scrape
 * POST /api/ai/recommendations
 * Body: { scrapeId, provider: 'openai' | 'anthropic' }
 */
router.post('/recommendations', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { scrapeId, provider } = req.body;

    if (!scrapeId) {
      return res.status(400).json({ error: 'scrapeId is required' });
    }

    if (!provider || !aiService.VALID_PROVIDERS.includes(provider)) {
      return res.status(400).json({ 
        error: `provider must be one of: ${aiService.VALID_PROVIDERS.join(', ')}` 
      });
    }

    // Get user's API key for the provider
    const apiKey = await getDecryptedApiKey(userId, provider);
    if (!apiKey) {
      return res.status(400).json({ 
        error: `No API key configured for ${provider}. Please add your API key in Settings.` 
      });
    }

    // Load scrape and tweets from database
    const { data: scrape, error: scrapeError } = await supabaseAdmin
      .from('scrapes')
      .select('id, stats')
      .eq('id', scrapeId)
      .eq('user_id', userId)
      .single();

    if (scrapeError || !scrape) {
      return res.status(404).json({ error: 'Scrape not found' });
    }

    const { data: tweets, error: tweetsError } = await supabaseAdmin
      .from('tweets')
      .select('content, likes, retweets, comments, date')
      .eq('scrape_id', scrapeId)
      .order('date', { ascending: false });

    if (tweetsError) {
      console.error('Error fetching tweets:', tweetsError);
      return res.status(500).json({ error: 'Failed to fetch tweets' });
    }

    if (!tweets || tweets.length === 0) {
      return res.status(400).json({ error: 'No tweets found for this scrape' });
    }

    // Deduplicate tweets by content + date (keep highest engagement)
    const uniqueTweets = new Map();
    tweets.forEach(tweet => {
      const key = `${tweet.content}|${tweet.date || ''}`;
      if (!uniqueTweets.has(key)) {
        uniqueTweets.set(key, tweet);
      } else {
        const existing = uniqueTweets.get(key);
        const existingEng = (existing.likes || 0) + (existing.retweets || 0) + (existing.comments || 0);
        const newEng = (tweet.likes || 0) + (tweet.retweets || 0) + (tweet.comments || 0);
        if (newEng > existingEng) {
          uniqueTweets.set(key, tweet);
        }
      }
    });
    const deduplicatedTweets = Array.from(uniqueTweets.values());

    // Calculate analytics if not present
    let analytics = scrape.stats || {};
    if (!analytics.totalTweets) {
      const totalEngagement = deduplicatedTweets.reduce((sum, t) => 
        sum + (t.likes || 0) + (t.retweets || 0) + (t.comments || 0), 0
      );
      analytics = {
        totalTweets: deduplicatedTweets.length,
        totalLikes: deduplicatedTweets.reduce((sum, t) => sum + (t.likes || 0), 0),
        totalRetweets: deduplicatedTweets.reduce((sum, t) => sum + (t.retweets || 0), 0),
        totalComments: deduplicatedTweets.reduce((sum, t) => sum + (t.comments || 0), 0),
        totalEngagement: totalEngagement,
        avgEngagement: Math.round(totalEngagement / deduplicatedTweets.length),
        maxEngagement: Math.max(...deduplicatedTweets.map(t => 
          (t.likes || 0) + (t.retweets || 0) + (t.comments || 0)
        ))
      };
    }

    // Generate recommendations
    const recommendations = await aiService.generateRecommendations(
      deduplicatedTweets,
      analytics,
      provider,
      apiKey
    );

    // Cache insights in database
    const { error: cacheError } = await supabaseAdmin
      .from('ai_insights')
      .upsert({
        scrape_id: scrapeId,
        provider: provider,
        insights: recommendations,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'scrape_id,provider'
      });

    if (cacheError) {
      console.error('Error caching insights:', cacheError);
      // Don't fail the request if caching fails
    }

    res.json({ recommendations });
  } catch (error) {
    console.error('AI recommendations error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate recommendations' });
  }
});

/**
 * Get cached AI insights
 * GET /api/ai/insights/:scrapeId
 * Query: ?provider=openai|anthropic
 */
router.get('/insights/:scrapeId', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { scrapeId } = req.params;
    const { provider } = req.query;

    // Verify scrape ownership
    const { data: scrape, error: scrapeError } = await supabaseAdmin
      .from('scrapes')
      .select('id')
      .eq('id', scrapeId)
      .eq('user_id', userId)
      .single();

    if (scrapeError || !scrape) {
      return res.status(404).json({ error: 'Scrape not found' });
    }

    // Build query
    let query = supabaseAdmin
      .from('ai_insights')
      .select('provider, insights, created_at, updated_at')
      .eq('scrape_id', scrapeId);

    if (provider) {
      query = query.eq('provider', provider);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching insights:', error);
      return res.status(500).json({ error: 'Failed to fetch insights' });
    }

    res.json({ insights: data || [] });
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Analyze content
 * POST /api/ai/analyze
 * Body: { tweets: [...], provider: 'openai' | 'anthropic' }
 */
router.post('/analyze', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { tweets, provider } = req.body;

    if (!tweets || !Array.isArray(tweets)) {
      return res.status(400).json({ error: 'tweets array is required' });
    }

    if (!provider || !aiService.VALID_PROVIDERS.includes(provider)) {
      return res.status(400).json({ 
        error: `provider must be one of: ${aiService.VALID_PROVIDERS.join(', ')}` 
      });
    }

    // Get user's API key
    const apiKey = await getDecryptedApiKey(userId, provider);
    if (!apiKey) {
      return res.status(400).json({ 
        error: `No API key configured for ${provider}. Please add your API key in Settings.` 
      });
    }

    // Analyze content
    const analysis = await aiService.analyzeContent(tweets, provider, apiKey);

    res.json({ analysis });
  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze content' });
  }
});

/**
 * Generate hook variations
 * POST /api/ai/hooks
 * Body: { tweetContent, provider: 'openai' | 'anthropic' }
 */
router.post('/hooks', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { tweetContent, provider } = req.body;

    if (!tweetContent) {
      return res.status(400).json({ error: 'tweetContent is required' });
    }

    if (!provider || !aiService.VALID_PROVIDERS.includes(provider)) {
      return res.status(400).json({ 
        error: `provider must be one of: ${aiService.VALID_PROVIDERS.join(', ')}` 
      });
    }

    // Get user's API key
    const apiKey = await getDecryptedApiKey(userId, provider);
    if (!apiKey) {
      return res.status(400).json({ 
        error: `No API key configured for ${provider}. Please add your API key in Settings.` 
      });
    }

    // Generate hook variations
    const hooks = await aiService.generateHookVariations(tweetContent, provider, apiKey);

    res.json({ hooks });
  } catch (error) {
    console.error('AI hook generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate hooks' });
  }
});

module.exports = router;

