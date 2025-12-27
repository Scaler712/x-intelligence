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
import {
  CHART_COLORS,
  CHART_STYLES,
  TOOLTIP_STYLE,
  DEFAULT_CHART_HEIGHT,
  formatDate,
  formatNumber,
} from '../../constants/chartConfigs';

/**
 * Reusable multi-line chart component for comparing multiple datasets
 * @param {Array} data - Chart data array
 * @param {Array} lines - Array of line configurations: { dataKey, name, color }
 * @param {String} xAxisKey - Key for X-axis data
 * @param {String} title - Chart title
 * @param {String} subtitle - Chart subtitle
 */
export default function MultiLineChart({
  data,
  lines,
  xAxisKey = 'date',
  title,
  subtitle,
  height = DEFAULT_CHART_HEIGHT,
}) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-electric-dark border border-electric-border rounded-xl p-6">
        {title && (
          <h3 className="electric-heading text-xl text-electric-text mb-2">
            {title}
          </h3>
        )}
        <p className="electric-body text-electric-text-muted">
          No data available yet.
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
    <div className="bg-electric-dark border border-electric-border rounded-xl p-6">
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="electric-heading text-xl text-electric-text mb-2">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="electric-body text-sm text-electric-text-muted">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
          <XAxis
            dataKey={xAxisKey}
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
          />
          {lines.map((line, index) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color || CHART_COLORS[Object.keys(CHART_COLORS)[index % 5]]}
              strokeWidth={CHART_STYLES.lineChart.strokeWidth}
              dot={CHART_STYLES.lineChart.dot}
              activeDot={CHART_STYLES.lineChart.activeDot}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
