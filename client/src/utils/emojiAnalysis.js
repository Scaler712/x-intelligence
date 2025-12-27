/**
 * Emoji analysis utilities
 */

import { getTotalEngagement } from './analytics';

/**
 * Extract emojis from text
 * @param {string} text - Text to analyze
 * @returns {Array} - Array of emojis found
 */
export function extractEmojis(text) {
  if (!text) return [];

  // Unicode ranges for emojis
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]/gu;

  return text.match(emojiRegex) || [];
}

/**
 * Analyze emoji usage across tweets
 * @param {Array} tweets - Array of tweets
 * @returns {Object} - Emoji analysis data
 */
export function analyzeEmojis(tweets) {
  const emojiMap = new Map();
  let tweetsWithEmojis = 0;
  let tweetsWithoutEmojis = 0;
  let totalEmojiEngagement = 0;
  let totalNoEmojiEngagement = 0;

  tweets.forEach(tweet => {
    const emojis = extractEmojis(tweet.content);
    const engagement = getTotalEngagement(tweet);

    if (emojis.length > 0) {
      tweetsWithEmojis++;
      totalEmojiEngagement += engagement;

      emojis.forEach(emoji => {
        if (emojiMap.has(emoji)) {
          const existing = emojiMap.get(emoji);
          existing.count++;
          existing.totalEngagement += engagement;
          existing.avgEngagement = Math.round(existing.totalEngagement / existing.count);
        } else {
          emojiMap.set(emoji, {
            emoji,
            count: 1,
            totalEngagement: engagement,
            avgEngagement: engagement
          });
        }
      });
    } else {
      tweetsWithoutEmojis++;
      totalNoEmojiEngagement += engagement;
    }
  });

  const topEmojis = Array.from(emojiMap.values())
    .sort((a, b) => b.totalEngagement - a.totalEngagement)
    .slice(0, 20);

  const avgWithEmojis = tweetsWithEmojis > 0 ? Math.round(totalEmojiEngagement / tweetsWithEmojis) : 0;
  const avgWithoutEmojis = tweetsWithoutEmojis > 0 ? Math.round(totalNoEmojiEngagement / tweetsWithoutEmojis) : 0;

  return {
    topEmojis,
    uniqueEmojis: emojiMap.size,
    withEmojis: {
      count: tweetsWithEmojis,
      avgEngagement: avgWithEmojis
    },
    withoutEmojis: {
      count: tweetsWithoutEmojis,
      avgEngagement: avgWithoutEmojis
    },
    performance: avgWithoutEmojis > 0 ? `${(avgWithEmojis / avgWithoutEmojis).toFixed(2)}x` : 'N/A',
    recommendation: avgWithEmojis > avgWithoutEmojis
      ? 'Emojis boost engagement'
      : avgWithEmojis < avgWithoutEmojis
      ? 'Emojis reduce engagement'
      : 'Emojis have no clear impact'
  };
}
