import { useState, useEffect } from 'react';

/**
 * Custom hook for debounced search functionality
 * @param {Array} items - Items to search through
 * @param {string} searchKey - Key to search in (e.g., 'content')
 * @param {number} debounceMs - Debounce delay in milliseconds
 */
export function useSearch(items, searchKey = 'content', debounceMs = 300) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState(items);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchQuery, debounceMs]);

  // Filter items when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setFilteredItems(items);
      return;
    }

    const query = debouncedQuery.toLowerCase();
    const filtered = items.filter(item => {
      const value = item[searchKey];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(query);
      }
      return false;
    });

    setFilteredItems(filtered);
  }, [debouncedQuery, items, searchKey]);

  return {
    searchQuery,
    setSearchQuery,
    filteredItems,
    isSearching: searchQuery !== debouncedQuery,
    matchCount: filteredItems.length
  };
}
