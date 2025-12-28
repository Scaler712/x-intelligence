import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSearchParams } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import FormField from '../components/ui/FormField';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Divider from '../components/ui/Divider';
import TweetList from '../components/TweetList';
import HooksList from '../components/HooksList';
import TabNavigation from '../components/TabNavigation';
import StatusBar from '../components/StatusBar';
import StatsSidebar from '../components/StatsSidebar';
import AnalysisDashboard from '../components/AnalysisDashboard';
import SearchBar from '../components/ui/SearchBar';
import AdvancedFilterPanel from '../components/filters/AdvancedFilterPanel';
import ProgressBar from '../components/scraping/ProgressBar';
import { useSearch } from '../hooks/useSearch';
import { useFilters } from '../hooks/useFilters';
import { saveScrape } from '../utils/storage';

const SOCKET_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '');

export default function ScraperPage() {
  const [searchParams] = useSearchParams();
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState(searchParams.get('username') || '');
  const [filters, setFilters] = useState({
    MIN_LIKES: 0,
    MIN_RETWEETS: 0,
    MIN_COMMENTS: 0,
    MIN_TOTAL_ENGAGEMENT: 0,
  });
  const [tweets, setTweets] = useState([]);
  const [seenTweetKeys, setSeenTweetKeys] = useState(new Set());
  const [status, setStatus] = useState('idle');
  const [stats, setStats] = useState(null);
  const [csvFilename, setCsvFilename] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('tweets');
  const [isPaused, setIsPaused] = useState(false);

  const { searchQuery, setSearchQuery, filteredItems: searchedTweets, matchCount } = useSearch(tweets, 'content');
  const {
    filters: advancedFilters,
    filteredItems: finalTweets,
    updateFilter,
    updateDateRange,
    resetFilters,
    hasActiveFilters
  } = useFilters(searchedTweets);
  
  const usernameRef = useRef(username);
  const filtersRef = useRef(filters);
  const tweetsRef = useRef(tweets);

  useEffect(() => {
    usernameRef.current = username;
  }, [username]);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    tweetsRef.current = tweets;
  }, [tweets]);

  useEffect(() => {
    const urlUsername = searchParams.get('username');
    if (urlUsername) {
      setUsername(urlUsername);
    }
  }, [searchParams]);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setError(null);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    newSocket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError('Failed to connect to server. Make sure the server is running.');
      setStatus('error');
    });

    newSocket.on('scrape:started', (data) => {
      console.log('Scraping started:', data);
      setStatus('scraping');
      setTweets([]);
      setSeenTweetKeys(new Set());
      setStats({ total: 0, filtered: 0 });
      setCsvFilename(null);
      setError(null);
    });

    newSocket.on('scrape:progress', (data) => {
      console.log('Progress:', data);
      const newTweet = data.tweet;
      const tweetKey = `${newTweet.content}|${newTweet.date}`;
      
      setSeenTweetKeys((prev) => {
        if (prev.has(tweetKey)) {
          return prev;
        }
        setTweets((prevTweets) => [...prevTweets, newTweet]);
        return new Set([...prev, tweetKey]);
      });
      setStats(data.stats);
    });

    newSocket.on('scrape:complete', async (data) => {
      console.log('Scraping complete:', data);
      setStatus('complete');
      setCsvFilename(data.filename);
      const finalStats = {
        total: data.total,
        filtered: data.filtered,
      };
      setStats(finalStats);

      try {
        const currentTweets = tweetsRef.current;
        await saveScrape({
          id: Date.now(),
          username: usernameRef.current,
          date: new Date().toISOString(),
          stats: finalStats,
          filters: filtersRef.current,
          csvFilename: data.filename,
          tweets: currentTweets
        });
        console.log('Scrape saved to IndexedDB');
      } catch (error) {
        console.error('Error saving scrape to IndexedDB:', error);
      }
    });

    newSocket.on('scrape:error', (data) => {
      console.error('Scraping error:', data);
      setStatus('error');
      const errorMessage = typeof data.message === 'object' ? JSON.stringify(data.message) : data.message;
      setError(errorMessage || 'An unknown error occurred during scraping');
    });

    newSocket.on('scrape:paused', () => {
      setIsPaused(true);
    });

    newSocket.on('scrape:resumed', () => {
      setIsPaused(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = () => {
    if (!socket || !socket.connected) {
      setError('Not connected to server');
      setStatus('error');
      return;
    }

    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    const scraperApiKey = localStorage.getItem('scraperApiKey');
    
    socket.emit('scrape:start', {
      username: username.trim(),
      filters: filters,
      apiKey: scraperApiKey || undefined,
    });
  };

  const handleDownload = () => {
    if (csvFilename) {
      window.open(`${SOCKET_URL}/api/download/${csvFilename}`, '_blank');
    }
  };

  const handleHookClick = (tweetIndex) => {
    setActiveTab('tweets');
    
    // Scroll to the tweet after a short delay to allow tab switch
    setTimeout(() => {
      const tweetElement = document.querySelector(`[data-tweet-index="${tweetIndex}"]`);
      if (tweetElement) {
        tweetElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        
        // Add a highlight effect
        tweetElement.classList.add('ring-2', 'ring-[#2563eb]', 'ring-opacity-50');
        setTimeout(() => {
          tweetElement.classList.remove('ring-2', 'ring-[#2563eb]', 'ring-opacity-50');
        }, 2000);
      }
    }, 100);
  };

  const handlePause = () => {
    if (socket && socket.connected) {
      socket.emit('scrape:pause');
      setIsPaused(true);
    }
  };

  const handleResume = () => {
    if (socket && socket.connected) {
      socket.emit('scrape:resume');
      setIsPaused(false);
    }
  };

  // Calculate metrics
  const totalTweets = finalTweets.length;
  const totalEngagement = finalTweets.reduce((sum, t) => sum + (t.likes || 0) + (t.retweets || 0) + (t.comments || 0), 0);
  const avgEngagement = totalTweets > 0 ? Math.round(totalEngagement / totalTweets) : 0;
  const topEngagement = finalTweets.length > 0 ? Math.max(...finalTweets.map(t => (t.likes || 0) + (t.retweets || 0) + (t.comments || 0))) : 0;

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        breadcrumbs={['Home', "X Intelligence", 'Dashboard']}
        title="Dashboard"
        subtitle="Analyze and collect tweets with advanced filtering"
      />

      <div className="px-8 py-8">
        <div className="space-y-8">
          {/* Analysis Setup Section */}
          <section className="space-y-6">
            <h2 className="text-xl font-light text-foreground tracking-tight">Analysis Setup</h2>
            
            <div className="space-y-6">
              <FormField label="X Username">
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={status === 'scraping'}
                  placeholder="Enter username (without @)"
                />
              </FormField>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormField label="Minimum Likes">
                  <Input
                    type="number"
                    min="0"
                    value={filters.MIN_LIKES || 0}
                    onChange={(e) => handleFilterChange('MIN_LIKES', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </FormField>

                <FormField label="Minimum Retweets">
                  <Input
                    type="number"
                    min="0"
                    value={filters.MIN_RETWEETS || 0}
                    onChange={(e) => handleFilterChange('MIN_RETWEETS', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </FormField>

                <FormField label="Minimum Comments">
                  <Input
                    type="number"
                    min="0"
                    value={filters.MIN_COMMENTS || 0}
                    onChange={(e) => handleFilterChange('MIN_COMMENTS', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </FormField>

                <FormField label="Minimum Total Engagement">
                  <Input
                    type="number"
                    min="0"
                    value={filters.MIN_TOTAL_ENGAGEMENT || 0}
                    onChange={(e) => handleFilterChange('MIN_TOTAL_ENGAGEMENT', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </FormField>
              </div>

              <div>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={status === 'scraping' || !username.trim()}
                  className="w-full h-11"
                >
                  {status === 'scraping' ? 'Analyzing...' : 'Start Analysis'}
                </Button>
              </div>

              {error && status === 'error' && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-destructive text-sm font-light">
                  {error}
                </div>
              )}

              <ProgressBar
                current={tweets.length}
                total={stats?.total || 0}
                status={status}
                isPaused={isPaused}
                onPause={handlePause}
                onResume={handleResume}
              />

              <StatusBar
                status={status}
                stats={stats}
                csvFilename={csvFilename}
                onDownload={handleDownload}
              />
            </div>
          </section>

          {/* Metrics Section */}
          {tweets.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-xl font-light text-foreground tracking-tight">Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="liquid-glass p-6">
                  <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-light">Total Tweets</div>
                  <div className="text-3xl font-light text-foreground tracking-tight">{totalTweets.toLocaleString()}</div>
                </div>
                <div className="liquid-glass p-6">
                  <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-light">Total Engagement</div>
                  <div className="text-3xl font-light text-foreground tracking-tight">{totalEngagement.toLocaleString()}</div>
                </div>
                <div className="liquid-glass p-6">
                  <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-light">Avg Engagement</div>
                  <div className="text-3xl font-light text-foreground tracking-tight">{avgEngagement.toLocaleString()}</div>
                </div>
                <div className="liquid-glass p-6">
                  <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-light">Top Engagement</div>
                  <div className="text-3xl font-light text-foreground tracking-tight">{topEngagement.toLocaleString()}</div>
                </div>
              </div>
            </section>
          )}

          {/* Tweet Collection Section */}
          {tweets.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-xl font-light text-foreground tracking-tight">Tweet Collection</h2>

              <div>
                <SearchBar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  placeholder="Search tweets..."
                  matchCount={matchCount}
                />
              </div>

              <AdvancedFilterPanel
                filters={advancedFilters}
                onFilterChange={updateFilter}
                onDateRangeChange={updateDateRange}
                onReset={resetFilters}
              />

              {(searchQuery || hasActiveFilters) && (
                <div className="text-sm text-muted-foreground font-light">
                  Showing {finalTweets.length} of {tweets.length} tweets
                </div>
              )}

              <div className="mt-4">
                <TabNavigation
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  tweetCount={finalTweets.length}
                />
                <div className="mt-6">
                  {activeTab === 'tweets' && <TweetList tweets={finalTweets} />}
                  {activeTab === 'hooks' && <HooksList tweets={finalTweets} onHookClick={handleHookClick} />}
                  {activeTab === 'analysis' && (
                    <AnalysisDashboard 
                      tweets={finalTweets} 
                      stats={stats}
                      username={username.trim()}
                    />
                  )}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Stats Sidebar */}
      {tweets.length > 0 && (
        <div className="fixed right-0 top-[120px] w-[280px] pr-8">
          <StatsSidebar tweets={finalTweets} />
        </div>
      )}
    </div>
  );
}
