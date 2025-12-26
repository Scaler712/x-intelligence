import { useMemo } from 'react';
import '../styles/electric.css';

export default function EngagementTimeline({ tweets }) {
  const timelineData = useMemo(() => {
    if (tweets.length === 0) return { data: [], maxEngagement: 0, dates: [] };

    // Sort tweets by date
    const sorted = [...tweets]
      .map(tweet => ({
        ...tweet,
        date: new Date(tweet.date),
        totalEngagement: (tweet.likes || 0) + (tweet.retweets || 0) + (tweet.comments || 0)
      }))
      .filter(tweet => !isNaN(tweet.date.getTime()))
      .sort((a, b) => a.date - b.date);

    const data = sorted.map(tweet => ({
      date: tweet.date,
      likes: tweet.likes || 0,
      retweets: tweet.retweets || 0,
      comments: tweet.comments || 0,
      total: tweet.totalEngagement
    }));

    const maxEngagement = Math.max(...data.map(d => d.total), 1);
    const dates = data.map(d => d.date);

    return { data, maxEngagement, dates };
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

  const { data, maxEngagement, dates } = timelineData;
  const chartHeight = 300;
  const chartWidth = Math.max(800, dates.length * 4);
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };

  // Calculate positions
  const xScale = (index) => {
    if (data.length <= 1) return padding.left;
    return padding.left + (index / (data.length - 1)) * (chartWidth - padding.left - padding.right);
  };

  const yScale = (value) => {
    return padding.top + (1 - value / maxEngagement) * (chartHeight - padding.top - padding.bottom);
  };

  // Create path for line
  const createPath = (getValue) => {
    if (data.length === 0) return '';
    if (data.length === 1) {
      const y = yScale(getValue(data[0]));
      return `M ${xScale(0)} ${y} L ${xScale(0)} ${y}`;
    }

    let path = `M ${xScale(0)} ${yScale(getValue(data[0]))}`;
    for (let i = 1; i < data.length; i++) {
      path += ` L ${xScale(i)} ${yScale(getValue(data[i]))}`;
    }
    return path;
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

      <div className="overflow-x-auto">
        <svg
          width={chartWidth}
          height={chartHeight + padding.bottom}
          className="w-full"
          viewBox={`0 0 ${chartWidth} ${chartHeight + padding.bottom}`}
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padding.top + ratio * (chartHeight - padding.top - padding.bottom);
            const value = Math.round(maxEngagement * (1 - ratio));
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  fill="#a0a0a0"
                  fontSize="12"
                  textAnchor="end"
                >
                  {value.toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* Y-axis label */}
          <text
            x={padding.left - 30}
            y={chartHeight / 2}
            fill="#a0a0a0"
            fontSize="12"
            textAnchor="middle"
            transform={`rotate(-90 ${padding.left - 30} ${chartHeight / 2})`}
          >
            Engagement
          </text>

          {/* X-axis */}
          <line
            x1={padding.left}
            y1={chartHeight - padding.bottom}
            x2={chartWidth - padding.right}
            y2={chartHeight - padding.bottom}
            stroke="#2a2a2a"
            strokeWidth="2"
          />

          {/* Data lines */}
          <path
            d={createPath(d => d.likes)}
            fill="none"
            stroke="#d4ff4a"
            strokeWidth="2"
            opacity="0.8"
          />
          <path
            d={createPath(d => d.retweets)}
            fill="none"
            stroke="#ff6b6b"
            strokeWidth="2"
            opacity="0.8"
          />
          <path
            d={createPath(d => d.comments)}
            fill="none"
            stroke="#4ecdc4"
            strokeWidth="2"
            opacity="0.8"
          />

          {/* Data points */}
          {data.map((point, index) => (
            <g key={index}>
              <circle
                cx={xScale(index)}
                cy={yScale(point.total)}
                r="3"
                fill="#d4ff4a"
                opacity="0.8"
              />
            </g>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex gap-4 text-sm text-electric-text-muted">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-electric-lime" />
          <span>Likes</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-red-400" />
          <span>Retweets</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-teal-400" />
          <span>Comments</span>
        </div>
      </div>
    </div>
  );
}

