import { createContext, useContext, useState, useCallback } from 'react';
import { saveComparison, getComparisons, deleteComparison } from '../utils/storage';

const ComparisonContext = createContext();

export function ComparisonProvider({ children }) {
  const [selectedScrapes, setSelectedScrapes] = useState([]);
  const [savedComparisons, setSavedComparisons] = useState([]);

  // Toggle scrape selection
  const toggleScrape = useCallback((scrape) => {
    setSelectedScrapes(prev => {
      const exists = prev.find(s => s.id === scrape.id);
      if (exists) {
        return prev.filter(s => s.id !== scrape.id);
      } else {
        return [...prev, scrape];
      }
    });
  }, []);

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedScrapes([]);
  }, []);

  // Check if scrape is selected
  const isSelected = useCallback((scrapeId) => {
    return selectedScrapes.some(s => s.id === scrapeId);
  }, [selectedScrapes]);

  // Save current comparison
  const saveCurrentComparison = useCallback(async (name, notes = '') => {
    if (selectedScrapes.length === 0) {
      throw new Error('No scrapes selected');
    }

    const comparison = {
      name,
      scrapeIds: selectedScrapes.map(s => s.id),
      usernames: selectedScrapes.map(s => s.username),
      notes,
      createdAt: new Date().toISOString(),
    };

    const id = await saveComparison(comparison);
    await loadSavedComparisons();
    return id;
  }, [selectedScrapes]);

  // Load saved comparisons
  const loadSavedComparisons = useCallback(async () => {
    const comparisons = await getComparisons();
    setSavedComparisons(comparisons);
  }, []);

  // Delete a saved comparison
  const deleteSavedComparison = useCallback(async (id) => {
    await deleteComparison(id);
    await loadSavedComparisons();
  }, [loadSavedComparisons]);

  // Load a saved comparison (select those scrapes)
  const loadComparison = useCallback((comparison, allScrapes) => {
    const scrapesToSelect = allScrapes.filter(s =>
      comparison.scrapeIds.includes(s.id)
    );
    setSelectedScrapes(scrapesToSelect);
  }, []);

  const value = {
    selectedScrapes,
    toggleScrape,
    clearSelection,
    isSelected,
    saveCurrentComparison,
    savedComparisons,
    loadSavedComparisons,
    deleteSavedComparison,
    loadComparison,
    hasSelection: selectedScrapes.length > 0,
    selectionCount: selectedScrapes.length,
  };

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within ComparisonProvider');
  }
  return context;
}
