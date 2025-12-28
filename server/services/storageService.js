/**
 * Storage service for Supabase Storage
 * Handles uploading, downloading, and managing files in cloud storage
 */
const { supabaseAdmin } = require('../services/supabaseClient');
const config = require('../config');

const BUCKETS = {
  SCRAPES: 'scrapes',
  EXPORTS: 'exports',
  BACKUPS: 'backups'
};

/**
 * Initialize storage buckets (run once)
 * This should be done via Supabase dashboard or a setup script
 */
async function initializeBuckets() {
  // Check if buckets exist and create them if they don't
  // Note: This requires admin privileges and should typically be done manually
  const buckets = [BUCKETS.SCRAPES, BUCKETS.EXPORTS, BUCKETS.BACKUPS];
  
  for (const bucket of buckets) {
    try {
      const { data, error } = await supabaseAdmin.storage.getBucket(bucket);
      if (error && error.message.includes('not found')) {
        // Create bucket (this requires service role key)
        await supabaseAdmin.storage.createBucket(bucket, {
          public: false,
          fileSizeLimit: 52428800, // 50MB
          allowedMimeTypes: ['application/json', 'text/csv', 'application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
        });
      }
    } catch (err) {
      console.error(`Error initializing bucket ${bucket}:`, err);
    }
  }
}

/**
 * Upload scrape data to cloud storage
 * @param {string} userId - User ID
 * @param {string} scrapeId - Scrape ID
 * @param {Object} data - Scrape data (tweets array, metadata)
 * @returns {Promise<string>} - Cloud storage path
 */
async function uploadScrape(userId, scrapeId, data) {
  try {
    const fileName = `${userId}/${scrapeId}.json`;
    const fileContent = JSON.stringify(data);
    const fileBuffer = Buffer.from(fileContent, 'utf8');

    const { data: uploadData, error } = await supabaseAdmin.storage
      .from(BUCKETS.SCRAPES)
      .upload(fileName, fileBuffer, {
        contentType: 'application/json',
        upsert: true
      });

    if (error) {
      console.error('Upload error:', error);
      throw new Error(`Failed to upload scrape: ${error.message}`);
    }

    return uploadData.path;
  } catch (error) {
    console.error('Error uploading scrape:', error);
    throw error;
  }
}

/**
 * Download scrape data from cloud storage
 * @param {string} userId - User ID
 * @param {string} scrapeId - Scrape ID
 * @returns {Promise<Object>} - Scrape data
 */
async function downloadScrape(userId, scrapeId) {
  try {
    const fileName = `${userId}/${scrapeId}.json`;

    const { data, error } = await supabaseAdmin.storage
      .from(BUCKETS.SCRAPES)
      .download(fileName);

    if (error) {
      if (error.message.includes('not found')) {
        return null;
      }
      throw new Error(`Failed to download scrape: ${error.message}`);
    }

    const text = await data.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Error downloading scrape:', error);
    throw error;
  }
}

/**
 * Delete scrape data from cloud storage
 * @param {string} userId - User ID
 * @param {string} scrapeId - Scrape ID
 */
async function deleteScrape(userId, scrapeId) {
  try {
    const fileName = `${userId}/${scrapeId}.json`;

    const { error } = await supabaseAdmin.storage
      .from(BUCKETS.SCRAPES)
      .remove([fileName]);

    if (error) {
      console.error('Delete error:', error);
      throw new Error(`Failed to delete scrape: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting scrape:', error);
    throw error;
  }
}

/**
 * Upload export file to cloud storage
 * @param {string} userId - User ID
 * @param {string} exportId - Export ID
 * @param {Buffer} buffer - File buffer
 * @param {string} format - File format ('pdf' or 'excel')
 * @returns {Promise<string>} - Cloud storage path
 */
async function uploadExport(userId, exportId, buffer, format) {
  try {
    const extension = format === 'pdf' ? 'pdf' : 'xlsx';
    const mimeType = format === 'pdf' 
      ? 'application/pdf' 
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    
    const fileName = `${userId}/${exportId}.${extension}`;

    const { data, error } = await supabaseAdmin.storage
      .from(BUCKETS.EXPORTS)
      .upload(fileName, buffer, {
        contentType: mimeType,
        upsert: true
      });

    if (error) {
      console.error('Export upload error:', error);
      throw new Error(`Failed to upload export: ${error.message}`);
    }

    return data.path;
  } catch (error) {
    console.error('Error uploading export:', error);
    throw error;
  }
}

/**
 * Get public URL for a file (if bucket is public)
 * Or generate a signed URL (if bucket is private)
 * @param {string} bucket - Bucket name
 * @param {string} path - File path
 * @param {number} expiresIn - Expiration in seconds (default 3600)
 * @returns {Promise<string>} - File URL
 */
async function getFileUrl(bucket, path, expiresIn = 3600) {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      throw new Error(`Failed to generate URL: ${error.message}`);
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Error generating file URL:', error);
    throw error;
  }
}

/**
 * List user's files in a bucket
 * @param {string} bucket - Bucket name
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - List of files
 */
async function listUserFiles(bucket, userId) {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .list(userId, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      throw new Error(`Failed to list files: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
}

/**
 * Sync local data to cloud storage
 * @param {string} userId - User ID
 * @param {Array} localScrapes - Array of local scrape data
 * @returns {Promise<Object>} - Sync results
 */
async function syncToCloud(userId, localScrapes) {
  const results = {
    uploaded: 0,
    failed: 0,
    errors: []
  };

  for (const scrape of localScrapes) {
    try {
      await uploadScrape(userId, scrape.id, scrape);
      results.uploaded++;
    } catch (error) {
      results.failed++;
      results.errors.push({
        scrapeId: scrape.id,
        error: error.message
      });
    }
  }

  return results;
}

module.exports = {
  initializeBuckets,
  uploadScrape,
  downloadScrape,
  deleteScrape,
  uploadExport,
  getFileUrl,
  listUserFiles,
  syncToCloud,
  BUCKETS
};


