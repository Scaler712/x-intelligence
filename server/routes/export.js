const express = require('express');
const router = express.Router();
const { generateExcel } = require('../utils/excelGenerator');
const { generatePDF } = require('../utils/pdfGenerator');

// Export as Excel
router.post('/excel', async (req, res) => {
  try {
    const { tweets, analytics, username } = req.body;

    if (!tweets || !Array.isArray(tweets)) {
      return res.status(400).json({ error: 'Invalid tweets data' });
    }

    const buffer = await generateExcel(tweets, analytics, username || 'unknown');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${username || 'tweets'}_${Date.now()}.xlsx"`);
    res.send(buffer);
  } catch (error) {
    console.error('Excel export error:', error);
    res.status(500).json({ error: 'Failed to generate Excel file' });
  }
});

// Export as PDF
router.post('/pdf', async (req, res) => {
  try {
    const { tweets, analytics, username } = req.body;

    if (!tweets || !Array.isArray(tweets)) {
      return res.status(400).json({ error: 'Invalid tweets data' });
    }

    const buffer = await generatePDF(tweets, analytics, username || 'unknown');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${username || 'tweets'}_${Date.now()}.pdf"`);
    res.send(buffer);
  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({ error: 'Failed to generate PDF file' });
  }
});

module.exports = router;
