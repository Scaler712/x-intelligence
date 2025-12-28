const ExcelJS = require('exceljs');

/**
 * Generate enhanced Excel file from tweets, analytics, and AI insights
 * @param {Array} tweets - Array of tweet objects
 * @param {Object} analytics - Analytics data
 * @param {String} username - Twitter username
 * @param {Object} options - Additional options
 * @param {Object} options.aiInsights - AI insights data (optional)
 * @returns {Promise<Buffer>} - Excel file buffer
 */
async function generateExcel(tweets, analytics, username, options = {}) {
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

  // Add analytics data with better formatting
  if (analytics) {
    analyticsSheet.addRow({ metric: 'Total Tweets', value: analytics.totalTweets || tweets.length });
    analyticsSheet.addRow({ metric: 'Total Likes', value: analytics.totalLikes || 0 });
    analyticsSheet.addRow({ metric: 'Total Retweets', value: analytics.totalRetweets || 0 });
    analyticsSheet.addRow({ metric: 'Total Comments', value: analytics.totalComments || 0 });
    analyticsSheet.addRow({ metric: 'Total Engagement', value: analytics.totalEngagement || 0 });
    analyticsSheet.addRow({ metric: '', value: '' }); // Empty row
    analyticsSheet.addRow({ metric: 'Average Likes', value: Math.round(analytics.avgLikes || 0) });
    analyticsSheet.addRow({ metric: 'Average Retweets', value: Math.round(analytics.avgRetweets || 0) });
    analyticsSheet.addRow({ metric: 'Average Comments', value: Math.round(analytics.avgComments || 0) });
    analyticsSheet.addRow({ metric: 'Average Engagement', value: Math.round(analytics.avgEngagement || 0) });
  }

  // AI Insights sheet (if provided)
  if (options.aiInsights) {
    const insightsSheet = workbook.addWorksheet('AI Insights');
    const insights = options.aiInsights;

    // Hook Patterns
    insightsSheet.columns = [
      { header: 'Hook Pattern', key: 'pattern', width: 60 }
    ];
    insightsSheet.getRow(1).font = { bold: true };
    insightsSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD4FF4A' }
    };

    if (insights.hookPatterns && insights.hookPatterns.length > 0) {
      insights.hookPatterns.forEach(pattern => {
        insightsSheet.addRow({ pattern });
      });
    }

    insightsSheet.addRow({ pattern: '' }); // Empty row

    // Content Themes
    const themesHeaderRow = insightsSheet.addRow({ pattern: 'Content Themes' });
    themesHeaderRow.font = { bold: true };
    insightsSheet.addRow({ pattern: '' });

    if (insights.contentThemes && insights.contentThemes.length > 0) {
      insights.contentThemes.forEach(theme => {
        insightsSheet.addRow({ pattern: theme });
      });
    }

    insightsSheet.addRow({ pattern: '' }); // Empty row

    // Recommendations
    const recHeaderRow = insightsSheet.addRow({ pattern: 'Recommendations' });
    recHeaderRow.font = { bold: true };
    insightsSheet.addRow({ pattern: '' });

    if (insights.recommendations && insights.recommendations.length > 0) {
      insights.recommendations.forEach(rec => {
        insightsSheet.addRow({ pattern: `${rec.title || rec.type}: ${rec.description || ''}` });
      });
    }

    // Strategy Suggestions
    insightsSheet.addRow({ pattern: '' });
    const strategyHeaderRow = insightsSheet.addRow({ pattern: 'Strategy Suggestions' });
    strategyHeaderRow.font = { bold: true };
    insightsSheet.addRow({ pattern: '' });

    if (insights.strategySuggestions && insights.strategySuggestions.length > 0) {
      insights.strategySuggestions.forEach(suggestion => {
        insightsSheet.addRow({ pattern: suggestion });
      });
    }
  }

  // Performance Analysis sheet with conditional formatting
  const analysisSheet = workbook.addWorksheet('Performance Analysis');
  analysisSheet.columns = [
    { header: 'Engagement Range', key: 'range', width: 30 },
    { header: 'Count', key: 'count', width: 15 },
    { header: 'Percentage', key: 'percentage', width: 20 }
  ];

  analysisSheet.getRow(1).font = { bold: true };
  analysisSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD4FF4A' }
  };

  // Calculate engagement distribution
  const ranges = [
    { min: 0, max: 100, label: '0-100' },
    { min: 101, max: 500, label: '101-500' },
    { min: 501, max: 1000, label: '501-1,000' },
    { min: 1001, max: 5000, label: '1,001-5,000' },
    { min: 5001, max: Infinity, label: '5,001+' }
  ];

  ranges.forEach(range => {
    const count = tweets.filter(t => {
      const engagement = (t.likes || 0) + (t.retweets || 0) + (t.comments || 0);
      return engagement >= range.min && engagement <= range.max;
    }).length;
    const percentage = tweets.length > 0 ? ((count / tweets.length) * 100).toFixed(1) : 0;

    analysisSheet.addRow({
      range: range.label,
      count: count,
      percentage: `${percentage}%`
    });
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

module.exports = { generateExcel };
