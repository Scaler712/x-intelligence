const { supabaseAdmin } = require('./supabaseClient');
const { scrapeTimeline } = require('../scraper');
const storageService = require('./storageService');
const path = require('path');
const fs = require('fs');
const config = require('../config');

// In-memory job tracking (will persist to DB)
const activeJobs = new Map(); // scrapeId -> { promise, socketId }

/**
 * Process a background scrape job
 */
async function processScrapeJob(scrapeId, userId, username, filters, scraperKey) {
  try {
    // Update status to running
    await supabaseAdmin
      .from('scrapes')
      .update({ 
        status: 'running',
        started_at: new Date().toISOString()
      })
      .eq('id', scrapeId);

    // Ensure downloads directory exists
    const downloadsDir = path.join(__dirname, '../../downloads');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    // Generate filename
    const timestamp = Date.now();
    const filename = `${username}_${timestamp}.csv`;
    const outputPath = path.join(downloadsDir, filename);

    const scrapeConfig = {
      screenName: username,
      scraperKey: scraperKey,
      baseUrl: config.BASE_URL,
      timeout: config.TIMEOUT_MS,
      pageDelay: config.PAGE_DELAY_MS,
      maxPages: config.MAX_PAGES,
      retries: config.RETRIES,
      retryBackoff: config.RETRY_BACKOFF_MS,
      maxSameCursor: config.MAX_SAME_CURSOR,
      outputPath: outputPath
    };

    const filterConfig = {
      MIN_LIKES: filters.MIN_LIKES || 0,
      MIN_RETWEETS: filters.MIN_RETWEETS || 0,
      MIN_COMMENTS: filters.MIN_COMMENTS || 0,
      MIN_TOTAL_ENGAGEMENT: filters.MIN_TOTAL_ENGAGEMENT || 0,
      dateRange: filters.dateRange || null,
      excludeRetweets: filters.excludeRetweets || false,
      excludeReplies: filters.excludeReplies || false,
      mediaOnly: filters.mediaOnly || false,
      language: filters.language || 'all',
      maxTweets: filters.maxTweets || 0,
    };

    // Progress callback that updates database (not socket)
    let lastUpdate = 0;
    const onProgress = async (progress) => {
      // Update stats in database periodically (every 10 tweets to reduce DB load)
      if (progress.stats.total - lastUpdate >= 10) {
        lastUpdate = progress.stats.total;
        try {
          await supabaseAdmin
            .from('scrapes')
            .update({ 
              stats: {
                total: progress.stats.total,
                filtered: progress.stats.filtered
              }
            })
            .eq('id', scrapeId);
        } catch (error) {
          console.error('Error updating job progress:', error);
        }
      }
    };

    // No pause check for background jobs
    const pauseCheck = () => false;

    // Start scraping
    const result = await scrapeTimeline(scrapeConfig, filterConfig, onProgress, pauseCheck);

    // Calculate final stats
    const stats = {
      total: result.total,
      filtered: result.filtered,
      totalLikes: result.tweets.reduce((sum, t) => sum + (t.likes || 0), 0),
      totalRetweets: result.tweets.reduce((sum, t) => sum + (t.retweets || 0), 0),
      totalComments: result.tweets.reduce((sum, t) => sum + (t.comments || 0), 0),
      totalEngagement: result.tweets.reduce((sum, t) => 
        sum + (t.likes || 0) + (t.retweets || 0) + (t.comments || 0), 0
      ),
      avgEngagement: result.total > 0 
        ? Math.round(result.tweets.reduce((sum, t) => 
            sum + (t.likes || 0) + (t.retweets || 0) + (t.comments || 0), 0
          ) / result.total)
        : 0
    };

    // Save tweets to database in batches
    if (result.tweets && result.tweets.length > 0) {
      // Deduplicate tweets
      const uniqueTweets = new Map();
      result.tweets.forEach(tweet => {
        const key = `${tweet.content}|${tweet.date || ''}`;
        if (!uniqueTweets.has(key)) {
          uniqueTweets.set(key, tweet);
        } else {
          // Keep the one with higher engagement if duplicate
          const existing = uniqueTweets.get(key);
          const existingEng = (existing.likes || 0) + (existing.retweets || 0) + (existing.comments || 0);
          const newEng = (tweet.likes || 0) + (tweet.retweets || 0) + (tweet.comments || 0);
          if (newEng > existingEng) {
            uniqueTweets.set(key, tweet);
          }
        }
      });
      
      const deduplicatedTweets = Array.from(uniqueTweets.values());
      
      const tweetInserts = deduplicatedTweets.map(tweet => ({
        scrape_id: scrapeId,
        content: tweet.content,
        likes: tweet.likes || 0,
        retweets: tweet.retweets || 0,
        comments: tweet.comments || 0,
        date: tweet.date ? new Date(tweet.date).toISOString() : null
      }));

      // Insert in batches of 1000
      const batchSize = 1000;
      for (let i = 0; i < tweetInserts.length; i += batchSize) {
        const batch = tweetInserts.slice(i, i + batchSize);
        const { error } = await supabaseAdmin.from('tweets').insert(batch);
        if (error) {
          console.error(`Error inserting tweets batch ${i}-${i + batch.length}:`, error);
        }
      }
      
      stats.total = deduplicatedTweets.length;
    }

    // Upload to cloud storage
    try {
      const scrapeData = {
        id: scrapeId,
        username: username,
        date: new Date().toISOString(),
        stats: stats,
        filters: filterConfig,
        csvFilename: result.filename,
        tweets: result.tweets
      };

      const cloudPath = await storageService.uploadScrape(userId, scrapeId, scrapeData);

      // Update scrape as completed
      await supabaseAdmin
        .from('scrapes')
        .update({ 
          status: 'completed',
          stats: stats,
          csv_filename: result.filename,
          cloud_storage_path: cloudPath,
          completed_at: new Date().toISOString()
        })
        .eq('id', scrapeId);

      // Clean up active job
      activeJobs.delete(scrapeId);

      return { success: true, scrapeId, stats, filename: result.filename };
    } catch (storageError) {
      console.error('Error uploading to cloud storage:', storageError);
      // Still mark as completed even if storage fails
      await supabaseAdmin
        .from('scrapes')
        .update({ 
          status: 'completed',
          stats: stats,
          csv_filename: result.filename,
          completed_at: new Date().toISOString()
        })
        .eq('id', scrapeId);

      activeJobs.delete(scrapeId);
      return { success: true, scrapeId, stats, filename: result.filename };
    }
  } catch (error) {
    console.error(`Job ${scrapeId} failed:`, error);
    
    // Update scrape as failed
    await supabaseAdmin
      .from('scrapes')
      .update({ 
        status: 'failed',
        error_message: error.message || 'Unknown error',
        completed_at: new Date().toISOString()
      })
      .eq('id', scrapeId);

    // Clean up active job
    activeJobs.delete(scrapeId);

    throw error;
  }
}

/**
 * Create a background scrape job
 */
async function createScrapeJob(userId, username, filters, scraperKey) {
  // Create scrape record with pending status
  const { data: scrape, error } = await supabaseAdmin
    .from('scrapes')
    .insert({
      user_id: userId,
      username: username,
      filters: filters,
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating scrape record:', error);
    throw error;
  }

  const scrapeId = scrape.id;
  console.log(`Created scrape job ${scrapeId} for user ${userId}, username: ${username}`);

  // Start processing in background (don't await)
  const jobPromise = processScrapeJob(scrapeId, userId, username, filters, scraperKey)
    .catch(err => {
      console.error(`Background job ${scrapeId} error:`, err);
    });
  activeJobs.set(scrapeId, { promise: jobPromise });

  return scrapeId;
}

/**
 * Get job status
 */
async function getJobStatus(scrapeId, userId) {
  const { data: scrape, error } = await supabaseAdmin
    .from('scrapes')
    .select('id, status, stats, error_message, started_at, completed_at, csv_filename')
    .eq('id', scrapeId)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return scrape;
}

module.exports = {
  createScrapeJob,
  getJobStatus,
  processScrapeJob
};

