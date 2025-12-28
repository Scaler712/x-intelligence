/**
 * Comparison utilities for analyzing multiple scrapes
 */

import { getTotalEngagement, calculateEngagementStats } from './analytics';

/**
 * Compare multiple scrapes and return aggregated metrics
 * @param {Array} scrapes - Array of scrape objects with tweets
 * @returns {Object} - Comparison data
 */
export function compareScrapes(scrapes) {
  if (!scrapes || scrapes.length === 0) {
    return {
      metrics: [],
      bestPerformer: null,
      gaps: [],
      commonPatterns: [],
    };
  }

  // Calculate metrics for each scrape
  const metrics = scrapes.map(scrape => {
    // Handle missing tweets
    const tweets = scrape.tweets || [];
    if (tweets.length === 0) {
      return {
        id: scrape.id,
        username: scrape.username,
        tweetCount: 0,
        avgLikes: 0,
        avgRetweets: 0,
        avgComments: 0,
        avgEngagement: 0,
        totalLikes: 0,
        totalRetweets: 0,
        totalComments: 0,
        totalEngagement: 0,
        bestTweet: null,
        bestTime: null,
      };
    }
    
    const stats = calculateEngagementStats(tweets);
    const totalLikes = tweets.reduce((sum, t) => sum + (t.likes || 0), 0);
    const totalRetweets = tweets.reduce((sum, t) => sum + (t.retweets || 0), 0);
    const totalComments = tweets.reduce((sum, t) => sum + (t.comments || 0), 0);
    
    return {
      id: scrape.id,
      username: scrape.username,
      tweetCount: tweets.length,
      avgLikes: stats.avgLikes || 0,
      avgRetweets: stats.avgRetweets || 0,
      avgComments: stats.avgComments || 0,
      avgEngagement: stats.avgTotalEngagement || 0,
      totalLikes: totalLikes,
      totalRetweets: totalRetweets,
      totalComments: totalComments,
      totalEngagement: stats.totalEngagement || 0,
      bestTweet: findBestTweet(tweets),
      bestTime: findBestPostingTime(tweets),
    };
  });

  // Find best performer (only from metrics with tweets)
  const metricsWithTweets = metrics.filter(m => m.tweetCount > 0);
  if (metricsWithTweets.length === 0) {
    return {
      metrics: [],
      bestPerformer: null,
      gaps: [],
      commonPatterns: [],
    };
  }
  
  const bestPerformer = metricsWithTweets.reduce((best, current) =>
    current.avgEngagement > best.avgEngagement ? current : best
  , metricsWithTweets[0]);

  // Identify performance gaps
  const gaps = identifyGaps(metrics, bestPerformer);

  // Find common patterns
  const commonPatterns = findCommonPatterns(scrapes);

  return {
    metrics,
    bestPerformer,
    gaps,
    commonPatterns,
  };
}

/**
 * Find the best performing tweet in a collection
 * @param {Array} tweets - Array of tweets
 * @returns {Object} - Best tweet
 */
function findBestTweet(tweets) {
  if (!tweets || tweets.length === 0) return null;

  return tweets.reduce((best, current) => {
    const currentEngagement = getTotalEngagement(current);
    const bestEngagement = getTotalEngagement(best);
    return currentEngagement > bestEngagement ? current : best;
  }, tweets[0]);
}

/**
 * Find the best posting time based on engagement
 * @param {Array} tweets - Array of tweets
 * @returns {Object} - { day, hour, avgEngagement }
 */
function findBestPostingTime(tweets) {
  if (!tweets || tweets.length === 0) return null;

  const timeMap = new Map();

  tweets.forEach(tweet => {
    const date = new Date(tweet.date);
    const day = date.toLocaleDateString('en-US', { weekday: 'short' });
    const hour = date.getHours();
    const key = `${day} ${hour}:00`;
    const engagement = getTotalEngagement(tweet);

    if (timeMap.has(key)) {
      const existing = timeMap.get(key);
      existing.count++;
      existing.totalEngagement += engagement;
      existing.avgEngagement = existing.totalEngagement / existing.count;
    } else {
      timeMap.set(key, {
        day,
        hour,
        count: 1,
        totalEngagement: engagement,
        avgEngagement: engagement,
      });
    }
  });

  // Find time slot with highest average engagement
  let bestTime = null;
  timeMap.forEach(time => {
    if (!bestTime || time.avgEngagement > bestTime.avgEngagement) {
      bestTime = time;
    }
  });

  return bestTime;
}

/**
 * Identify performance gaps between profiles and best performer
 * @param {Array} metrics - Array of metric objects
 * @param {Object} bestPerformer - Best performing metric object
 * @returns {Array} - Array of gap objects
 */
