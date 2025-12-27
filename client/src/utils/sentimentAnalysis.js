/**
 * Sentiment analysis utilities
 */

import { getTotalEngagement } from './analytics';

const POSITIVE_WORDS = new Set([
  'amazing', 'awesome', 'best', 'better', 'brilliant', 'celebrate', 'excellent',
  'excited', 'fantastic', 'glad', 'good', 'great', 'happy', 'incredible',
  'love', 'perfect', 'positive', 'success', 'successful', 'thanks', 'wonderful',
  'win', 'winning', 'winner', 'beautiful', 'outstanding', 'superb', 'terrific',
  'fabulous', 'marvelous', 'phenomenal', 'spectacular', 'delighted', 'thrilled',
  'pleased', 'grateful', 'appreciate', 'thankful', 'blessed', 'proud'
]);

const NEGATIVE_WORDS = new Set([
  'awful', 'bad', 'terrible', 'worst', 'hate', 'horrible', 'disappointing',
  'disappointed', 'sad', 'angry', 'upset', 'frustrated', 'fail', 'failed',
  'failure', 'problem', 'issue', 'broken', 'bug', 'error', 'wrong', 'poor',
  'disgusting', 'pathetic', 'useless', 'worthless', 'trash', 'garbage',
  'disaster', 'nightmare', 'annoying', 'irritating', 'unfortunate', 'regret',
  'sorry', 'mistake', 'concerned', 'worried', 'afraid', 'fear'
]);

/**
 * Calculate sentiment score for text
 * @param {string} text - Text to analyze
 * @returns {number} - Sentiment score (positive number = positive, negative = negative)
 */
export function calculateSentimentScore(text) {
  if (!text) return 0;

  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  let score = 0;

  words.forEach(word => {
    if (POSITIVE_WORDS.has(word)) score++;
    if (NEGATIVE_WORDS.has(word)) score--;
  });

  return score;
}

/**
 * Categorize sentiment
 * @param {number} score - Sentiment score
 * @returns {string} - 'positive', 'neutral', or 'negative'
 */
export function categorizeSentiment(score) {
  if (score > 0) return 'positive';
  if (score < 0) return 'negative';
  return 'neutral';
}

/**
 * Analyze sentiment across all tweets
 * @param {Array} tweets - Array of tweets
 * @returns {Object} - Sentiment analysis data
 */
export function analyzeSentiment(tweets) {
  const sentimentTweets = tweets.map(tweet => {
    const score = calculateSentimentScore(tweet.content);
    const sentiment = categorizeSentiment(score);
    return {
      ...tweet,
      sentimentScore: score,
      sentiment
    };
  });

  const positive = sentimentTweets.filter(t => t.sentiment === 'positive');
  const neutral = sentimentTweets.filter(t => t.sentiment === 'neutral');
  const negative = sentimentTweets.filter(t => t.sentiment === 'negative');

  const calcAvg = (arr) => {
    if (arr.length === 0) return 0;
    return Math.round(arr.reduce((sum, t) => sum + getTotalEngagement(t), 0) / arr.length);
  };

  return {
    distribution: {
      positive: {
        count: positive.length,
        percentage: Math.round((positive.length / tweets.length) * 100),
        avgEngagement: calcAvg(positive)
      },
      neutral: {
        count: neutral.length,
        percentage: Math.round((neutral.length / tweets.length) * 100),
        avgEngagement: calcAvg(neutral)
      },
      negative: {
        count: negative.length,
        percentage: Math.round((negative.length / tweets.length) * 100),
        avgEngagement: calcAvg(negative)
      }
    },
    tweets: sentimentTweets,
    mostPositive: sentimentTweets.filter(t => t.sentimentScore > 0).sort((a, b) => b.sentimentScore - a.sentimentScore).slice(0, 5),
    mostNegative: sentimentTweets.filter(t => t.sentimentScore < 0).sort((a, b) => a.sentimentScore - b.sentimentScore).slice(0, 5)
  };
}
