import { useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
} from 'recharts';
import '../../styles/electric.css';
import {
  CHART_COLORS,
  CHART_STYLES,
  TOOLTIP_STYLE,
  DEFAULT_CHART_HEIGHT,
  formatNumber,
} from '../../constants/chartConfigs';

export default function ScatterPlot({ tweets }) {
  const chartData = useMemo(() => {
    if (tweets.length === 0) return [];

    return tweets.map(tweet => ({
      likes: tweet.likes || 0,
      retweets: tweet.retweets || 0,
      comments: tweet.comments || 0,
      content: tweet.content,
      totalEngagement: (tweet.likes || 0) + (tweet.retweets || 0) + (tweet.comments || 0),
    }));
  }, [tweets]);

  if (tweets.length === 0) {
    return (
      <div className="bg-electric-dark border border-electric-border rounded-xl p-6">
        <h3 className="electric-heading text-xl text-electric-text mb-2">
          Engagement Scatter Plot
        </h3>
        <p className="electric-body text-electric-text-muted">
          No data available yet.
        </p>
      </div>
    );
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={TOOLTIP_STYLE.contentStyle}>
          <p className="text-sm text-electric-text-muted mb-2 line-clamp-2">
            {data.content?.substring(0, 100)}...
          </p>
          <p style={{ color: CHART_COLORS.likes, marginBottom: '4px' }}>
            Likes: {data.likes.toLocaleString()}
          </p>
          <p style={{ color: CHART_COLORS.retweets, marginBottom: '4px' }}>
            Retweets: {data.retweets.toLocaleString()}
          </p>
          <p style={{ color: CHART_COLORS.comments, marginBottom: '4px' }}>
            Comments: {data.comments.toLocaleString()}
          </p>
          <p style={{ color: CHART_COLORS.engagement, marginTop: '8px', fontWeight: 'bold' }}>
            Total: {data.totalEngagement.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-electric-dark border border-electric-border rounded-xl p-6">
      <div className="mb-4">
        <h3 className="electric-heading text-xl text-electric-text mb-2">
          Likes vs Retweets Correlation
        </h3>
        <p className="electric-body text-sm text-electric-text-muted">
          Relationship between likes and retweets (bubble size = comments)
        </p>
      </div>

      <ResponsiveContainer width="100%" height={DEFAULT_CHART_HEIGHT}>
        <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
          <XAxis
            type="number"
            dataKey="likes"
            name="Likes"
            stroke={CHART_COLORS.text}
            tick={{ fill: CHART_COLORS.text, fontSize: 12 }}
            tickLine={{ stroke: CHART_COLORS.text }}
            tickFormatter={formatNumber}
            label={{
              value: 'Likes',
              position: 'insideBottom',
              offset: -10,
              style: { fill: CHART_COLORS.text, fontSize: 14 },
            }}
          />
          <YAxis
            type="number"
            dataKey="retweets"
            name="Retweets"
            stroke={CHART_COLORS.text}
            tick={{ fill: CHART_COLORS.text, fontSize: 12 }}
            tickLine={{ stroke: CHART_COLORS.text }}
            tickFormatter={formatNumber}
            label={{
              value: 'Retweets',
              angle: -90,
              position: 'insideLeft',
              style: { fill: CHART_COLORS.text, fontSize: 14 },
            }}
          />
          <ZAxis
            type="number"
            dataKey="comments"
            range={[50, 400]}
            name="Comments"
          />
          <Tooltip content={<CustomTooltip />} />
          <Scatter
            name="Tweets"
            data={chartData}
            fill={CHART_COLORS.likes}
            fillOpacity={0.6}
          />
        </ScatterChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-4 text-sm text-electric-text-muted text-center">
        <p>Each bubble represents a tweet. Bubble size indicates comment count.</p>
      </div>
    </div>
  );
}
