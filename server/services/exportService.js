/**
 * Export service
 * Handles unified export generation and cloud storage upload
 */
const { generatePDF } = require('../utils/pdfGenerator');
const { generateExcel } = require('../utils/excelGenerator');
const storageService = require('./storageService');
const { supabaseAdmin } = require('./supabaseClient');
const { randomUUID } = require('crypto');

/**
 * Generate a report (PDF or Excel)
 * @param {string} userId - User ID
 * @param {string} scrapeId - Scrape ID
 * @param {string} format - Export format ('pdf' or 'excel')
 * @param {Object} options - Export options
 * @param {boolean} options.includeAIInsights - Include AI insights if available
 * @param {boolean} options.includeFullAnalysis - Include full tweet analysis
 * @returns {Promise<Object>} - Export result with cloud path
 */
async function generateReport(userId, scrapeId, format, options = {}) {
  try {
    // Load scrape and tweets from database
    const { data: scrape, error: scrapeError } = await supabaseAdmin
      .from('scrapes')
      .select('id, username, stats')
      .eq('id', scrapeId)
      .eq('user_id', userId)
      .single();

    if (scrapeError || !scrape) {
      throw new Error('Scrape not found');
    }

    const { data: tweets, error: tweetsError } = await supabaseAdmin
      .from('tweets')
      .select('content, likes, retweets, comments, date')
      .eq('scrape_id', scrapeId)
      .order('date', { ascending: false });

    if (tweetsError) {
      throw new Error('Failed to fetch tweets');
    }

    if (!tweets || tweets.length === 0) {
      throw new Error('No tweets found for this scrape');
    }

    // Deduplicate tweets by content + date (keep highest engagement)
    const uniqueTweets = new Map();
    tweets.forEach(tweet => {
      const key = `${tweet.content}|${tweet.date || ''}`;
      if (!uniqueTweets.has(key)) {
        uniqueTweets.set(key, tweet);
      } else {
        const existing = uniqueTweets.get(key);
        const existingEng = (existing.likes || 0) + (existing.retweets || 0) + (existing.comments || 0);
        const newEng = (tweet.likes || 0) + (tweet.retweets || 0) + (tweet.comments || 0);
        if (newEng > existingEng) {
          uniqueTweets.set(key, tweet);
        }
      }
    });
    const deduplicatedTweets = Array.from(uniqueTweets.values());

    // Calculate analytics if not present
    let analytics = scrape.stats || {};
    if (!analytics.totalTweets) {
      const totalEngagement = deduplicatedTweets.reduce((sum, t) => 
        sum + (t.likes || 0) + (t.retweets || 0) + (t.comments || 0), 0
      );
      analytics = {
        totalTweets: deduplicatedTweets.length,
        totalLikes: deduplicatedTweets.reduce((sum, t) => sum + (t.likes || 0), 0),
        totalRetweets: deduplicatedTweets.reduce((sum, t) => sum + (t.retweets || 0), 0),
        totalComments: deduplicatedTweets.reduce((sum, t) => sum + (t.comments || 0), 0),
        totalEngagement: totalEngagement,
        avgEngagement: totalEngagement / deduplicatedTweets.length,
        maxEngagement: Math.max(...deduplicatedTweets.map(t => 
          (t.likes || 0) + (t.retweets || 0) + (t.comments || 0)
        ))
      };
    }

    // Load AI insights if requested
    let aiInsights = null;
    if (options.includeAIInsights) {
      const { data: insights } = await supabaseAdmin
        .from('ai_insights')
        .select('insights, provider')
        .eq('scrape_id', scrapeId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (insights) {
        aiInsights = insights.insights;
      }
    }

    // Generate export file
    let buffer;
    if (format === 'pdf') {
      buffer = await generatePDF(deduplicatedTweets, analytics, scrape.username, {
        aiInsights: aiInsights,
        includeFullAnalysis: options.includeFullAnalysis !== false
      });
    } else if (format === 'excel') {
      buffer = await generateExcel(deduplicatedTweets, analytics, scrape.username, {
        aiInsights: aiInsights
      });
    } else {
      throw new Error(`Unsupported format: ${format}`);
    }

    // Upload to cloud storage
    const exportId = randomUUID();
    const cloudPath = await storageService.uploadExport(userId, exportId, buffer, format);

    // Save export record to database
    const { data: exportRecord, error: exportError } = await supabaseAdmin
      .from('exports')
      .insert({
        user_id: userId,
        scrape_id: scrapeId,
        format: format,
        cloud_path: cloudPath,
        file_size: buffer.length,
        options: options
      })
      .select()
      .single();

    if (exportError) {
      console.error('Error saving export record:', exportError);
      // Don't fail if we can't save the record
    }

    return {
      exportId: exportId,
      cloudPath: cloudPath,
      format: format,
      fileSize: buffer.length,
      buffer: buffer, // Include buffer for direct download
      record: exportRecord
    };
  } catch (error) {
    console.error('Export generation error:', error);
    throw error;
  }
}

/**
 * Get export history for a user
 * @param {string} userId - User ID
 * @param {number} limit - Number of records to return
 * @returns {Promise<Array>} - Array of export records
 */
async function getExportHistory(userId, limit = 50) {
  try {
    const { data, error } = await supabaseAdmin
      .from('exports')
      .select('id, scrape_id, format, cloud_path, file_size, options, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error('Failed to fetch export history');
    }

    return data || [];
  } catch (error) {
    console.error('Get export history error:', error);
    throw error;
  }
}

/**
 * Get signed URL for downloading an export
 * @param {string} userId - User ID
 * @param {string} exportId - Export ID
 * @returns {Promise<string>} - Signed URL
 */
async function getExportDownloadUrl(userId, exportId) {
  try {
    // Get export record to verify ownership
    const { data: exportRecord, error } = await supabaseAdmin
      .from('exports')
      .select('cloud_path')
      .eq('id', exportId)
      .eq('user_id', userId)
      .single();

    if (error || !exportRecord) {
      throw new Error('Export not found');
    }

    // Generate signed URL
    const url = await storageService.getFileUrl(
      storageService.BUCKETS.EXPORTS,
      exportRecord.cloud_path,
      3600 // 1 hour expiry
    );

    return url;
  } catch (error) {
    console.error('Get export URL error:', error);
    throw error;
  }
}

module.exports = {
  generateReport,
  getExportHistory,
  getExportDownloadUrl
};

