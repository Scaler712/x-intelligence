const PDFDocument = require('pdfkit');

/**
 * Generate enhanced PDF report from tweets, analytics, and AI insights
 * @param {Array} tweets - Array of tweet objects
 * @param {Object} analytics - Analytics data
 * @param {String} username - Twitter username
 * @param {Object} options - Additional options
 * @param {Object} options.aiInsights - AI insights data (optional)
 * @param {Boolean} options.includeCharts - Whether to include chart placeholders (default: false)
 * @returns {Promise<Buffer>} - PDF file buffer
 */
async function generatePDF(tweets, analytics, username, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        margin: 50,
        size: 'LETTER',
        info: {
          Title: `X Intelligence Report - @${username}`,
          Author: 'X Intelligence',
          Subject: 'Twitter Analytics Report',
          Creator: 'X Intelligence Platform'
        }
      });
      const chunks = [];

      // Collect data chunks
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Track page numbers for table of contents
      const tocPages = [];
      let currentPage = 1;

      // Cover page
      doc.fontSize(32).font('Helvetica-Bold').fillColor('#d4ff4a').text('X Intelligence', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(24).fillColor('#000000').text('Analytics Report', { align: 'center' });
      doc.moveDown(2);
      
      doc.fontSize(18).fillColor('#666666').text(`Profile: @${username}`, { align: 'center' });
      doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown(3);
      
      // Add branding footer
      doc.fontSize(10).fillColor('#999999').text('Powered by X Intelligence', { align: 'center' });
      
      // Table of Contents page
      doc.addPage();
      currentPage++;
      doc.fontSize(20).font('Helvetica-Bold').fillColor('#000000').text('Table of Contents', { align: 'center' });
      doc.moveDown(1.5);
      
      const tocItems = [
        { title: 'Summary Statistics', page: currentPage + 1 },
        { title: 'Top Performing Tweets', page: currentPage + 2 }
      ];
      
      if (options.aiInsights) {
        tocItems.push({ title: 'AI Insights & Recommendations', page: currentPage + 3 });
      }
      tocItems.push({ title: 'Full Tweet Analysis', page: currentPage + (options.aiInsights ? 4 : 3) });
      
      doc.fontSize(12).font('Helvetica');
      tocItems.forEach((item, index) => {
        doc.text(item.title, { indent: 20 });
        doc.text('...' + item.page, { 
          align: 'right',
          continued: false
        });
        doc.moveDown(0.5);
      });

      // Summary Statistics page
      doc.addPage();
      currentPage++;
      doc.fontSize(20).font('Helvetica-Bold').text('Summary Statistics');
      doc.moveDown(1);

      if (analytics) {
        // Create two-column layout for stats
        const leftStats = [
          { label: 'Total Tweets:', value: analytics.totalTweets || tweets.length },
          { label: 'Total Likes:', value: (analytics.totalLikes || 0).toLocaleString() },
          { label: 'Total Retweets:', value: (analytics.totalRetweets || 0).toLocaleString() },
          { label: 'Total Comments:', value: (analytics.totalComments || 0).toLocaleString() },
        ];
        
        const rightStats = [
          { label: 'Total Engagement:', value: (analytics.totalEngagement || 0).toLocaleString() },
          { label: 'Average Likes:', value: Math.round(analytics.avgLikes || 0).toLocaleString() },
          { label: 'Average Retweets:', value: Math.round(analytics.avgRetweets || 0).toLocaleString() },
          { label: 'Average Engagement:', value: Math.round(analytics.avgEngagement || 0).toLocaleString() },
        ];

        doc.fontSize(12).font('Helvetica');
        const startY = doc.y;
        leftStats.forEach((stat, index) => {
          doc.text(`${stat.label}`, { continued: true });
          doc.font('Helvetica-Bold').text(` ${stat.value}`, { continued: false });
          doc.font('Helvetica');
          doc.moveDown(0.5);
        });
        
        // Reset position for right column
        doc.y = startY;
        doc.x = 350;
        rightStats.forEach((stat) => {
          doc.text(`${stat.label}`, { continued: true });
          doc.font('Helvetica-Bold').text(` ${stat.value}`, { continued: false });
          doc.font('Helvetica');
          doc.moveDown(0.5);
        });
      }

      // Top Performing Tweets page
      doc.addPage();
      currentPage++;
      doc.fontSize(20).font('Helvetica-Bold').text('Top 10 Performing Tweets');
      doc.moveDown(1);

      const topTweets = [...tweets]
        .sort((a, b) => {
          const aEngagement = (a.likes || 0) + (a.retweets || 0) + (a.comments || 0);
          const bEngagement = (b.likes || 0) + (b.retweets || 0) + (b.comments || 0);
          return bEngagement - aEngagement;
        })
        .slice(0, 10);

      topTweets.forEach((tweet, index) => {
        const engagement = (tweet.likes || 0) + (tweet.retweets || 0) + (tweet.comments || 0);

        doc.fontSize(14).font('Helvetica-Bold').fillColor('#d4ff4a').text(`#${index + 1}`, { continued: true });
        doc.fontSize(12).fillColor('#000000').text(` ${engagement.toLocaleString()} total engagement`);
        doc.moveDown(0.3);
        
        doc.fontSize(11).font('Helvetica').text(tweet.content, {
          indent: 20,
          align: 'left'
        });
        doc.moveDown(0.3);
        
        doc.fontSize(9).fillColor('#666666').text(
          `❤️ ${(tweet.likes || 0).toLocaleString()} likes  |  🔄 ${(tweet.retweets || 0).toLocaleString()} retweets  |  💬 ${(tweet.comments || 0).toLocaleString()} comments`,
          { indent: 20 }
        );
        doc.fillColor('#000000');
        doc.moveDown(0.8);

        // Add page break if needed
        if (doc.y > 700) {
          doc.addPage();
          currentPage++;
        }
      });

      // AI Insights page (if provided)
      if (options.aiInsights) {
        doc.addPage();
        currentPage++;
        doc.fontSize(20).font('Helvetica-Bold').text('AI Insights & Recommendations');
        doc.moveDown(1);

        const insights = options.aiInsights;
        
        // Hook Patterns
        if (insights.hookPatterns && insights.hookPatterns.length > 0) {
          doc.fontSize(16).font('Helvetica-Bold').text('Hook Patterns', { underline: true });
          doc.moveDown(0.5);
          doc.fontSize(11).font('Helvetica');
          insights.hookPatterns.forEach((pattern, i) => {
            doc.text(`${i + 1}. ${pattern}`, { indent: 20 });
            doc.moveDown(0.4);
          });
          doc.moveDown(1);
        }

        // Content Themes
        if (insights.contentThemes && insights.contentThemes.length > 0) {
          doc.fontSize(16).font('Helvetica-Bold').text('Content Themes', { underline: true });
          doc.moveDown(0.5);
          doc.fontSize(11).font('Helvetica');
          insights.contentThemes.forEach((theme, i) => {
            doc.text(`${i + 1}. ${theme}`, { indent: 20 });
            doc.moveDown(0.4);
          });
          doc.moveDown(1);
        }

        // Recommendations
        if (insights.recommendations && insights.recommendations.length > 0) {
          doc.fontSize(16).font('Helvetica-Bold').text('Strategic Recommendations', { underline: true });
          doc.moveDown(0.5);
          doc.fontSize(11).font('Helvetica');
          insights.recommendations.forEach((rec, i) => {
            const priorityColor = rec.priority === 'high' ? '#d4ff4a' : rec.priority === 'medium' ? '#ffaa00' : '#999999';
            doc.font('Helvetica-Bold').fillColor(priorityColor).text(`${i + 1}. ${rec.title || rec.type}`, { indent: 20 });
            doc.font('Helvetica').fillColor('#000000');
            doc.moveDown(0.2);
            if (rec.description) {
              doc.fontSize(10).text(rec.description, { indent: 40 });
            }
            doc.moveDown(0.6);
          });
          doc.moveDown(1);
        }

        // Strategy Suggestions
        if (insights.strategySuggestions && insights.strategySuggestions.length > 0) {
          doc.fontSize(16).font('Helvetica-Bold').text('Strategy Suggestions', { underline: true });
          doc.moveDown(0.5);
          doc.fontSize(11).font('Helvetica');
          insights.strategySuggestions.forEach((suggestion, i) => {
            doc.text(`• ${suggestion}`, { indent: 20 });
            doc.moveDown(0.4);
          });
        }
      }

      // Full Tweet Analysis page (if requested)
      if (options.includeFullAnalysis !== false && tweets.length > 0) {
        doc.addPage();
        doc.fontSize(20).font('Helvetica-Bold').text('Full Tweet Analysis');
        doc.moveDown(1);

        // Show first 50 tweets with full content
        const displayTweets = tweets.slice(0, 50);
        displayTweets.forEach((tweet, index) => {
          const engagement = (tweet.likes || 0) + (tweet.retweets || 0) + (tweet.comments || 0);
          
          doc.fontSize(10).font('Helvetica-Bold').text(`Tweet ${index + 1} (${engagement.toLocaleString()} engagement)`);
          doc.fontSize(9).font('Helvetica').text(tweet.content, { indent: 15 });
          doc.fontSize(8).fillColor('#666666').text(
            `Likes: ${tweet.likes || 0} | Retweets: ${tweet.retweets || 0} | Comments: ${tweet.comments || 0}`,
            { indent: 15 }
          );
          doc.fillColor('#000000');
          doc.moveDown(0.5);

          if (doc.y > 750) {
            doc.addPage();
          }
        });
      }

      // Footer on all pages
      const addFooter = () => {
        const pageCount = doc.bufferedPageRange().count;
        for (let i = 0; i < pageCount; i++) {
          doc.switchToPage(i);
          doc.fontSize(8).fillColor('#999999').text(
            `Page ${i + 1} of ${pageCount} | Powered by X Intelligence`,
            { align: 'center', y: doc.page.height - 30 }
          );
        }
      };

      // Add footer after all content is added
      doc.on('pageAdded', () => {
        // Footer will be added at the end
      });

      // Finish PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generatePDF };