function identifyGaps(metrics, bestPerformer) {
  return metrics
    .filter(metric => metric.id !== bestPerformer.id)
    .map(metric => {
      const likesGap = bestPerformer.avgLikes - metric.avgLikes;
      const retweetsGap = bestPerformer.avgRetweets - metric.avgRetweets;
      const commentsGap = bestPerformer.avgComments - metric.avgComments;
      const engagementGap = bestPerformer.avgEngagement - metric.avgEngagement;

      return {
        username: metric.username,
        gaps: {
          likes: {
            value: likesGap,
            percentage: metric.avgLikes > 0 ? Math.round((likesGap / metric.avgLikes) * 100) : 0,
          },
          retweets: {
            value: retweetsGap,
            percentage: metric.avgRetweets > 0 ? Math.round((retweetsGap / metric.avgRetweets) * 100) : 0,
          },
          comments: {
            value: commentsGap,
            percentage: metric.avgComments > 0 ? Math.round((commentsGap / metric.avgComments) * 100) : 0,
          },
          engagement: {
            value: engagementGap,
            percentage: metric.avgEngagement > 0 ? Math.round((engagementGap / metric.avgEngagement) * 100) : 0,
          },
        },
      };
    });
}

/**
 * Find common patterns across multiple scrapes
 * @param {Array} scrapes - Array of scrape objects
 * @returns {Array} - Array of common pattern objects
 */
function findCommonPatterns(scrapes) {
  if (!scrapes || scrapes.length < 2) return [];

  // Find common hashtags
  const hashtagMaps = scrapes.map(scrape => {
    const hashtags = new Set();
    scrape.tweets.forEach(tweet => {
      const matches = (tweet.content || '').match(/#\w+/g) || [];
      matches.forEach(tag => hashtags.add(tag.toLowerCase()));
    });
    return hashtags;
  });

  const commonHashtags = Array.from(hashtagMaps[0]).filter(tag =>
    hashtagMaps.every(map => map.has(tag))
  );

  // Find common posting times
  const timeMaps = scrapes.map(scrape => {
    const times = new Set();
    scrape.tweets.forEach(tweet => {
      const date = new Date(tweet.date);
      const hour = date.getHours();
      times.add(hour);
    });
    return times;
  });

  const commonHours = Array.from(timeMaps[0]).filter(hour =>
    timeMaps.every(map => map.has(hour))
  );

  return [
    {
      type: 'hashtags',
      label: 'Common Hashtags',
      values: commonHashtags,
    },
    {
      type: 'postingTimes',
      label: 'Common Posting Hours',
      values: commonHours.sort((a, b) => a - b),
    },
  ];
}

/**
 * Calculate benchmark metrics across multiple scrapes
 * @param {Array} scrapes - Array of scrape objects
 * @returns {Object} - Benchmark data
 */
export function calculateBenchmarks(scrapes) {
  if (!scrapes || scrapes.length === 0) {
    return {
      avgLikes: 0,
      avgRetweets: 0,
      avgComments: 0,
      avgEngagement: 0,
      topPercentile: { likes: 0, retweets: 0, comments: 0 },
    };
  }

  const allTweets = scrapes.flatMap(s => s.tweets);

  // Calculate overall averages
  const totalLikes = allTweets.reduce((sum, t) => sum + (t.likes || 0), 0);
  const totalRetweets = allTweets.reduce((sum, t) => sum + (t.retweets || 0), 0);
  const totalComments = allTweets.reduce((sum, t) => sum + (t.comments || 0), 0);

  // Calculate top 10% thresholds
  const sortedByLikes = [...allTweets].sort((a, b) => (b.likes || 0) - (a.likes || 0));
  const sortedByRetweets = [...allTweets].sort((a, b) => (b.retweets || 0) - (a.retweets || 0));
  const sortedByComments = [...allTweets].sort((a, b) => (b.comments || 0) - (a.comments || 0));

  const top10Index = Math.floor(allTweets.length * 0.1);

  return {
    avgLikes: Math.round(totalLikes / allTweets.length),
    avgRetweets: Math.round(totalRetweets / allTweets.length),
    avgComments: Math.round(totalComments / allTweets.length),
    avgEngagement: Math.round((totalLikes + totalRetweets + totalComments) / allTweets.length),
    topPercentile: {
      likes: sortedByLikes[top10Index]?.likes || 0,
      retweets: sortedByRetweets[top10Index]?.retweets || 0,
      comments: sortedByComments[top10Index]?.comments || 0,
    },
  };
}
