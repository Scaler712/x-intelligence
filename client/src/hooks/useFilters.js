import { useState, useMemo } from 'react';

/**
 * Custom hook for advanced filtering
 * @param {Array} items - Items to filter
 */
export function useFilters(items) {
  const [filters, setFilters] = useState({
    dateRange: { start: null, end: null },
    excludeRetweets: false,
    excludeReplies: false,
    mediaOnly: false,
    minEngagement: 0
  });

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const itemDate = new Date(item.date);
        if (filters.dateRange.start && itemDate < new Date(filters.dateRange.start)) {
          return false;
        }
        if (filters.dateRange.end && itemDate > new Date(filters.dateRange.end)) {
          return false;
        }
      }

      // Exclude retweets
      if (filters.excludeRetweets && item.content?.startsWith('RT @')) {
        return false;
      }

      // Exclude replies
      if (filters.excludeReplies && item.content?.startsWith('@')) {
        return false;
      }

      // Media only
      if (filters.mediaOnly) {
        const hasMedia = /https?:\/\/t\.co\/\w+|pic\.twitter\.com|video/i.test(item.content || '');
        if (!hasMedia) return false;
      }

      // Minimum engagement
      if (filters.minEngagement > 0) {
        const totalEngagement = (item.likes || 0) + (item.retweets || 0) + (item.comments || 0);
        if (totalEngagement < filters.minEngagement) {
          return false;
        }
      }

      return true;
    });
  }, [items, filters]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const updateDateRange = (start, end) => {
    setFilters(prev => ({ ...prev, dateRange: { start, end } }));
  };

  const resetFilters = () => {
    setFilters({
      dateRange: { start: null, end: null },
      excludeRetweets: false,
      excludeReplies: false,
      mediaOnly: false,
      minEngagement: 0
    });
  };

  return {
    filters,
    filteredItems,
    updateFilter,
    updateDateRange,
    resetFilters,
    hasActiveFilters: filters.excludeRetweets || filters.excludeReplies || filters.mediaOnly ||
                      filters.minEngagement > 0 || filters.dateRange.start || filters.dateRange.end
  };
}
