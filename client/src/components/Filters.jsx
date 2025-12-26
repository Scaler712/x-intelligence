import '../styles/electric.css';

export default function Filters({ filters, onFilterChange }) {
  return (
    <div className="bg-electric-muted border border-electric-border rounded-xl p-6 hover:border-electric-lime/50 transition-all duration-300 relative overflow-hidden">
      <div className="relative z-10">
        <h3 className="electric-heading text-xl text-electric-text mb-4">Filter Settings</h3>
        <p className="electric-body text-electric-text-muted mb-4 text-sm">
          Set minimum engagement thresholds. Leave at 0 to disable a filter.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-electric-text-muted mb-2">
              Minimum Likes
            </label>
            <input
              type="number"
              min="0"
              value={filters.MIN_LIKES || 0}
              onChange={(e) => onFilterChange('MIN_LIKES', parseInt(e.target.value) || 0)}
              className="w-full bg-electric-dark border border-electric-border rounded-lg px-4 py-2 text-electric-text focus:outline-none focus:border-electric-lime transition-colors"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm text-electric-text-muted mb-2">
              Minimum Retweets
            </label>
            <input
              type="number"
              min="0"
              value={filters.MIN_RETWEETS || 0}
              onChange={(e) => onFilterChange('MIN_RETWEETS', parseInt(e.target.value) || 0)}
              className="w-full bg-electric-dark border border-electric-border rounded-lg px-4 py-2 text-electric-text focus:outline-none focus:border-electric-lime transition-colors"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm text-electric-text-muted mb-2">
              Minimum Comments
            </label>
            <input
              type="number"
              min="0"
              value={filters.MIN_COMMENTS || 0}
              onChange={(e) => onFilterChange('MIN_COMMENTS', parseInt(e.target.value) || 0)}
              className="w-full bg-electric-dark border border-electric-border rounded-lg px-4 py-2 text-electric-text focus:outline-none focus:border-electric-lime transition-colors"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm text-electric-text-muted mb-2">
              Minimum Total Engagement
            </label>
            <input
              type="number"
              min="0"
              value={filters.MIN_TOTAL_ENGAGEMENT || 0}
              onChange={(e) => onFilterChange('MIN_TOTAL_ENGAGEMENT', parseInt(e.target.value) || 0)}
              className="w-full bg-electric-dark border border-electric-border rounded-lg px-4 py-2 text-electric-text focus:outline-none focus:border-electric-lime transition-colors"
              placeholder="0"
            />
          </div>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-electric-lime/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
}

