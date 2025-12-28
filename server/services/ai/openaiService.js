/**
 * OpenAI service implementation
 * Handles interactions with OpenAI API for content recommendations
 */
const OpenAI = require('openai');
const { X_GROWTH_KNOWLEDGE } = require('./xGrowthKnowledge');

/**
 * Initialize OpenAI client
 * @param {string} apiKey - OpenAI API key
 * @returns {OpenAI} - OpenAI client instance
 */
function createClient(apiKey) {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  return new OpenAI({
    apiKey: apiKey
  });
}

/**
 * Generate content recommendations based on scraped tweets
 * @param {Array} tweets - Array of tweet objects
 * @param {Object} analytics - Analytics data
 * @param {string} apiKey - OpenAI API key
 * @returns {Promise<Object>} - Recommendations object
 */
async function generateRecommendations(tweets, analytics, apiKey) {
  try {
    const client = createClient(apiKey);

    // Prepare top performing tweets for analysis
    const topTweets = [...tweets]
      .sort((a, b) => {
        const aEng = (a.likes || 0) + (a.retweets || 0) + (a.comments || 0);
        const bEng = (b.likes || 0) + (b.retweets || 0) + (b.comments || 0);
        return bEng - aEng;
      })
      .slice(0, 20)
      .map(t => ({
        content: t.content.substring(0, 200),
        engagement: (t.likes || 0) + (t.retweets || 0) + (t.comments || 0)
      }));

    const prompt = `You are a social media content strategist analyzing Twitter/X content performance.

Analyze the following top-performing tweets and provide strategic recommendations:

Top Tweets:
${topTweets.map((t, i) => `${i + 1}. "${t.content.substring(0, 150)}..." (${t.engagement} engagement)`).join('\n')}

Analytics Summary:
- Total Tweets: ${analytics.totalTweets || tweets.length}
- Average Engagement: ${Math.round(analytics.avgEngagement || 0)}
- Top Engagement: ${analytics.maxEngagement || 0}

Provide a JSON response with the following structure:
{
  "hookPatterns": ["pattern1", "pattern2", "pattern3"],
  "contentThemes": ["theme1", "theme2", "theme3"],
  "recommendations": [
    {
      "type": "hook_structure" | "posting_time" | "content_type" | "engagement_tactic",
      "title": "Recommendation title",
      "description": "Detailed recommendation",
      "priority": "high" | "medium" | "low"
    }
  ],
  "strategySuggestions": [
    "Strategic suggestion 1",
    "Strategic suggestion 2",
    "Strategic suggestion 3"
  ]
}`;

    const completion = await client.chat.completions.create({
      model: 'gpt-4o', // Use cost-effective model
      messages: [
        {
          role: 'system',
          content: 'You are an expert social media strategist. Always respond with valid JSON only, no additional text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000
    });

    const content = completion.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('OpenAI API error:', error);
    if (error.response) {
      throw new Error(`OpenAI API error: ${error.response.status} - ${error.response.statusText}`);
    }
    throw new Error(`Failed to generate recommendations: ${error.message}`);
  }
}

/**
 * Generate hook variations for a tweet
 * @param {string} tweetContent - Original tweet content
 * @param {string} apiKey - OpenAI API key
 * @returns {Promise<Array>} - Array of hook variations
 */
async function generateHookVariations(tweetContent, apiKey) {
  try {
    const client = createClient(apiKey);

    const prompt = `Generate 5 compelling hook variations (first 15 words) for this tweet content. Make them attention-grabbing and optimized for engagement.

Original content: "${tweetContent.substring(0, 280)}"

Respond with JSON array of strings:
["hook1", "hook2", "hook3", "hook4", "hook5"]`;

    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a copywriting expert. Always respond with valid JSON array only, no additional text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
      max_tokens: 500
    });

    const content = completion.choices[0].message.content;
    const parsed = JSON.parse(content);
    
    // Handle different response formats
    if (Array.isArray(parsed)) {
      return parsed;
    } else if (parsed.hooks && Array.isArray(parsed.hooks)) {
      return parsed.hooks;
    } else if (parsed.variations && Array.isArray(parsed.variations)) {
      return parsed.variations;
    } else {
      // Fallback: extract array from object values
      return Object.values(parsed).filter(v => typeof v === 'string').slice(0, 5);
    }
  } catch (error) {
    console.error('OpenAI hook generation error:', error);
    throw new Error(`Failed to generate hooks: ${error.message}`);
  }
}

/**
 * Analyze content themes and sentiment
 * @param {Array} tweets - Array of tweet objects
 * @param {string} apiKey - OpenAI API key
 * @returns {Promise<Object>} - Analysis results
 */
