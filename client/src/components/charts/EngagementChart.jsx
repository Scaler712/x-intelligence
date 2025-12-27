import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import '../../styles/electric.css';
import {
  CHART_COLORS,
  CHART_STYLES,
  TOOLTIP_STYLE,
  DEFAULT_CHART_HEIGHT,
  formatDate,
  formatNumber,
  customTooltipFormatter,
} from '../../constants/chartConfigs';

export default function EngagementChart({ tweets }) {
  const chartData = useMemo(() => {
    if (tweets.length === 0) return [];

    // Sort tweets by date and format for Recharts
    return [...tweets]
      .map(tweet => ({
        ...tweet,
        date: new Date(tweet.date),
        likes: tweet.likes || 0,
        retweets: tweet.retweets || 0,
        comments: tweet.comments || 0,
        totalEngagement: (tweet.likes || 0) + (tweet.retweets || 0) + (tweet.comments || 0),
      }))
      .filter(tweet => !isNaN(tweet.date.getTime()))
      .sort((a, b) => a.date - b.date)
      .map(tweet => ({
        date: formatDate(tweet.date),
        dateObj: tweet.date,
        likes: tweet.likes,
        retweets: tweet.retweets,
        comments: tweet.comments,
        content: tweet.content,
      }));
  }, [tweets]);

  if (tweets.length === 0) {
    return (
      <div className="bg-electric-dark border border-electric-border rounded-xl p-6">
        <h3 className="electric-heading text-xl text-electric-text mb-2">
          Engagement Timeline
        </h3>
        <p className="electric-body text-electric-text-muted">
          No data available yet. Start scraping to see engagement over time.
        </p>
      </div>
    );
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={TOOLTIP_STYLE.contentStyle}>
          <p style={TOOLTIP_STYLE.labelStyle}>{label}</p>
          <p className="text-sm text-electric-text-muted mb-2 line-clamp-2">
            {data.content?.substring(0, 100)}...
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, marginBottom: '4px' }}>
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-electric-dark border border-electric-border rounded-xl p-6">
      <div className="mb-4">
        <h3 className="electric-heading text-xl text-electric-text mb-2">
          Engagement Timeline
        </h3>
        <p className="electric-body text-sm text-electric-text-muted">
          Engagement metrics over time
        </p>
      </div>

      <ResponsiveContainer width="100%" height={DEFAULT_CHART_HEIGHT}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
          <XAxis
            dataKey="date"
            stroke={CHART_COLORS.text}
            tick={{ fill: CHART_COLORS.text, fontSize: 12 }}
            tickLine={{ stroke: CHART_COLORS.text }}
          />
          <YAxis
            stroke={CHART_COLORS.text}
            tick={{ fill: CHART_COLORS.text, fontSize: 12 }}
            tickLine={{ stroke: CHART_COLORS.text }}
            tickFormatter={formatNumber}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ color: CHART_COLORS.text }}
            iconType="line"
            formatter={(value) => {
              const labels = { likes: 'Likes', retweets: 'Retweets', comments: 'Comments' };
              return labels[value] || value;
            }}
          />
          <Line
            type="monotone"
            dataKey="likes"
            name="likes"
            stroke={CHART_COLORS.likes}
            strokeWidth={CHART_STYLES.lineChart.strokeWidth}
            dot={CHART_STYLES.lineChart.dot}
            activeDot={CHART_STYLES.lineChart.activeDot}
          />
          <Line
            type="monotone"
            dataKey="retweets"
            name="retweets"
            stroke={CHART_COLORS.retweets}
            strokeWidth={CHART_STYLES.lineChart.strokeWidth}
            dot={CHART_STYLES.lineChart.dot}
            activeDot={CHART_STYLES.lineChart.activeDot}
          />
          <Line
            type="monotone"
            dataKey="comments"
            name="comments"
            stroke={CHART_COLORS.comments}
            strokeWidth={CHART_STYLES.lineChart.strokeWidth}
            dot={CHART_STYLES.lineChart.dot}
            activeDot={CHART_STYLES.lineChart.activeDot}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
