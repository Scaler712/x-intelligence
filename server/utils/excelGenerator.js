const ExcelJS = require('exceljs');

/**
 * Generate Excel file from tweets and analytics
 * @param {Array} tweets - Array of tweet objects
 * @param {Object} analytics - Analytics data
 * @param {String} username - Twitter username
 * @returns {Promise<Buffer>} - Excel file buffer
 */
async function generateExcel(tweets, analytics, username) {
  const workbook = new ExcelJS.Workbook();

  // Create tweets sheet
  const tweetsSheet = workbook.addWorksheet('Tweets');

  // Add headers with styling
  tweetsSheet.columns = [
    { header: 'Content', key: 'content', width: 60 },
    { header: 'Likes', key: 'likes', width: 12 },
    { header: 'Retweets', key: 'retweets', width: 12 },
    { header: 'Comments', key: 'comments', width: 12 },
    { header: 'Total Engagement', key: 'totalEngagement', width: 18 },
    { header: 'Date', key: 'date', width: 20 },
  ];

  // Style header row
  tweetsSheet.getRow(1).font = { bold: true };
  tweetsSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD4FF4A' }, // electric-lime
  };

  // Add tweet data
  tweets.forEach(tweet => {
    tweetsSheet.addRow({
      content: tweet.content,
      likes: tweet.likes || 0,
      retweets: tweet.retweets || 0,
      comments: tweet.comments || 0,
      totalEngagement: (tweet.likes || 0) + (tweet.retweets || 0) + (tweet.comments || 0),
      date: new Date(tweet.date).toLocaleString(),
    });
  });

  // Create analytics sheet
  const analyticsSheet = workbook.addWorksheet('Analytics Summary');
  analyticsSheet.columns = [
    { header: 'Metric', key: 'metric', width: 30 },
    { header: 'Value', key: 'value', width: 20 },
  ];

  // Style analytics header
  analyticsSheet.getRow(1).font = { bold: true };
  analyticsSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD4FF4A' },
  };

  // Add analytics data
  if (analytics) {
    analyticsSheet.addRow({ metric: 'Total Tweets', value: analytics.totalTweets || tweets.length });
    analyticsSheet.addRow({ metric: 'Total Likes', value: analytics.totalLikes || 0 });
    analyticsSheet.addRow({ metric: 'Total Retweets', value: analytics.totalRetweets || 0 });
    analyticsSheet.addRow({ metric: 'Total Comments', value: analytics.totalComments || 0 });
    analyticsSheet.addRow({ metric: 'Total Engagement', value: analytics.totalEngagement || 0 });
    analyticsSheet.addRow({ metric: '', value: '' }); // Empty row
    analyticsSheet.addRow({ metric: 'Average Likes', value: analytics.avgLikes || 0 });
    analyticsSheet.addRow({ metric: 'Average Retweets', value: analytics.avgRetweets || 0 });
    analyticsSheet.addRow({ metric: 'Average Comments', value: analytics.avgComments || 0 });
    analyticsSheet.addRow({ metric: 'Average Engagement', value: analytics.avgEngagement || 0 });
  }

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

module.exports = { generateExcel };
