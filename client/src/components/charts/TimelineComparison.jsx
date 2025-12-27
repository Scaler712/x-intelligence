import { useMemo } from 'react';
import MultiLineChart from './MultiLineChart';
import { CHART_COLORS, formatDate } from '../../constants/chartConfigs';

/**
 * Timeline comparison chart for comparing engagement across multiple profiles/scrapes
 * @param {Array} scrapes - Array of scrape objects: { id, username, tweets }
 * @param {String} metric - Metric to compare: 'likes', 'retweets', 'comments', 'total'
 */
export default function TimelineComparison({ scrapes, metric = 'total' }) {
  const chartData = useMemo(() => {
    if (!scrapes || scrapes.length === 0) return [];

    // Collect all unique dates across all scrapes
    const dateMap = new Map();

    scrapes.forEach(scrape => {
      scrape.tweets.forEach(tweet => {
        const date = new Date(tweet.date);
        if (isNaN(date.getTime())) return;

        const dateKey = formatDate(date);
        if (!dateMap.has(dateKey)) {
          dateMap.set(dateKey, { date: dateKey, dateObj: date });
        }
      });
    });

    // Sort dates
    const sortedDates = Array.from(dateMap.values()).sort((a, b) => a.dateObj - b.dateObj);

    // For each date, calculate average metric for each scrape
    const data = sortedDates.map(({ date, dateObj }) => {
      const dataPoint = { date };

      scrapes.forEach(scrape => {
        // Get tweets for this date
        const tweetsOnDate = scrape.tweets.filter(tweet => {
          const tweetDate = new Date(tweet.date);
          return formatDate(tweetDate) === date;
        });

        if (tweetsOnDate.length > 0) {
          let value = 0;
          if (metric === 'total') {
            value = tweetsOnDate.reduce((sum, t) => sum + (t.likes || 0) + (t.retweets || 0) + (t.comments || 0), 0) / tweetsOnDate.length;
          } else {
            value = tweetsOnDate.reduce((sum, t) => sum + (t[metric] || 0), 0) / tweetsOnDate.length;
          }
          dataPoint[scrape.username] = Math.round(value);
        } else {
          dataPoint[scrape.username] = 0;
        }
      });

      return dataPoint;
    });

    return data;
  }, [scrapes, metric]);

  const lines = useMemo(() => {
    if (!scrapes) return [];

    const colors = [
      CHART_COLORS.primary,
      CHART_COLORS.secondary,
      CHART_COLORS.tertiary,
      CHART_COLORS.quaternary,
      CHART_COLORS.retweets,
    ];

    return scrapes.map((scrape, index) => ({
      dataKey: scrape.username,
      name: scrape.username,
      color: colors[index % colors.length],
    }));
  }, [scrapes]);

  const metricLabel = {
    likes: 'Likes',
    retweets: 'Retweets',
    comments: 'Comments',
    total: 'Total Engagement',
  }[metric];

  return (
    <MultiLineChart
      data={chartData}
      lines={lines}
      xAxisKey="date"
      title="Profile Comparison"
      subtitle={`Comparing ${metricLabel} over time`}
    />
  );
}
