const PDFDocument = require('pdfkit');

/**
 * Generate PDF report from tweets and analytics
 * @param {Array} tweets - Array of tweet objects
 * @param {Object} analytics - Analytics data
 * @param {String} username - Twitter username
 * @returns {Promise<Buffer>} - PDF file buffer
 */
async function generatePDF(tweets, analytics, username) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      // Collect data chunks
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Title
      doc.fontSize(24).font('Helvetica-Bold').text('Twitter Analytics Report', { align: 'center' });
      doc.moveDown();

      // Username
      doc.fontSize(16).font('Helvetica').text(`Profile: @${username}`, { align: 'center' });
      doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown(2);

      // Analytics Summary
      doc.fontSize(18).font('Helvetica-Bold').text('Summary Statistics');
      doc.moveDown(0.5);

      if (analytics) {
        const stats = [
          { label: 'Total Tweets:', value: analytics.totalTweets || tweets.length },
          { label: 'Total Likes:', value: (analytics.totalLikes || 0).toLocaleString() },
          { label: 'Total Retweets:', value: (analytics.totalRetweets || 0).toLocaleString() },
          { label: 'Total Comments:', value: (analytics.totalComments || 0).toLocaleString() },
          { label: 'Total Engagement:', value: (analytics.totalEngagement || 0).toLocaleString() },
          { label: 'Average Likes:', value: Math.round(analytics.avgLikes || 0).toLocaleString() },
          { label: 'Average Retweets:', value: Math.round(analytics.avgRetweets || 0).toLocaleString() },
          { label: 'Average Comments:', value: Math.round(analytics.avgComments || 0).toLocaleString() },
          { label: 'Average Engagement:', value: Math.round(analytics.avgEngagement || 0).toLocaleString() },
        ];

        doc.fontSize(12).font('Helvetica');
        stats.forEach(stat => {
          doc.text(`${stat.label} ${stat.value}`);
          doc.moveDown(0.3);
        });
      }

      doc.moveDown(1);

      // Top Performing Tweets
      doc.fontSize(18).font('Helvetica-Bold').text('Top 10 Performing Tweets');
      doc.moveDown(0.5);

      const topTweets = [...tweets]
        .sort((a, b) => {
          const aEngagement = (a.likes || 0) + (a.retweets || 0) + (a.comments || 0);
          const bEngagement = (b.likes || 0) + (b.retweets || 0) + (b.comments || 0);
          return bEngagement - aEngagement;
        })
        .slice(0, 10);

      topTweets.forEach((tweet, index) => {
        const engagement = (tweet.likes || 0) + (tweet.retweets || 0) + (tweet.comments || 0);

        doc.fontSize(12).font('Helvetica-Bold').text(`#${index + 1} (${engagement.toLocaleString()} engagement)`);
        doc.fontSize(10).font('Helvetica').text(tweet.content.substring(0, 200) + (tweet.content.length > 200 ? '...' : ''), {
          indent: 20,
        });
        doc.fontSize(9).text(
          `Likes: ${tweet.likes || 0} | Retweets: ${tweet.retweets || 0} | Comments: ${tweet.comments || 0}`,
          { indent: 20, color: '#666666' }
        );
        doc.moveDown(0.5);

        // Add page break if needed (avoiding cutting content)
        if (doc.y > 700) {
          doc.addPage();
        }
      });

      // Finish PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generatePDF };
