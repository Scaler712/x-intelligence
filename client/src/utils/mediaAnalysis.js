/**
 * Media analysis utilities
 */

import { getTotalEngagement } from './analytics';

/**
 * Detect if tweet contains media
 * @param {string} content - Tweet content
 * @returns {Object} - Media detection result
 */
export function detectMedia(content) {
  if (!content) return { hasMedia: false, type: null };

  // Twitter media patterns
  const imagePattern = /(pic\.twitter\.com|t\.co\/\w+.*?(jpg|jpeg|png|gif))/i;
  const videoPattern = /(video|vid|mp4)/i;

  if (imagePattern.test(content)) {
    return { hasMedia: true, type: 'image' };
  }
  if (videoPattern.test(content)) {
    return { hasMedia: true, type: 'video' };
  }

  // Generic URL that might be media
  if (/https?:\/\/t\.co\/\w+/i.test(content)) {
    return { hasMedia: true, type: 'link' };
  }

  return { hasMedia: false, type: null };
}

/**
 * Analyze media usage and performance
 * @param {Array} tweets - Array of tweets
 * @returns {Object} - Media analysis data
 */
export function analyzeMedia(tweets) {
  const withImage = [];
  const withVideo = [];
  const withLink = [];
  const noMedia = [];

  tweets.forEach(tweet => {
    const { hasMedia, type } = detectMedia(tweet.content);

    if (!hasMedia) {
      noMedia.push(tweet);
    } else if (type === 'image') {
      withImage.push(tweet);
    } else if (type === 'video') {
      withVideo.push(tweet);
    } else if (type === 'link') {
      withLink.push(tweet);
    }
  });

  const calcAvg = (arr) => {
    if (arr.length === 0) return 0;
    return Math.round(arr.reduce((sum, t) => sum + getTotalEngagement(t), 0) / arr.length);
  };

  const imageAvg = calcAvg(withImage);
  const videoAvg = calcAvg(withVideo);
  const linkAvg = calcAvg(withLink);
  const noMediaAvg = calcAvg(noMedia);

  return {
    withImage: {
      count: withImage.length,
      avgEngagement: imageAvg
    },
    withVideo: {
      count: withVideo.length,
      avgEngagement: videoAvg
    },
    withLink: {
      count: withLink.length,
      avgEngagement: linkAvg
    },
    noMedia: {
      count: noMedia.length,
      avgEngagement: noMediaAvg
    },
    performance: {
      imageVsText: noMediaAvg > 0 ? `${(imageAvg / noMediaAvg).toFixed(2)}x` : 'N/A',
      videoVsText: noMediaAvg > 0 ? `${(videoAvg / noMediaAvg).toFixed(2)}x` : 'N/A'
    },
    recommendation: videoAvg > imageAvg && videoAvg > noMediaAvg
      ? 'Videos perform best'
      : imageAvg > noMediaAvg
      ? 'Images boost engagement'
      : 'Media impact unclear'
  };
}
