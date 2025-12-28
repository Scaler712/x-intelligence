const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const exportService = require('../services/exportService');

/**
 * Generate export (PDF or Excel) from scrape
 * POST /api/export/generate
 * Body: { scrapeId, format: 'pdf' | 'excel', options: {...} }
 */
router.post('/generate', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { scrapeId, format, options = {} } = req.body;

    if (!scrapeId) {
      return res.status(400).json({ error: 'scrapeId is required' });
    }

    if (!format || !['pdf', 'excel'].includes(format)) {
      return res.status(400).json({ error: 'format must be "pdf" or "excel"' });
    }

    const result = await exportService.generateReport(userId, scrapeId, format, options);

    // Return buffer for direct download
    const contentType = format === 'pdf' 
      ? 'application/pdf' 
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const extension = format === 'pdf' ? 'pdf' : 'xlsx';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="export_${scrapeId}_${Date.now()}.${extension}"`);
    res.send(result.buffer);
  } catch (error) {
    console.error('Export generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate export' });
  }
});

/**
 * Get export history
 * GET /api/export/history
 * Query: ?limit=50
 */
router.get('/history', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;

    const history = await exportService.getExportHistory(userId, limit);

    res.json({ exports: history });
  } catch (error) {
    console.error('Get export history error:', error);
    res.status(500).json({ error: 'Failed to fetch export history' });
  }
});

/**
 * Get download URL for an export
 * GET /api/export/:id/download
 */
router.get('/:id/download', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const exportId = req.params.id;

    const url = await exportService.getExportDownloadUrl(userId, exportId);

    res.json({ url });
  } catch (error) {
    console.error('Get export URL error:', error);
    res.status(500).json({ error: error.message || 'Failed to get download URL' });
  }
});

// Legacy endpoints (for backward compatibility, can be removed later)
router.post('/excel', authenticate, async (req, res) => {
  try {
    const { scrapeId, options = {} } = req.body;
    if (!scrapeId) {
      return res.status(400).json({ error: 'scrapeId is required' });
    }
    const result = await exportService.generateReport(req.user.id, scrapeId, 'excel', options);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="export_${scrapeId}_${Date.now()}.xlsx"`);
    res.send(result.buffer);
  } catch (error) {
    console.error('Excel export error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate Excel file' });
  }
});

router.post('/pdf', authenticate, async (req, res) => {
  try {
    const { scrapeId, options = {} } = req.body;
    if (!scrapeId) {
      return res.status(400).json({ error: 'scrapeId is required' });
    }
    const result = await exportService.generateReport(req.user.id, scrapeId, 'pdf', options);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="export_${scrapeId}_${Date.now()}.pdf"`);
    res.send(result.buffer);
  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate PDF file' });
  }
});

module.exports = router;
