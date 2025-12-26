/**
 * Analytics utility functions for Twitter data analysis
 */

/**
 * Calculate total engagement for a tweet
 */
export function getTotalEngagement(tweet) {
  return (tweet.likes || 0) + (tweet.retweets || 0) + (tweet.comments || 0);
}

/**
 * Calculate engagement statistics
 */
export function calculateEngagementStats(tweets) {
  if (tweets.length === 0) {
    return {
      avgLikes: 0,
      avgRetweets: 0,
      avgComments: 0,
      avgTotalEngagement: 0,
      totalEngagement: 0,
      engagementRate: 0,
      maxEngagement: 0,
      minEngagement: 0
    };
  }

  const totalLikes = tweets.reduce((sum, t) => sum + (t.likes || 0), 0);
  const totalRetweets = tweets.reduce((sum, t) => sum + (t.retweets || 0), 0);
  const totalComments = tweets.reduce((sum, t) => sum + (t.comments || 0), 0);
  const totalEngagement = tweets.reduce((sum, t) => sum + getTotalEngagement(t), 0);

  const engagements = tweets.map(t => getTotalEngagement(t));
  const maxEngagement = Math.max(...engagements, 0);
  const minEngagement = Math.min(...engagements, 0);

  return {
    avgLikes: Math.round(totalLikes / tweets.length),
    avgRetweets: Math.round(totalRetweets / tweets.length),
    avgComments: Math.round(totalComments / tweets.length),
    avgTotalEngagement: Math.round(totalEngagement / tweets.length),
    totalEngagement,
    engagementRate: totalEngagement / tweets.length,
    maxEngagement,
    minEngagement
  };
}

/**
 * Find top performing tweets
 */
export function findTopPerformers(tweets, count = 5) {
  return [...tweets]
    .sort((a, b) => getTotalEngagement(b) - getTotalEngagement(a))
    .slice(0, count)
    .map((tweet, index) => ({
      ...tweet,
      rank: index + 1,
      totalEngagement: getTotalEngagement(tweet)
    }));
}

/**
 * Analyze posting schedule (day and hour patterns)
 */
