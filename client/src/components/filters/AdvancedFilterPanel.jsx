import { useState } from 'react';
import '../../styles/electric.css';
import QuickFilters from './QuickFilters';

export default function AdvancedFilterPanel({ filters, onFilterChange, onDateRangeChange, onReset }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-electric-muted border border-electric-border rounded-xl overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="electric-heading text-lg text-electric-text">Advanced Filters</h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-electric-lime hover:text-electric-lime/80 transition-colors text-sm"
          >
            {isExpanded ? 'Hide' : 'Show'} Options
          </button>
        </div>

        <QuickFilters filters={filters} onFilterChange={onFilterChange} />

        {isExpanded && (
          <div className="mt-4 space-y-4 pt-4 border-t border-electric-border">
            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-electric-text-muted mb-2">Start Date</label>
                <input
                  type="date"
                  value={filters.dateRange.start || ''}
                  onChange={(e) => onDateRangeChange(e.target.value, filters.dateRange.end)}
                  className="w-full bg-electric-dark border border-electric-border rounded-lg px-3 py-2 text-electric-text focus:outline-none focus:border-electric-lime transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-electric-text-muted mb-2">End Date</label>
                <input
                  type="date"
                  value={filters.dateRange.end || ''}
                  onChange={(e) => onDateRangeChange(filters.dateRange.start, e.target.value)}
                  className="w-full bg-electric-dark border border-electric-border rounded-lg px-3 py-2 text-electric-text focus:outline-none focus:border-electric-lime transition-colors"
                />
              </div>
            </div>

            {/* Minimum Engagement */}
            <div>
              <label className="block text-sm text-electric-text-muted mb-2">
                Minimum Total Engagement: {filters.minEngagement}
              </label>
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={filters.minEngagement}
                onChange={(e) => onFilterChange('minEngagement', parseInt(e.target.value))}
                className="w-full h-2 bg-electric-border rounded-lg appearance-none cursor-pointer accent-electric-lime"
              />
            </div>

            {/* Reset Button */}
            <button
              onClick={onReset}
              className="w-full inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-light transition-all duration-200 bg-electric-dark border border-electric-border text-electric-text hover:border-electric-lime"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
