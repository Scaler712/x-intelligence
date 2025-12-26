import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/electric.css';
import { loadScrape, deleteScrape } from '../utils/storage';
import TweetList from '../components/TweetList';
import HooksList from '../components/HooksList';
import TabNavigation from '../components/TabNavigation';
import StatsSidebar from '../components/StatsSidebar';
import AnalysisDashboard from '../components/AnalysisDashboard';

export default function ScrapeDetailsPage() {
  const { scrapeId } = useParams();
  const navigate = useNavigate();
  const [scrape, setScrape] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tweets');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadScrapeData();
  }, [scrapeId]);

  const loadScrapeData = async () => {
    try {
      setLoading(true);
      const scrapeData = await loadScrape(Number(scrapeId));
      if (!scrapeData) {
        setError('Scrape not found');
        return;
      }
      setScrape(scrapeData);
    } catch (err) {
      console.error('Error loading scrape:', err);
      setError('Failed to load scrape');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this scrape? This cannot be undone.')) {
      try {
        await deleteScrape(Number(scrapeId));
        navigate('/history');
      } catch (err) {
        console.error('Error deleting scrape:', err);
        alert('Failed to delete scrape');
      }
    }
  };

  const handleScrapeAgain = () => {
    if (scrape) {
      navigate(`/?username=${scrape.username}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-electric-dark p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-electric-muted border border-electric-border rounded-xl p-12 text-center">
            <p className="electric-body text-electric-text-muted">Loading scrape details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !scrape) {
    return (
      <div className="min-h-screen bg-electric-dark p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/20 border border-red-500 rounded-xl p-12 text-center">
            <p className="text-red-400">{error || 'Scrape not found'}</p>
            <button
              onClick={() => navigate('/history')}
              className="mt-4 inline-flex items-center justify-center rounded-lg font-light transition-all duration-200 bg-electric-lime text-black hover:bg-electric-lime/90 electric-glow h-10 px-6"
            >
              Back to History
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-electric-dark p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="electric-heading text-4xl md:text-5xl text-electric-text mb-2">
              @{scrape.username}
            </h1>
            <p className="electric-body text-electric-text-muted">
              Scraped on {new Date(scrape.date).toLocaleString()}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleScrapeAgain}
              className="inline-flex items-center justify-center rounded-lg font-light transition-all duration-200 bg-electric-lime text-black hover:bg-electric-lime/90 electric-glow h-10 px-6"
            >
              Scrape Again
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center justify-center rounded-lg font-light transition-all duration-200 bg-electric-dark border border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 h-10 px-6"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Main Content Area with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Stats Sidebar */}
          <StatsSidebar tweets={scrape.tweets || []} />

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Tab Navigation */}
            <TabNavigation 
              activeTab={activeTab} 
              onTabChange={setActiveTab}
              tweetCount={scrape.tweets?.length || 0}
            />

            {/* Content Area - Tabs */}
            {activeTab === 'tweets' && <TweetList tweets={scrape.tweets || []} />}
            {activeTab === 'hooks' && <HooksList tweets={scrape.tweets || []} />}
            {activeTab === 'analysis' && <AnalysisDashboard tweets={scrape.tweets || []} />}
          </div>
        </div>
      </div>
    </div>
  );
}