export function analyzePostingSchedule(tweets) {
  // Initialize 7 days × 24 hours matrix
  const frequencyMatrix = Array(7).fill(null).map(() => Array(24).fill(0));
  const engagementMatrix = Array(7).fill(null).map(() => Array(24).fill(0));
  const countMatrix = Array(7).fill(null).map(() => Array(24).fill(0));

  tweets.forEach(tweet => {
    try {
      const date = new Date(tweet.date);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const hour = date.getHours(); // 0-23

      frequencyMatrix[dayOfWeek][hour]++;
      const engagement = getTotalEngagement(tweet);
      engagementMatrix[dayOfWeek][hour] += engagement;
      countMatrix[dayOfWeek][hour]++;
    } catch (e) {
      // Skip invalid dates
      console.warn('Invalid date:', tweet.date);
    }
  });

  // Calculate average engagement per cell
  const avgEngagementMatrix = frequencyMatrix.map((row, day) =>
    row.map((count, hour) =>
      countMatrix[day][hour] > 0
        ? Math.round(engagementMatrix[day][hour] / countMatrix[day][hour])
        : 0
    )
  );

  // Find best times
  let maxFrequency = 0;
  let maxEngagement = 0;
  let bestDay = 0;
  let bestHour = 0;
  let bestEngagementDay = 0;
  let bestEngagementHour = 0;

  frequencyMatrix.forEach((row, day) => {
    row.forEach((count, hour) => {
      if (count > maxFrequency) {
        maxFrequency = count;
        bestDay = day;
        bestHour = hour;
      }
      const avgEng = avgEngagementMatrix[day][hour];
      if (avgEng > maxEngagement) {
        maxEngagement = avgEng;
        bestEngagementDay = day;
        bestEngagementHour = hour;
      }
    });
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return {
    frequencyMatrix,
    engagementMatrix: avgEngagementMatrix,
    bestDay: dayNames[bestDay],
    bestHour: bestHour,
    bestEngagementDay: dayNames[bestEngagementDay],
    bestEngagementHour: bestEngagementHour,
    maxFrequency,
    maxEngagement
  };
}

/**
 * Extract hashtags from tweets
 */
export function extractHashtags(tweets) {
  const hashtagMap = new Map();

  tweets.forEach(tweet => {
    const hashtags = (tweet.content || '').match(/#\w+/g) || [];
    const engagement = getTotalEngagement(tweet);

    hashtags.forEach(tag => {
      const lowerTag = tag.toLowerCase();
      if (hashtagMap.has(lowerTag)) {
        const existing = hashtagMap.get(lowerTag);
        existing.count++;
        existing.totalEngagement += engagement;
        existing.avgEngagement = Math.round(existing.totalEngagement / existing.count);
      } else {
        hashtagMap.set(lowerTag, {
          tag: tag,
          count: 1,
          totalEngagement: engagement,
          avgEngagement: engagement
        });
      }
    });
  });

  return Array.from(hashtagMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
}

/**
 * Common stop words to exclude from word frequency
 */
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must',
  'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
  'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their',
  'what', 'which', 'who', 'whom', 'whose', 'where', 'when', 'why', 'how', 'all', 'each',
  'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
  'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'now', 'rt'
]);

/**
 * Extract word frequency from tweets
 */
export function wordFrequency(tweets, topN = 20) {
  const wordMap = new Map();

  tweets.forEach(tweet => {
    const text = (tweet.content || '')
      .toLowerCase()
      .replace(/https?:\/\/[^\s]+/g, '') // Remove URLs
      .replace(/@\w+/g, '') // Remove mentions
      .replace(/#\w+/g, '') // Remove hashtags
      .replace(/[^\w\s]/g, ' '); // Remove punctuation

    const words = text.split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));

    words.forEach(word => {
      wordMap.set(word, (wordMap.get(word) || 0) + 1);
    });
  });

  return Array.from(wordMap.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}

/**
 * Extract themes/topics from tweets
 */
export function extractThemes(tweets, topN = 10) {
  const wordFreq = wordFrequency(tweets, 50);
  
  // Group related words (simple approach: use top words as themes)
  return wordFreq.slice(0, topN).map((item, index) => ({
    id: index + 1,
    theme: item.word,
    frequency: item.count,
    percentage: Math.round((item.count / tweets.length) * 100)
  }));
}

/**
 * Analyze posting times and frequency
 */
export function analyzePostingTimes(tweets) {
  if (tweets.length === 0) {
    return {
      postsPerDay: 0,
      postsPerWeek: 0,
      mostActiveDay: 'N/A',
      mostActiveHour: 'N/A',
      dayDistribution: {}
    };
  }

  const dayCounts = Array(7).fill(0);
  const hourCounts = Array(24).fill(0);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  tweets.forEach(tweet => {
    try {
      const date = new Date(tweet.date);
      dayCounts[date.getDay()]++;
      hourCounts[date.getHours()]++;
    } catch (e) {
      // Skip invalid dates
    }
  });

  const mostActiveDayIndex = dayCounts.indexOf(Math.max(...dayCounts));
  const mostActiveHourIndex = hourCounts.indexOf(Math.max(...hourCounts));

  const dayDistribution = {};
  dayNames.forEach((day, index) => {
    dayDistribution[day] = dayCounts[index];
  });

  // Calculate time range (oldest to newest tweet)
  const dates = tweets
    .map(t => new Date(t.date))
    .filter(d => !isNaN(d.getTime()))
    .sort((a, b) => a - b);

  const daysDiff = dates.length > 0
    ? Math.max(1, Math.ceil((dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24)))
    : 1;

  return {
    postsPerDay: Math.round((tweets.length / daysDiff) * 10) / 10,
    postsPerWeek: Math.round((tweets.length / daysDiff) * 7 * 10) / 10,
    mostActiveDay: dayNames[mostActiveDayIndex],
    mostActiveHour: `${mostActiveHourIndex}:00`,
    dayDistribution
  };
}

