import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loadScrape, deleteScrape } from '../utils/storage';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import TweetList from '../components/TweetList';
import HooksList from '../components/HooksList';
import TabNavigation from '../components/TabNavigation';
import StatsSidebar from '../components/StatsSidebar';
import AnalysisDashboard from '../components/AnalysisDashboard';

// Get API URL
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.includes('railway.internal')) {
    return '';
  }
  return envUrl || (import.meta.env.DEV ? 'http://localhost:3001' : '');
};

const API_URL = getApiUrl();

export default function ScrapeDetailsPage() {
  const { scrapeId } = useParams();
  const navigate = useNavigate();
  const { session, getAccessToken } = useAuth();
  const [scrape, setScrape] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tweets');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadScrapeData();
  }, [scrapeId, session]);

  const loadScrapeData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if scrapeId is UUID (database) or number (IndexedDB)
      const isUUID = typeof scrapeId === 'string' && scrapeId.includes('-');
      
      if (isUUID && session?.access_token && API_URL) {
        // Load from database
        try {
          const token = getAccessToken();
          if (!token) {
            throw new Error('No access token');
          }
          
          console.log(`Loading scrape ${scrapeId} from database...`);
          const response = await fetch(`${API_URL}/api/scrapes/${scrapeId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log(`Loaded scrape with ${data.scrape?.tweets?.length || 0} tweets, status: ${data.scrape?.status}`);
            
            // Check if scrape is still processing
            if (data.scrape?.status === 'pending' || data.scrape?.status === 'running') {
              setError(`Analysis is still ${data.scrape.status}. Please wait for it to complete. You can check back later.`);
              setScrape(data.scrape); // Still show what we have
              return;
            }
            
            if (data.scrape?.status === 'failed') {
              setError(`Analysis failed: ${data.scrape.error_message || 'Unknown error'}`);
              setScrape(data.scrape);
              return;
            }
            
            setScrape(data.scrape);
            return;
          } else {
            const errorData = await response.json().catch(() => ({}));
            console.error(`Failed to load scrape: ${response.status}`, errorData);
            if (response.status === 404) {
              setError('Analysis not found. It may still be processing or may have been deleted.');
            } else {
              setError(`Failed to load analysis: ${errorData.error || 'Unknown error'}`);
            }
            return;
          }
        } catch (error) {
          console.error('Error loading from database:', error);
          setError(`Failed to load analysis: ${error.message || 'Network error'}`);
          return;
        }
      }
      
      // Fallback to IndexedDB (for numeric IDs)
      try {
        const scrapeData = await loadScrape(Number(scrapeId));
        if (!scrapeData) {
          setError('Analysis not found');
          return;
        }
        setScrape(scrapeData);
      } catch (err) {
        console.error('Error loading from IndexedDB:', err);
        setError('Failed to load analysis');
      }
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
        // Check if it's a database scrape
        const isUUID = typeof scrapeId === 'string' && scrapeId.includes('-');
        
        if (isUUID && session?.access_token && API_URL) {
          // Delete from database
          const token = getAccessToken();
          const response = await fetch(`${API_URL}/api/scrapes/${scrapeId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            navigate('/history');
            return;
          } else {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to delete');
          }
        }
        
        // Fallback to IndexedDB delete
        await deleteScrape(Number(scrapeId));
        navigate('/history');
      } catch (err) {
        console.error('Error deleting analysis:', err);
        alert('Failed to delete analysis: ' + (err.message || 'Unknown error'));
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
        subtitle={`Analyzed on ${new Date(scrape.date || scrape.created_at).toLocaleString()}`}
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
