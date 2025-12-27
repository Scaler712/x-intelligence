/**
 * Extract hooks (first N words) from tweet content
 * @param {string} content - Tweet content
 * @param {number} wordCount - Number of words to extract (default: 15)
 * @returns {string} - Hook string
 */
export function extractHook(content, wordCount = 15) {
  if (!content || typeof content !== 'string') {
    return '';
  }
  
  // Split by whitespace and take first N words
  const words = content.trim().split(/\s+/);
  const hook = words.slice(0, wordCount).join(' ');
  
  // Add ellipsis if content was truncated
  return words.length > wordCount ? hook + '...' : hook;
}

/**
 * Calculate total engagement for a tweet
 * @param {Object} tweet - Tweet object with likes, retweets, comments
 * @returns {number} - Total engagement
 */
export function getTotalEngagement(tweet) {
  return (tweet.likes || 0) + (tweet.retweets || 0) + (tweet.comments || 0);
}

/**
 * Sort tweets by engagement (descending)
 * @param {Array} tweets - Array of tweet objects
 * @returns {Array} - Sorted tweets
 */
export function sortByEngagement(tweets) {
  return [...tweets].sort((a, b) => {
    const engagementA = getTotalEngagement(a);
    const engagementB = getTotalEngagement(b);
    return engagementB - engagementA;
  });
}

/**
 * Extract hooks from tweets and return sorted by engagement
 * @param {Array} tweets - Array of tweet objects
 * @param {number} wordCount - Number of words per hook
 * @returns {Array} - Array of hook objects with metadata
 */
export function extractHooks(tweets, wordCount = 15) {
  // First, deduplicate tweets by full content (normalize whitespace for comparison)
  const seenContents = new Set();
  const uniqueTweets = [];
  
  tweets.forEach((tweet, index) => {
    // Normalize content for comparison (trim and normalize whitespace)
    const normalizedContent = (tweet.content || '').trim().replace(/\s+/g, ' ');
    
    // Skip if we've seen this exact content before
    if (normalizedContent && !seenContents.has(normalizedContent)) {
      seenContents.add(normalizedContent);
      uniqueTweets.push({
        ...tweet,
        _originalIndex: index
      });
    }
  });
  
  // Add original index to each tweet before sorting
  const tweetsWithIndex = uniqueTweets.map((tweet, index) => ({
    ...tweet,
    _uniqueIndex: index
  }));
  
  const sortedTweets = sortByEngagement(tweetsWithIndex);
  
  return sortedTweets.map((tweet, index) => ({
    id: index,
    hook: extractHook(tweet.content, wordCount),
    fullContent: tweet.content,
    likes: tweet.likes,
    retweets: tweet.retweets,
    comments: tweet.comments,
    totalEngagement: getTotalEngagement(tweet),
    date: tweet.date,
    originalIndex: tweet._originalIndex
  }));
}

