/**
 * Chart configuration and theming for Recharts components
 */

// Color schemes for charts
export const CHART_COLORS = {
  likes: '#d4ff4a', // electric-lime
  retweets: '#ff6b6b', // red
  comments: '#4ecdc4', // teal
  engagement: '#d4ff4a', // electric-lime
  primary: '#d4ff4a',
  secondary: '#4ecdc4',
  tertiary: '#ff6b6b',
  quaternary: '#ffa94d',
  grid: 'rgba(255, 255, 255, 0.1)',
  text: '#a0a0a0',
  textLight: '#666666',
};

// Chart styling configuration
export const CHART_STYLES = {
  lineChart: {
    strokeWidth: 2,
    dot: { r: 3 },
    activeDot: { r: 5 },
  },
  areaChart: {
    strokeWidth: 2,
    fillOpacity: 0.3,
  },
  barChart: {
    radius: [4, 4, 0, 0], // rounded corners on top
  },
  scatterChart: {
    r: 5,
  },
};

// Tooltip styles
export const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    border: '1px solid rgba(212, 255, 74, 0.3)',
    borderRadius: '8px',
    padding: '12px',
  },
  labelStyle: {
    color: '#d4ff4a',
    fontWeight: 'bold',
    marginBottom: '8px',
  },
  itemStyle: {
    color: '#f0f0f0',
  },
};

// Responsive container default height
export const DEFAULT_CHART_HEIGHT = 400;

// Format large numbers for display
export function formatNumber(num) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

// Format date for chart labels
export function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Format time for chart labels
export function formatTime(date) {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// Custom tooltip formatter
export function customTooltipFormatter(value, name) {
  const labels = {
    likes: 'Likes',
    retweets: 'Retweets',
    comments: 'Comments',
    engagement: 'Total Engagement',
  };
  return [value.toLocaleString(), labels[name] || name];
}
