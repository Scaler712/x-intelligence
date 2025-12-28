import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadScrape, deleteScrape } from '../utils/storage';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
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
        setError('Analysis not found');
        return;
      }
      setScrape(scrapeData);
    } catch (err) {
      console.error('Error loading analysis:', err);
      setError('Failed to load analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this analysis? This cannot be undone.')) {
      try {
        await deleteScrape(Number(scrapeId));
        navigate('/history');
      } catch (err) {
        console.error('Error deleting analysis:', err);
        alert('Failed to delete analysis');
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
      <div>
        <PageHeader
          breadcrumbs={['Home', 'History', 'Details']}
          title="Loading..."
          subtitle=""
        />
        <div className="px-8 pb-10">
          <div className="text-center py-12 text-[#a0a0a0]">
            Loading analysis...
          </div>
        </div>
      </div>
    );
  }

  if (error || !scrape) {
    return (
      <div>
        <PageHeader
          breadcrumbs={['Home', 'History', 'Details']}
          title="Error"
          subtitle={error || 'Analysis not found'}
        />
        <div className="px-8 pb-10">
          <div className="text-center py-12">
            <p className="text-[#a0a0a0] mb-4">{error || 'Analysis not found'}</p>
            <Button variant="primary" onClick={() => navigate('/history')}>
              Back to History
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        breadcrumbs={['Home', 'History', `@${scrape.username}`]}
        title={`@${scrape.username}`}
        subtitle={`Analyzed on ${new Date(scrape.date).toLocaleString()}`}
      />

      <div className="px-8 pb-10">
        <div className="space-y-6">
          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="primary" onClick={handleScrapeAgain}>
              Analyze Again
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete Analysis
            </Button>
          </div>

          {/* Stats */}
          {scrape.stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
              <div>
                <div className="text-xs text-[#a0a0a0] mb-1">Total Tweets</div>
                <div className="text-xl font-bold text-white">{scrape.stats.total || 0}</div>
              </div>
              <div>
                <div className="text-xs text-[#a0a0a0] mb-1">Filtered</div>
                <div className="text-xl font-bold text-white">{scrape.stats.filtered || 0}</div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <TabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tweetCount={scrape.tweets?.length || 0}
          />

          {/* Content */}
          <div className="mt-4">
            {activeTab === 'tweets' && <TweetList tweets={scrape.tweets || []} />}
            {activeTab === 'hooks' && <HooksList tweets={scrape.tweets || []} />}
            {activeTab === 'analysis' && (
              <AnalysisDashboard 
                tweets={scrape.tweets || []} 
                scrapeId={scrapeId}
                stats={scrape.stats}
                username={scrape.username}
              />
            )}
          </div>
        </div>
      </div>

      {/* Stats Sidebar */}
      {scrape.tweets && scrape.tweets.length > 0 && (
        <div className="mt-6 px-8">
          <StatsSidebar tweets={scrape.tweets} />
        </div>
      )}
    </div>
  );
}
