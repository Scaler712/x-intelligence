const axios = require('axios');

/**
 * Verify if a Twitter profile exists by checking the public profile page
 * @param {string} username - Twitter username (without @)
 * @returns {Promise<boolean>} - True if profile exists, false otherwise
 */
async function verifyProfileExists(username) {
  if (!username || typeof username !== 'string') {
    return false;
  }

  // Clean username
  const cleanUsername = username.replace('@', '').trim().toLowerCase();
  
  if (!cleanUsername || cleanUsername.length < 1 || cleanUsername.length > 15) {
    return false;
  }

  // Twitter usernames are alphanumeric and underscores only
  if (!/^[a-z0-9_]+$/.test(cleanUsername)) {
    return false;
  }

  try {
    // Check Twitter profile page with better headers and error handling
    const response = await axios.get(`https://twitter.com/${cleanUsername}`, {
      timeout: 10000,
      maxRedirects: 5,
      validateStatus: (status) => status < 500, // Accept anything except server errors
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      followRedirect: true
    });

    // If we get a 404, definitely doesn't exist
    if (response.status === 404) {
      return false;
    }

    // Check response content for error messages
    if (response.data && typeof response.data === 'string') {
      const lowerContent = response.data.toLowerCase();
      if (lowerContent.includes('this account doesn\'t exist') || 
          lowerContent.includes('account doesn\'t exist') ||
          lowerContent.includes('account suspended') ||
          lowerContent.includes('this account is suspended')) {
        return false;
      }
      
      // Positive indicators that account exists
      if (lowerContent.includes(`@${cleanUsername}`) || 
          lowerContent.includes(`twitter.com/${cleanUsername}`) ||
          response.status === 200) {
        return true;
      }
    }

    // If we got here and status is 200, assume it exists
    // (Better to show some false positives than filter out all real profiles)
    return response.status === 200 || response.status === 301 || response.status === 302;
  } catch (error) {
    // Network errors - be conservative and assume profile exists
    // (Don't filter out valid profiles due to network issues)
    if (error.response?.status === 404) {
      return false;
    }
    
    // For timeouts or other errors, assume it exists to avoid filtering out real profiles
    console.warn(`Verification warning for @${cleanUsername}:`, error.message);
    return true; // Assume exists if we can't verify (conservative approach)
  }
}

/**
 * Verify multiple profiles in parallel (with concurrency limit)
 * @param {Array<string>} usernames - Array of usernames to verify
 * @param {Function} onProgress - Callback function called for each verified profile (username, exists)
 * @param {number} concurrency - Number of parallel requests (default: 5)
 * @returns {Promise<Array<{username: string, exists: boolean}>>} - Array of verification results
 */
async function verifyProfiles(usernames, onProgress = null, concurrency = 5) {
  const results = [];
  const queue = [...usernames];
  
  let completed = 0;
  const total = usernames.length;

  async function processQueue() {
    while (queue.length > 0) {
      const username = queue.shift();
      if (!username) break;

      const exists = await verifyProfileExists(username);
      results.push({ username, exists });
      completed++;

      if (onProgress) {
        onProgress({
          username,
          exists,
          completed,
          total,
          progress: (completed / total) * 100
        });
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  // Run verification in parallel batches
  const workers = Array(Math.min(concurrency, usernames.length))
    .fill(null)
    .map(() => processQueue());

  await Promise.all(workers);

  return results;
}

module.exports = { verifyProfileExists, verifyProfiles };