async function analyzeContent(tweets, apiKey) {
  try {
    const client = createClient(apiKey);

    // Include more tweets and engagement data for better analysis
    const sampleTweets = tweets.slice(0, 100).map(t => {
      const engagement = (t.likes || 0) + (t.retweets || 0) + (t.comments || 0);
      return `[${engagement} engagement] ${t.content.substring(0, 300)}`;
    }).join('\n\n');

    const totalTweets = tweets.length;
    const avgEngagement = tweets.reduce((sum, t) => {
      return sum + (t.likes || 0) + (t.retweets || 0) + (t.comments || 0);
    }, 0) / totalTweets;

    const prompt = `You are an expert X/Twitter growth strategist analyzing content performance. You have deep knowledge of X growth frameworks including hook patterns, engagement strategies, and conversion systems.

${X_GROWTH_KNOWLEDGE}

Context:
- Total tweets analyzed: ${totalTweets}
- Average engagement per tweet: ${Math.round(avgEngagement)}

Tweets with engagement metrics:
${sampleTweets}

Analyze these tweets using the X Growth Framework knowledge above. Provide a comprehensive, actionable report in structured text format (NOT JSON). Focus especially on:

## CONTENT ANALYSIS REPORT

### DOMINANT THEMES
List the 5-7 main themes that appear most frequently. For each theme, explain WHY it works for this audience based on the X Growth Framework principles and what psychological trigger it hits.

### SENTIMENT ANALYSIS
Overall sentiment (positive/neutral/mixed/negative) and what this tells you about the audience's mindset.

### CONTENT CATEGORIES
What types of content dominate (educational, proof-based, contrarian, etc.) and why these categories resonate based on the framework.

### KEY TOPICS
The 5-7 topics that drive the most engagement, with specific examples from the tweets analyzed.

### WHAT CONVERTS THE MOST: HOOK PATTERNS THAT WORK

This is the MOST IMPORTANT section. Analyze which tweet openings (first 1-2 lines) drive the highest engagement. Reference the 5 hook categories from the framework:
- Numbered mistakes
- Contrarian takes
- Mechanism reveal
- Proof-based
- Curiosity gaps

For each pattern found, provide:
1. The exact hook structure that works (match it to framework categories)
2. Why it stops the scroll (psychological trigger from framework)
3. Specific examples from the analyzed tweets with engagement numbers
4. How to replicate this pattern using framework principles

### ENGAGEMENT PATTERNS

HIGH-PERFORMING THEMES:
List themes that consistently drive 2x+ average engagement. Explain what makes them work.

LOW-PERFORMING THEMES:
List themes that underperform. Explain why they don't resonate.

OPTIMAL CONTENT LENGTH:
Short (1-2 lines), Medium (3-5 lines), or Long (6+ lines) - and why.

BEST PERFORMING FORMAT:
Text, question, statement, story, or thread - with examples.

### STRATEGIC RECOMMENDATIONS

Provide 5-7 actionable recommendations based on the X Growth Framework and what actually works in these tweets. Each recommendation should:
- Reference specific framework principles (reply-guy strategy, hook categories, DM system, etc.)
- Be specific and actionable
- Include examples of high-performing tweets
- Explain the mechanism (why it works based on framework)

### CONTENT GAPS & OPPORTUNITIES

Identify 3-5 content angles or topics that are NOT being covered but would likely perform well based on:
- Audience interests
- Engagement patterns
- Successful themes in similar niches

### AUDIENCE INSIGHTS

PRIMARY INTERESTS:
What this audience cares about most (be specific).

ENGAGEMENT TRIGGERS:
What makes them stop scrolling, like, comment, or share. Be specific about psychological triggers.

CONTENT PREFERENCES:
Preferred formats, styles, and structures based on what performs.

### HOOK BANK SUGGESTIONS

Based on the analysis and framework, suggest 10-15 specific hook variations they should test, formatted as:
1. [Hook text following framework categories]
   Why it works: [explanation using framework principles]
   Best for: [content type]
   Framework category: [numbered mistakes/contrarian/mechanism/proof/curiosity]

### POSTING STRATEGY RECOMMENDATIONS

Based on engagement patterns and framework:
- Optimal posting frequency (framework recommends 3-5x daily)
- Best content mix (60% educational, 30% engagement, 10% promotional)
- Reply strategy suggestions (reply-guy framework)
- Long-form post opportunities (weekly on Sunday per framework)

### PROFILE OPTIMIZATION SUGGESTIONS

Based on framework profile optimization elements, suggest improvements:
- Profile picture strategy
- Header image optimization
- Bio improvements (3-line structure)
- Pinned tweet recommendations
- Recent tweets quality check

Format your response as clean, readable text with clear section headers. Use bullet points and numbered lists for readability. Do NOT use JSON format. Make it actionable and specific, always referencing the X Growth Framework principles.`;

    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert X/Twitter growth strategist. Provide comprehensive, actionable analysis in structured text format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3000
    });

    const content = completion.choices[0].message.content;
    
    // Return formatted text instead of JSON
    return {
      formattedAnalysis: content,
      rawContent: content
    };
  } catch (error) {
    console.error('OpenAI content analysis error:', error);
    throw new Error(`Failed to analyze content: ${error.message}`);
  }
}

module.exports = {
  generateRecommendations,
  generateHookVariations,
  analyzeContent
};


