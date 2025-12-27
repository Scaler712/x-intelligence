/**
 * Content analysis utilities (CTA detection, tweet length, mentions, etc.)
 */

import { getTotalEngagement } from './analytics';

/**
 * CTA patterns to detect
 */
const CTA_PATTERNS = [
  { pattern: /click here/i, label: 'Click here' },
  { pattern: /learn more/i, label: 'Learn more' },
  { pattern: /check out/i, label: 'Check out' },
  { pattern: /sign up/i, label: 'Sign up' },
  { pattern: /join (us|now|today)/i, label: 'Join' },
  { pattern: /buy now/i, label: 'Buy now' },
  { pattern: /get (it|yours|started)/i, label: 'Get' },
  { pattern: /download/i, label: 'Download' },
  { pattern: /try (it|now|today)/i, label: 'Try' },
  { pattern: /subscribe/i, label: 'Subscribe' },
  { pattern: /follow (me|us)/i, label: 'Follow' },
  { pattern: /reply with/i, label: 'Reply with' },
  { pattern: /comment below/i, label: 'Comment' },
  { pattern: /share (this|if)/i, label: 'Share' },
  { pattern: /retweet/i, label: 'Retweet' }
];

/**
 * Detect CTAs in tweets
 * @param {Array} tweets - Array of tweets
 * @returns {Object} - CTA analysis data
 */
export function detectCTAs(tweets) {
  const ctaMap = new Map();
  let tweetsWithCTA = 0;
  let tweetsWithoutCTA = 0;
  let totalCTAEngagement = 0;
  let totalNoCTAEngagement = 0;

  tweets.forEach(tweet => {
    let hasCTA = false;
    const engagement = getTotalEngagement(tweet);

    CTA_PATTERNS.forEach(({ pattern, label }) => {
      if (pattern.test(tweet.content)) {
        hasCTA = true;

        if (ctaMap.has(label)) {
          const existing = ctaMap.get(label);
          existing.count++;
          existing.totalEngagement += engagement;
          existing.avgEngagement = Math.round(existing.totalEngagement / existing.count);
        } else {
          ctaMap.set(label, {
            cta: label,
            count: 1,
            totalEngagement: engagement,
            avgEngagement: engagement
          });
        }
      }
    });

    if (hasCTA) {
      tweetsWithCTA++;
      totalCTAEngagement += engagement;
    } else {
      tweetsWithoutCTA++;
      totalNoCTAEngagement += engagement;
    }
  });

  const topCTAs = Array.from(ctaMap.values())
    .sort((a, b) => b.totalEngagement - a.totalEngagement)
    .slice(0, 10);

  const avgWithCTA = tweetsWithCTA > 0 ? Math.round(totalCTAEngagement / tweetsWithCTA) : 0;
  const avgWithoutCTA = tweetsWithoutCTA > 0 ? Math.round(totalNoCTAEngagement / tweetsWithoutCTA) : 0;

  return {
    topCTAs,
    withCTA: {
      count: tweetsWithCTA,
      avgEngagement: avgWithCTA
    },
    withoutCTA: {
      count: tweetsWithoutCTA,
      avgEngagement: avgWithoutCTA
    },
    performance: avgWithoutCTA > 0 ? `${(avgWithCTA / avgWithoutCTA).toFixed(2)}x` : 'N/A'
  };
}

/**
 * Analyze tweet lengths
 * @param {Array} tweets - Array of tweets
 * @returns {Object} - Length analysis data
 */
export function analyzeTweetLength(tweets) {
  const buckets = {
    short: { min: 0, max: 80, tweets: [] },      // Short tweets
    medium: { min: 81, max: 180, tweets: [] },   // Medium tweets
    long: { min: 181, max: 500, tweets: [] }     // Long tweets
  };

  tweets.forEach(tweet => {
    const length = (tweet.content || '').length;

    if (length <= 80) buckets.short.tweets.push(tweet);
    else if (length <= 180) buckets.medium.tweets.push(tweet);
    else buckets.long.tweets.push(tweet);
  });

  const calcAvg = (arr) => {
    if (arr.length === 0) return 0;
    return Math.round(arr.reduce((sum, t) => sum + getTotalEngagement(t), 0) / arr.length);
  };

  return {
    short: {
      range: '0-80 chars',
      count: buckets.short.tweets.length,
      avgEngagement: calcAvg(buckets.short.tweets)
    },
    medium: {
      range: '81-180 chars',
      count: buckets.medium.tweets.length,
      avgEngagement: calcAvg(buckets.medium.tweets)
    },
    long: {
      range: '181-500 chars',
      count: buckets.long.tweets.length,
      avgEngagement: calcAvg(buckets.long.tweets)
    },
    optimal: null // Will be set below
  };
}

/**
 * Analyze mentions and collaboration
 * @param {Array} tweets - Array of tweets
 * @returns {Object} - Mention analysis data
 */
export function analyzeMentions(tweets) {
  const mentionMap = new Map();

  tweets.forEach(tweet => {
    const mentions = (tweet.content || '').match(/@\w+/g) || [];
    const engagement = getTotalEngagement(tweet);

    mentions.forEach(mention => {
      const username = mention.toLowerCase();

      if (mentionMap.has(username)) {
        const existing = mentionMap.get(username);
        existing.count++;
        existing.totalEngagement += engagement;
        existing.avgEngagement = Math.round(existing.totalEngagement / existing.count);
      } else {
        mentionMap.set(username, {
          username: mention,
          count: 1,
          totalEngagement: engagement,
          avgEngagement: engagement
        });
      }
    });
  });

  return {
    topMentions: Array.from(mentionMap.values())
      .sort((a, b) => b.totalEngagement - a.totalEngagement)
      .slice(0, 20),
    uniqueMentions: mentionMap.size
  };
}

/**
 * Categorize hook patterns
 * @param {Array} tweets - Array of tweets
 * @returns {Object} - Hook pattern analysis
 */
export function categorizeHooks(tweets) {
  const patterns = {
    question: {
      label: 'Question Hooks',
      regex: /^(what|why|how|when|where|who|which|can|do|does|is|are)/i,
      tweets: []
    },
    number: {
      label: 'Number Hooks',
      regex: /^\d+\s+(ways|reasons|tips|steps|things|secrets|hacks)/i,
      tweets: []
    },
    urgency: {
      label: 'Urgency Hooks',
      regex: /^(now|today|urgent|breaking|just|new|alert)/i,
      tweets: []
    },
    curiosity: {
      label: 'Curiosity Hooks',
      regex: /(secret|hidden|unknown|revealed|discovered|nobody|never)/i,
      tweets: []
    }
  };

  tweets.forEach(tweet => {
    Object.values(patterns).forEach(pattern => {
      if (pattern.regex.test(tweet.content)) {
        pattern.tweets.push(tweet);
      }
    });
  });

  const calcAvg = (arr) => {
    if (arr.length === 0) return 0;
    return Math.round(arr.reduce((sum, t) => sum + getTotalEngagement(t), 0) / arr.length);
  };

  return Object.entries(patterns).map(([key, pattern]) => ({
    type: key,
    label: pattern.label,
    count: pattern.tweets.length,
    avgEngagement: calcAvg(pattern.tweets),
    percentage: Math.round((pattern.tweets.length / tweets.length) * 100)
  })).sort((a, b) => b.avgEngagement - a.avgEngagement);
}
