/**
 * Anthropic (Claude) service implementation
 * Handles interactions with Anthropic API for content recommendations
 */
const Anthropic = require('@anthropic-ai/sdk');
const { X_GROWTH_KNOWLEDGE } = require('./xGrowthKnowledge');

/**
 * Initialize Anthropic client
 * @param {string} apiKey - Anthropic API key
 * @returns {Anthropic} - Anthropic client instance
 */
function createClient(apiKey) {
  if (!apiKey) {
    throw new Error('Anthropic API key is required');
  }

  return new Anthropic({
    apiKey: apiKey
  });
}

/**
 * Generate content recommendations based on scraped tweets
 * @param {Array} tweets - Array of tweet objects
 * @param {Object} analytics - Analytics data
 * @param {string} apiKey - Anthropic API key
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
}

Respond with valid JSON only, no additional text.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const content = message.content[0].text;
    
    // Extract JSON from response (handle cases where there's markdown formatting)
    let jsonContent = content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonContent = jsonMatch[0];
    }

    return JSON.parse(jsonContent);
  } catch (error) {
    console.error('Anthropic API error:', error);
    if (error.status) {
      throw new Error(`Anthropic API error: ${error.status} - ${error.message}`);
    }
    throw new Error(`Failed to generate recommendations: ${error.message}`);
  }
}

/**
 * Generate hook variations for a tweet
 * @param {string} tweetContent - Original tweet content
 * @param {string} apiKey - Anthropic API key
 * @returns {Promise<Array>} - Array of hook variations
 */
async function generateHookVariations(tweetContent, apiKey) {
  try {
    const client = createClient(apiKey);

    const prompt = `Generate 5 compelling hook variations (first 15 words) for this tweet content. Make them attention-grabbing and optimized for engagement.

Original content: "${tweetContent.substring(0, 280)}"

Respond with JSON array of strings:
["hook1", "hook2", "hook3", "hook4", "hook5"]

Respond with valid JSON array only, no additional text.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 500,
      temperature: 0.8,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const content = message.content[0].text;
    
    // Extract JSON array from response
    let jsonContent = content;
    const arrayMatch = content.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      jsonContent = arrayMatch[0];
    }

    const parsed = JSON.parse(jsonContent);
    
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
    console.error('Anthropic hook generation error:', error);
    throw new Error(`Failed to generate hooks: ${error.message}`);
  }
}

/**
 * Analyze content themes and sentiment
 * @param {Array} tweets - Array of tweet objects
 * @param {string} apiKey - Anthropic API key
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

CRITICAL: Analyze these tweets using the X Growth Framework. Your analysis must be ACTIONABLE and SPECIFIC. Do not give generic advice. Reference actual tweets, specific engagement numbers, and provide exact steps they can take TODAY.

Provide a comprehensive, actionable report in structured text format (NOT JSON). Do NOT use markdown formatting like **. Just use plain text with clear structure.

## WHAT CONVERTS THE MOST: HOOK PATTERNS THAT WORK

This is THE MOST IMPORTANT section. Analyze which tweet openings (first 1-2 lines) drive the highest engagement. 

For each high-performing hook pattern found, provide:
1. EXACT hook text from the analyzed tweets (copy it word-for-word)
2. Engagement numbers for that specific tweet (likes, retweets, comments)
3. Which framework hook category it matches (numbered mistakes/contrarian/mechanism/proof/curiosity)
4. Why it stops the scroll (specific psychological trigger from framework)
5. EXACT steps to replicate: "Start your next tweet with: [specific hook structure]"

Example format:
"Top performing hook: '[exact hook text from tweet]'
Engagement: [X] likes, [Y] retweets, [Z] comments
Framework category: Proof-based hook
Why it works: [specific psychological trigger]
Replicate by: Start tweets with '[specific pattern]' followed by [specific structure]"

## DOMINANT THEMES THAT DRIVE ENGAGEMENT

For each theme, provide:
- Theme name
- Why it works (specific framework principle)
- Psychological trigger
- EXACT examples from analyzed tweets with engagement numbers
- How to use this theme: "Post about [specific angle] using [specific hook structure]"

## ENGAGEMENT PATTERNS

HIGH-PERFORMING THEMES:
List themes that drive 2x+ average engagement. For each:
- Theme name
- Average engagement for this theme
- Specific tweet examples with numbers
- EXACT formula: "To replicate: [specific steps]"

LOW-PERFORMING THEMES:
List themes that underperform. For each:
- Theme name
- Why it fails (framework reason)
- What to do instead: [specific alternative]

OPTIMAL CONTENT LENGTH:
Based on actual data: [Short/Medium/Long] performs best.
Evidence: [specific examples with engagement]
Action: Write tweets that are [X] lines long.

BEST PERFORMING FORMAT:
Based on actual data: [Text/Question/Statement/Story/Thread] performs best.
Evidence: [specific examples]
Action: Use [format] for [X]% of your tweets.

## STRATEGIC RECOMMENDATIONS (ACTIONABLE STEPS)

Provide 7-10 SPECIFIC, ACTIONABLE recommendations. Each must include:
- What to do (specific action)
- How to do it (exact steps)
- Why it works (framework principle)
- Example from analyzed tweets
- When to do it (timing/frequency)

Format each recommendation as:
"RECOMMENDATION [number]: [Specific action]
Steps: 1. [exact step] 2. [exact step] 3. [exact step]
Why: [framework principle]
Example: [tweet example with engagement]
Timing: [when/how often]"

## HOOK BANK: READY-TO-USE HOOKS

Provide 15-20 SPECIFIC hooks they can use immediately. Format as:

"[Exact hook text they can copy]
Category: [framework category]
Why it works: [one sentence]
Best for: [content type]
Engagement expected: [based on similar hooks in analysis]"

## POSTING STRATEGY (EXACT PLAN)

Based on engagement patterns:
- Post [X] times daily at [specific times]
- Content mix: [X]% [type], [Y]% [type], [Z]% [type]
- Reply strategy: Reply to [specific account types] with [specific reply structure]
- Long-form posts: Post on [day] at [time] about [topics]

## PROFILE OPTIMIZATION (SPECIFIC CHANGES)

Based on framework:
- Profile picture: [specific recommendation]
- Header: [specific recommendation with example]
- Bio line 1: [specific text suggestion]
- Bio line 2: [specific text suggestion]
- Bio line 3: [specific text suggestion]
- Pinned tweet: [specific recommendation]

## CONTENT GAPS (OPPORTUNITIES)

Identify 5-7 content angles NOT being used but would perform well:
- [Specific angle]: Post about [topic] using [hook structure]. Expected engagement: [estimate]
- [Specific angle]: [details]

## AUDIENCE INSIGHTS (ACTIONABLE)

PRIMARY INTERESTS:
[Specific interests with examples from tweets]

ENGAGEMENT TRIGGERS:
[Specific triggers with examples]

CONTENT PREFERENCES:
[Specific preferences with examples]

Format your response as clean, readable text. Use clear section headers. Use bullet points and numbered lists. Do NOT use markdown ** formatting. Make every recommendation SPECIFIC and ACTIONABLE with exact steps they can take immediately.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 3000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const content = message.content[0].text;
    
    // Return formatted text instead of JSON
    return {
      formattedAnalysis: content,
      rawContent: content
    };
  } catch (error) {
    console.error('Anthropic content analysis error:', error);
    throw new Error(`Failed to analyze content: ${error.message}`);
  }
}

module.exports = {
  generateRecommendations,
  generateHookVariations,
  analyzeContent
};


