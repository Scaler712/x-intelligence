const axios = require("axios");
const fs = require("fs");
const path = require("path");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function toISO(created_at) {
  const d = new Date(created_at);
  return isNaN(d) ? created_at : d.toISOString();
}

function csvEscape(s) {
  const str = (s ?? "").toString();
  return `"${str.replace(/"/g, '""')}"`;
}

function rowToCsv(tweet) {
  const content  = tweet.text ?? "";
  const comments = tweet.replies ?? 0;
  const likes    = tweet.favorites ?? 0;
  const retweets = tweet.retweets ?? 0;
  const dateIso  = toISO(tweet.created_at);

  return [
    csvEscape(content),
    comments,
    likes,
    retweets,
    csvEscape(dateIso),
  ].join(",") + "\n";
}

function isPerformingTweet(tweet, filters) {
  const comments = tweet.replies ?? 0;
  const likes    = tweet.favorites ?? 0;
  const retweets = tweet.retweets ?? 0;
  const totalEngagement = likes + retweets + comments;
  const content = tweet.text ?? "";

  // Check all thresholds - tweet must meet ALL specified minimums
  if (filters.MIN_LIKES > 0 && likes < filters.MIN_LIKES) return false;
  if (filters.MIN_RETWEETS > 0 && retweets < filters.MIN_RETWEETS) return false;
  if (filters.MIN_COMMENTS > 0 && comments < filters.MIN_COMMENTS) return false;
  if (filters.MIN_TOTAL_ENGAGEMENT > 0 && totalEngagement < filters.MIN_TOTAL_ENGAGEMENT) return false;

  // Date range filtering
  if (filters.dateRange) {
    const tweetDate = new Date(tweet.created_at);
    if (!isNaN(tweetDate.getTime())) {
      if (filters.dateRange.start && tweetDate < new Date(filters.dateRange.start)) return false;
      if (filters.dateRange.end && tweetDate > new Date(filters.dateRange.end)) return false;
    }
  }

  // Exclude retweets (tweets starting with "RT @")
  if (filters.excludeRetweets && content.startsWith('RT @')) return false;

  // Exclude replies (tweets starting with "@")
  if (filters.excludeReplies && content.startsWith('@')) return false;

  // Media-only filter (check if tweet contains media URLs)
  if (filters.mediaOnly) {
    const hasMedia = /https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|mp4|webm|mov)/i.test(content) ||
                     /pic\.twitter\.com|video\.twitter\.com/i.test(content);
    if (!hasMedia) return false;
  }

  // Language filtering (basic check on content)
  if (filters.language && filters.language !== 'all') {
    // This is a simplified language check - could be enhanced with a proper language detection library
    // For now, we'll skip this filter or implement basic detection
    // You could add language-specific character sets or use a library like franc
  }

  return true;
}

async function fetchPage(cursor, screenName, scraperKey, baseUrl, timeout, retries, retryBackoff) {
  const url = new URL(baseUrl);
  url.searchParams.set("screenname", screenName);
  url.searchParams.set("rest_id", "");
  url.searchParams.set("cursor", cursor || "");

  let attempt = 0;
  while (true) {
    attempt++;
    try {
      const res = await axios.get(url.toString(), {
        headers: { "scraper-key": scraperKey },
        timeout: timeout,
      });
      return res.data;
    } catch (err) {
      if (attempt >= retries) throw err;
      const wait = retryBackoff * attempt;
      console.warn(`Request failed (attempt ${attempt}/${retries}). Retrying in ${wait}ms...`);
      await sleep(wait);
    }
  }
}

async function scrapeTimeline(config, filters, onProgress, pauseCheck) {
  const {
    screenName,
    scraperKey,
    baseUrl,
    timeout,
    pageDelay,
    maxPages,
    retries,
    retryBackoff,
    maxSameCursor,
    outputPath
  } = config;

  const csvRows = [];
  const tweets = []; // Store tweets for database persistence
  let cursor = "";
  let page = 0;
  let total = 0;
  let filtered = 0;
  let sameCursorCount = 0;
  let lastCursor = "";

  // Track seen tweets to prevent duplicates (using content + date as key)
  const seenTweets = new Set();

  // Add CSV header
  csvRows.push("tweet_content,amount_of_comments,amount_of_likes,amount_of_retweets,date_time\n");

  while (true) {
    // Check for pause
    if (pauseCheck && pauseCheck()) {
      console.log('Scraping paused by user');
      // Wait for resume
      while (pauseCheck()) {
        await sleep(1000);
      }
      console.log('Scraping resumed');
    }

    // Check max tweets limit
    if (filters.maxTweets > 0 && total >= filters.maxTweets) {
      console.log(`Reached maxTweets limit=${filters.maxTweets}. Stopping.`);
      break;
    }
    if (maxPages && page >= maxPages) {
      console.log(`Reached MAX_PAGES=${maxPages}. Stopping.`);
      break;
    }

    page += 1;
    console.log(`Fetching page ${page} (cursor="${cursor}")...`);
    
    const data = await fetchPage(cursor, screenName, scraperKey, baseUrl, timeout, retries, retryBackoff);
    const timeline = Array.isArray(data?.timeline) ? data.timeline : [];

    for (const tweet of timeline) {
      // Create unique key for deduplication (content + date)
      const tweetContent = tweet.text ?? "";
      const tweetDate = toISO(tweet.created_at);
      const tweetKey = `${tweetContent}|${tweetDate}`;
      
      // Skip if we've seen this tweet before
      if (seenTweets.has(tweetKey)) {
        filtered += 1;
        continue;
      }
      
      if (isPerformingTweet(tweet, filters)) {
        seenTweets.add(tweetKey); // Mark as seen
        const csvRow = rowToCsv(tweet);
        csvRows.push(csvRow);
        
        // Store tweet data for database persistence
        tweets.push({
          content: tweetContent,
          comments: tweet.replies ?? 0,
          likes: tweet.favorites ?? 0,
          retweets: tweet.retweets ?? 0,
          date: tweetDate
        });
        
        total += 1;
        
        // Emit progress via callback
        if (onProgress) {
          onProgress({
            tweet: {
              content: tweetContent,
              comments: tweet.replies ?? 0,
              likes: tweet.favorites ?? 0,
              retweets: tweet.retweets ?? 0,
              date: tweetDate
            },
            stats: {
              total,
              filtered,
              page
            }
          });
        }
      } else {
        filtered += 1;
      }
    }

    const next = (data && typeof data.next_cursor === "string") ? data.next_cursor : "";
    console.log(`  Processed ${timeline.length} tweets from page ${page} (${total} matched, ${filtered} filtered). next_cursor="${next}"`);

    if (!next) {
      console.log(`Done (no next_cursor). Total tweets written: ${total}. Total filtered: ${filtered}.`);
      break;
    }

    // Stop if cursor repeats too many times
    if (next === lastCursor) {
      sameCursorCount++;
      if (sameCursorCount >= maxSameCursor) {
        console.log(
          `Cursor repeated ${sameCursorCount} times in a row — stopping. Total tweets written: ${total}. Total filtered: ${filtered}.`
        );
        break;
      }
    } else {
      sameCursorCount = 0;
    }

    lastCursor = next;
    cursor = next;

    if (pageDelay > 0) {
      await sleep(pageDelay);
    }
  }

  // Write CSV file
  const csvContent = csvRows.join("");
  fs.writeFileSync(outputPath, csvContent, "utf8");

  return {
    total,
    filtered,
    filename: path.basename(outputPath),
    path: outputPath,
    tweets: tweets // Include tweets array for database persistence
  };
}

module.exports = { scrapeTimeline };

