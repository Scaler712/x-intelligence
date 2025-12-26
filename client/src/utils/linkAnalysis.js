/**
 * Link and URL analysis utilities
 */

import { getTotalEngagement } from './analytics';

/**
 * Extract all URLs from tweets
 * @param {Array} tweets - Array of tweets
 * @returns {Object} - Link analysis data
 */
export function extractLinks(tweets) {
  const linkMap = new Map();
  const domainMap = new Map();

  tweets.forEach(tweet => {
    const urls = (tweet.content || '').match(/https?:\/\/[^\s]+/g) || [];
    const engagement = getTotalEngagement(tweet);

    urls.forEach(url => {
      try {
        const urlObj = new URL(url.replace(/[.,;!?]$/, ''));  // Remove trailing punctuation
        const domain = urlObj.hostname.replace('www.', '');

        // Track individual links
        if (linkMap.has(url)) {
          const existing = linkMap.get(url);
          existing.count++;
          existing.totalEngagement += engagement;
          existing.avgEngagement = Math.round(existing.totalEngagement / existing.count);
        } else {
          linkMap.set(url, {
            url,
            domain,
            count: 1,
            totalEngagement: engagement,
            avgEngagement: engagement
          });
        }

        // Track domains
        if (domainMap.has(domain)) {
          const existing = domainMap.get(domain);
          existing.count++;
          existing.totalEngagement += engagement;
          existing.avgEngagement = Math.round(existing.totalEngagement / existing.count);
        } else {
          domainMap.set(domain, {
            domain,
            count: 1,
            totalEngagement: engagement,
            avgEngagement: engagement
          });
        }
      } catch (e) {
        // Invalid URL, skip
      }
    });
  });

  return {
    links: Array.from(linkMap.values()).sort((a, b) => b.totalEngagement - a.totalEngagement),
    domains: Array.from(domainMap.values()).sort((a, b) => b.count - a.count),
    topDomains: Array.from(domainMap.values())
      .sort((a, b) => b.totalEngagement - a.totalEngagement)
      .slice(0, 10)
  };
}

/**
 * Analyze link performance
 * @param {Array} tweets - Array of tweets
 * @returns {Object} - Link performance metrics
 */
export function analyzeLinkPerformance(tweets) {
  const withLinks = tweets.filter(t => /https?:\/\//.test(t.content || ''));
  const withoutLinks = tweets.filter(t => !/https?:\/\//.test(t.content || ''));

  const avgWithLinks = withLinks.length > 0
    ? withLinks.reduce((sum, t) => sum + getTotalEngagement(t), 0) / withLinks.length
    : 0;

  const avgWithoutLinks = withoutLinks.length > 0
    ? withoutLinks.reduce((sum, t) => sum + getTotalEngagement(t), 0) / withoutLinks.length
    : 0;

  return {
    withLinks: {
      count: withLinks.length,
      avgEngagement: Math.round(avgWithLinks)
    },
    withoutLinks: {
      count: withoutLinks.length,
      avgEngagement: Math.round(avgWithoutLinks)
    },
    performance: avgWithLinks > 0 && avgWithoutLinks > 0
      ? `${(avgWithLinks / avgWithoutLinks).toFixed(2)}x`
      : 'N/A'
  };
}
