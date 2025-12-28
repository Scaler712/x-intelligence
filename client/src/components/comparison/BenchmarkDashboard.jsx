import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { calculateBenchmarks } from '../../utils/comparison';
import {
  CHART_COLORS,
  TOOLTIP_STYLE,
  DEFAULT_CHART_HEIGHT,
  formatNumber,
} from '../../constants/chartConfigs';

export default function BenchmarkDashboard({ scrapes }) {
  const benchmarkData = useMemo(() => calculateBenchmarks(scrapes), [scrapes]);

  const chartData = useMemo(() => {
    if (!scrapes || scrapes.length === 0) return [];

    return scrapes.map(scrape => {
      const stats = {
        username: scrape.username,
        likes: 0,
        retweets: 0,
        comments: 0,
      };

      scrape.tweets.forEach(tweet => {
        stats.likes += tweet.likes || 0;
        stats.retweets += tweet.retweets || 0;
        stats.comments += tweet.comments || 0;
      });

      const tweetCount = scrape.tweets.length;
      return {
        username: scrape.username,
        'Avg Likes': tweetCount > 0 ? Math.round(stats.likes / tweetCount) : 0,
        'Avg Retweets': tweetCount > 0 ? Math.round(stats.retweets / tweetCount) : 0,
        'Avg Comments': tweetCount > 0 ? Math.round(stats.comments / tweetCount) : 0,
      };
    });
  }, [scrapes]);

  if (!scrapes || scrapes.length === 0) {
    return (
      <div className="bg-electric-dark border border-electric-border rounded-xl p-6">
        <p className="electric-body text-electric-text-muted text-center">
          Select at least one scrape to see benchmarks.
        </p>
      </div>
    );
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={TOOLTIP_STYLE.contentStyle}>
          <p style={TOOLTIP_STYLE.labelStyle}>{label}</p>
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
    <div className="space-y-6">
      {/* Benchmark Stats */}
      <div className="bg-electric-dark border border-electric-border rounded-xl p-6">
        <div className="mb-4">
          <h3 className="electric-heading text-xl text-electric-text mb-2">
            Overall Benchmarks
          </h3>
          <p className="electric-body text-sm text-electric-text-muted">
            Average metrics across all {scrapes.length} profile{scrapes.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-electric-muted rounded-lg p-4 border border-electric-border">
            <div className="text-sm text-electric-text-muted mb-1">Avg Likes</div>
            <div className="electric-heading text-2xl text-electric-lime">
              {benchmarkData.avgLikes.toLocaleString()}
            </div>
          </div>

          <div className="bg-electric-muted rounded-lg p-4 border border-electric-border">
            <div className="text-sm text-electric-text-muted mb-1">Avg Retweets</div>
            <div className="electric-heading text-2xl text-electric-lime">
              {benchmarkData.avgRetweets.toLocaleString()}
            </div>
          </div>

          <div className="bg-electric-muted rounded-lg p-4 border border-electric-border">
            <div className="text-sm text-electric-text-muted mb-1">Avg Comments</div>
            <div className="electric-heading text-2xl text-electric-lime">
              {benchmarkData.avgComments.toLocaleString()}
            </div>
          </div>

          <div className="bg-electric-muted rounded-lg p-4 border border-electric-border">
            <div className="text-sm text-electric-text-muted mb-1">Avg Total</div>
            <div className="electric-heading text-2xl text-electric-lime">
              {benchmarkData.avgEngagement.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Bar Chart Comparison */}
      <div className="bg-electric-dark border border-electric-border rounded-xl p-6">
        <div className="mb-4">
          <h3 className="electric-heading text-xl text-electric-text mb-2">
            Engagement Comparison
          </h3>
          <p className="electric-body text-sm text-electric-text-muted">
            Average engagement metrics by profile
          </p>
        </div>

        <ResponsiveContainer width="100%" height={DEFAULT_CHART_HEIGHT}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
            <XAxis
              dataKey="username"
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
              iconType="rect"
            />
            <Bar dataKey="Avg Likes" fill={CHART_COLORS.likes} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Avg Retweets" fill={CHART_COLORS.retweets} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Avg Comments" fill={CHART_COLORS.comments} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top 10% Thresholds */}
      <div className="bg-electric-dark border border-electric-border rounded-xl p-6">
        <div className="mb-4">
          <h3 className="electric-heading text-xl text-electric-text mb-2">
            Top 10% Thresholds
          </h3>
          <p className="electric-body text-sm text-electric-text-muted">
            Minimum metrics needed to be in top 10% of all tweets
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-electric-lime/10 border border-electric-lime rounded-lg p-4">
            <div className="text-sm text-electric-text-muted mb-1">Top 10% Likes</div>
            <div className="electric-heading text-3xl text-electric-lime">
              {benchmarkData.topPercentile.likes.toLocaleString()}+
            </div>
          </div>

          <div className="bg-electric-lime/10 border border-electric-lime rounded-lg p-4">
            <div className="text-sm text-electric-text-muted mb-1">Top 10% Retweets</div>
            <div className="electric-heading text-3xl text-electric-lime">
              {benchmarkData.topPercentile.retweets.toLocaleString()}+
            </div>
          </div>

          <div className="bg-electric-lime/10 border border-electric-lime rounded-lg p-4">
            <div className="text-sm text-electric-text-muted mb-1">Top 10% Comments</div>
            <div className="electric-heading text-3xl text-electric-lime">
              {benchmarkData.topPercentile.comments.toLocaleString()}+
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
