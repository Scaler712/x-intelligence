/**
 * Storage routes
 * Handles cloud storage operations (sync, upload, download, delete)
 */
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const storageService = require('../services/storageService');

/**
 * Sync local data to cloud
 * POST /api/storage/sync
 * Body: { scrapes: [...] }
 */
router.post('/sync', authenticate, async (req, res) => {
  try {
    const { scrapes } = req.body;
    const userId = req.user.id;

    if (!scrapes || !Array.isArray(scrapes)) {
      return res.status(400).json({ error: 'Scrapes array is required' });
    }

    const results = await storageService.syncToCloud(userId, scrapes);

    res.json({
      message: 'Sync completed',
      results
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Failed to sync data to cloud' });
  }
});

/**
 * List user's scrapes in cloud storage
 * GET /api/storage/scrapes
 */
router.get('/scrapes', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const files = await storageService.listUserFiles(storageService.BUCKETS.SCRAPES, userId);

    // Extract scrape IDs from filenames
    const scrapes = files
      .filter(file => file.name.endsWith('.json'))
      .map(file => ({
        id: file.name.replace('.json', ''),
        name: file.name,
        size: file.metadata?.size || 0,
        created_at: file.created_at,
        updated_at: file.updated_at
      }));

    res.json({ scrapes });
  } catch (error) {
    console.error('List scrapes error:', error);
    res.status(500).json({ error: 'Failed to list scrapes' });
  }
});

/**
 * Download specific scrape from cloud
 * GET /api/storage/scrape/:id
 */
router.get('/scrape/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const scrapeId = req.params.id;

    const data = await storageService.downloadScrape(userId, scrapeId);

    if (!data) {
      return res.status(404).json({ error: 'Scrape not found' });
    }

    res.json({ scrape: data });
  } catch (error) {
    console.error('Download scrape error:', error);
    res.status(500).json({ error: 'Failed to download scrape' });
  }
});

/**
 * Delete scrape from cloud storage
 * DELETE /api/storage/scrape/:id
 */
router.delete('/scrape/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const scrapeId = req.params.id;

    await storageService.deleteScrape(userId, scrapeId);

    res.json({ message: 'Scrape deleted successfully' });
  } catch (error) {
    console.error('Delete scrape error:', error);
    res.status(500).json({ error: 'Failed to delete scrape' });
  }
});

/**
 * Get signed URL for download
 * GET /api/storage/download/:bucket/:path
 */
router.get('/download/:bucket/:path(*)', authenticate, async (req, res) => {
  try {
    const { bucket, path } = req.params;
    const userId = req.user.id;

    // Verify path belongs to user
    if (!path.startsWith(userId + '/')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Validate bucket
    const validBuckets = Object.values(storageService.BUCKETS);
    if (!validBuckets.includes(bucket)) {
      return res.status(400).json({ error: 'Invalid bucket' });
    }

    const url = await storageService.getFileUrl(bucket, path, 3600); // 1 hour expiry

    res.json({ url });
  } catch (error) {
    console.error('Get download URL error:', error);
    res.status(500).json({ error: 'Failed to generate download URL' });
  }
});

module.exports = router;


