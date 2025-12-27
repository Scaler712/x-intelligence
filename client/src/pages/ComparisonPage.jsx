import { useState, useEffect, useMemo } from 'react';
import { useComparison } from '../contexts/ComparisonContext';
import { getAllScrapes } from '../utils/storage';
import '../styles/electric.css';
import ComparisonView from '../components/comparison/ComparisonView';
import BenchmarkDashboard from '../components/comparison/BenchmarkDashboard';
import GapAnalysis from '../components/comparison/GapAnalysis';
import TimelineComparison from '../components/charts/TimelineComparison';

export default function ComparisonPage() {
  const [allScrapes, setAllScrapes] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [metric, setMetric] = useState('total');
  const { selectedScrapes, toggleScrape, clearSelection, isSelected, hasSelection } = useComparison();

  useEffect(() => {
    loadScrapes();
  }, []);

  async function loadScrapes() {
    const scrapes = await getAllScrapes();
    setAllScrapes(scrapes);
  }

  const selectedScrapesWithTweets = useMemo(() => {
    return selectedScrapes.filter(s => s.tweets && s.tweets.length > 0);
  }, [selectedScrapes]);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'benchmarks', label: 'Benchmarks' },
    { id: 'gaps', label: 'Gap Analysis' },
    { id: 'timeline', label: 'Timeline' },
  ];

  const metrics = [
    { id: 'total', label: 'Total Engagement' },
    { id: 'likes', label: 'Likes' },
    { id: 'retweets', label: 'Retweets' },
    { id: 'comments', label: 'Comments' },
  ];

  return (
    <div className="min-h-screen bg-electric-bg p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="electric-heading text-3xl text-electric-text mb-2">
            Compare Profiles
          </h1>
          <p className="electric-body text-electric-text-muted">
            Select multiple scrapes to compare performance metrics and identify gaps
          </p>
        </div>

        {/* Scrape Selection */}
        <div className="bg-electric-dark border border-electric-border rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="electric-heading text-xl text-electric-text">
              Select Scrapes to Compare
            </h3>
            {hasSelection && (
              <button
                onClick={clearSelection}
                className="bg-electric-muted border border-electric-border hover:border-electric-lime text-electric-text px-4 py-2 rounded-lg transition-all"
              >
                Clear Selection ({selectedScrapes.length})
              </button>
            )}
          </div>

          {allScrapes.length === 0 ? (
            <p className="electric-body text-electric-text-muted">
              No scrapes available. Go to the Scraper page to collect some data first.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {allScrapes.map(scrape => (
                <div
                  key={scrape.id}
                  onClick={() => toggleScrape(scrape)}
                  className={`
                    p-4 rounded-lg border cursor-pointer transition-all
                    ${isSelected(scrape.id)
                      ? 'bg-electric-lime/10 border-electric-lime'
                      : 'bg-electric-muted border-electric-border hover:border-electric-lime/50'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="electric-body text-electric-text font-medium mb-1">
                        {scrape.username}
                      </div>
                      <div className="text-sm text-electric-text-muted">
                        {scrape.tweets?.length || 0} tweets
                      </div>
                      <div className="text-xs text-electric-text-muted">
                        {new Date(scrape.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="ml-2">
                      {isSelected(scrape.id) && (
                        <span className="text-electric-lime text-xl">✓</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comparison Results */}
        {hasSelection && (
          <>
            {/* Tabs */}
            <div className="bg-electric-dark border border-electric-border rounded-xl p-2 mb-6">
              <div className="flex gap-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex-1 px-4 py-2 rounded-lg transition-all electric-body
                      ${activeTab === tab.id
                        ? 'bg-electric-lime text-electric-dark font-medium'
                        : 'text-electric-text-muted hover:text-electric-text hover:bg-electric-muted'
                      }
                    `}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Metric Selector for Timeline Tab */}
            {activeTab === 'timeline' && (
              <div className="bg-electric-dark border border-electric-border rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="electric-body text-electric-text-muted">Metric:</span>
                  {metrics.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setMetric(m.id)}
                      className={`
                        px-3 py-1.5 rounded-lg transition-all text-sm
                        ${metric === m.id
                          ? 'bg-electric-lime text-electric-dark font-medium'
                          : 'text-electric-text-muted hover:text-electric-text hover:bg-electric-muted'
                        }
                      `}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tab Content */}
            <div>
              {activeTab === 'overview' && (
                <ComparisonView scrapes={selectedScrapesWithTweets} />
              )}

              {activeTab === 'benchmarks' && (
                <BenchmarkDashboard scrapes={selectedScrapesWithTweets} />
              )}

              {activeTab === 'gaps' && (
                <GapAnalysis scrapes={selectedScrapesWithTweets} />
              )}

              {activeTab === 'timeline' && (
                <TimelineComparison
                  scrapes={selectedScrapesWithTweets}
                  metric={metric}
                />
              )}
            </div>
          </>
        )}

        {/* Empty State */}
        {!hasSelection && (
          <div className="bg-electric-dark border border-electric-border rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="electric-heading text-xl text-electric-text mb-2">
              No Scrapes Selected
            </h3>
            <p className="electric-body text-electric-text-muted max-w-md mx-auto">
              Select at least one scrape above to start comparing profiles and analyzing performance gaps.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
