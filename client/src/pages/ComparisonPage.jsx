import { useState, useEffect, useMemo } from 'react';
import { useComparison } from '../contexts/ComparisonContext';
import { getAllScrapes, loadScrape } from '../utils/storage';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import ComparisonView from '../components/comparison/ComparisonView';
import BenchmarkDashboard from '../components/comparison/BenchmarkDashboard';
import GapAnalysis from '../components/comparison/GapAnalysis';
import TimelineComparison from '../components/charts/TimelineComparison';

export default function ComparisonPage() {
  const [allScrapes, setAllScrapes] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [metric, setMetric] = useState('total');
  const [loading, setLoading] = useState(true);
  const [selectedScrapesWithTweets, setSelectedScrapesWithTweets] = useState([]);
  const { selectedScrapes, toggleScrape, clearSelection, isSelected, hasSelection } = useComparison();

  // Create stable ID string for dependency
  const selectedScrapeIds = useMemo(() => 
    selectedScrapes.map(s => s.id).sort().join(','), 
    [selectedScrapes]
  );

  useEffect(() => {
    loadScrapes();
  }, []);

  // Load tweets for selected scrapes when they change
  useEffect(() => {
    if (selectedScrapes.length > 0) {
      loadTweetsForSelected();
    } else {
      setSelectedScrapesWithTweets([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedScrapeIds]);

  async function loadScrapes() {
    try {
      const scrapes = await getAllScrapes();
      setAllScrapes(scrapes);
    } catch (error) {
      console.error('Error loading scrapes:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadTweetsForSelected() {
    try {
      // Load tweets for each selected scrape
      const scrapesWithTweets = await Promise.all(
        selectedScrapes.map(async (scrape) => {
          // If scrape already has tweets, use it
          if (scrape.tweets && scrape.tweets.length > 0) {
            return scrape;
          }
          // Otherwise load from IndexedDB
          try {
            const fullScrape = await loadScrape(scrape.id);
            return fullScrape || { ...scrape, tweets: [] };
          } catch (error) {
            console.error(`Error loading scrape ${scrape.id}:`, error);
            return { ...scrape, tweets: [] };
          }
        })
      );
      // Keep all selected scrapes, even if they don't have tweets loaded yet
      setSelectedScrapesWithTweets(scrapesWithTweets);
    } catch (error) {
      console.error('Error loading tweets for selected scrapes:', error);
      setSelectedScrapesWithTweets([]);
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'benchmarks', label: 'Benchmarks' },
    { id: 'gaps', label: 'Gap Analysis' },
    { id: 'timeline', label: 'Timeline' },
  ];

  if (loading) {
    return (
      <div>
        <PageHeader
          breadcrumbs={['Home', 'Compare']}
          title="Compare Analyses"
          subtitle="Compare multiple X profile analyses side by side"
        />
        <div className="px-8 pb-10">
          <div className="py-12 text-center">
            <p className="text-[#a0a0a0] font-light">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        breadcrumbs={['Home', 'Compare']}
        title="Compare Analyses"
        subtitle="Compare multiple X profile analyses side by side"
      />

      <div className="px-8 pb-10">
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex gap-2 border-b border-glass-border pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-4 py-2 text-sm font-light transition-none border-b-2
                  ${activeTab === tab.id
                    ? 'border-ring glass-accent'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div>
            {activeTab === 'overview' && (
              <ComparisonView
                scrapes={allScrapes || []}
                selectedScrapes={selectedScrapes.length > 0 ? (selectedScrapesWithTweets.length > 0 ? selectedScrapesWithTweets : selectedScrapes) : []}
                toggleScrape={toggleScrape}
                isSelected={isSelected}
                clearSelection={clearSelection}
              />
            )}
            {activeTab === 'benchmarks' && (
              selectedScrapesWithTweets.length > 0 ? (
                <BenchmarkDashboard scrapes={selectedScrapesWithTweets} />
              ) : (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground font-light">
                    {selectedScrapes.length > 0 
                      ? 'Loading tweets for selected scrapes...'
                      : 'Select scrapes to view benchmarks.'
                    }
                  </p>
                </div>
              )
            )}
            {activeTab === 'gaps' && (
              selectedScrapesWithTweets.length > 0 ? (
                <GapAnalysis scrapes={selectedScrapesWithTweets} />
              ) : (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground font-light">
                    {selectedScrapes.length > 0 
                      ? 'Loading tweets for selected scrapes...'
                      : 'Select scrapes to view gap analysis.'
                    }
                  </p>
                </div>
              )
            )}
            {activeTab === 'timeline' && (
              selectedScrapesWithTweets.length > 0 ? (
                <TimelineComparison scrapes={selectedScrapesWithTweets} metric={metric} />
              ) : (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground font-light">
                    {selectedScrapes.length > 0 
                      ? 'Loading tweets for selected scrapes...'
                      : 'Select scrapes to view timeline comparison.'
                    }
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
