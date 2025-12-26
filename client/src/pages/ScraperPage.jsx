import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSearchParams } from 'react-router-dom';
import '../styles/electric.css';
import TweetForm from '../components/TweetForm';
import Filters from '../components/Filters';
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

const SOCKET_URL = 'http://localhost:3001';

export default function ScraperPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState(searchParams.get('username') || '');
  const [filters, setFilters] = useState({
    MIN_LIKES: 0,
    MIN_RETWEETS: 0,
    MIN_COMMENTS: 0,
    MIN_TOTAL_ENGAGEMENT: 0,
  });
  const [tweets, setTweets] = useState([]);
  const [seenTweetKeys, setSeenTweetKeys] = useState(new Set()); // Track seen tweets for deduplication
  const [status, setStatus] = useState('idle'); // idle, scraping, complete, error
  const [stats, setStats] = useState(null);
  const [csvFilename, setCsvFilename] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('tweets');
  const [isPaused, setIsPaused] = useState(false);

  // Search and filter hooks
  const { searchQuery, setSearchQuery, filteredItems: searchedTweets, matchCount } = useSearch(tweets, 'content');
  const {
    filters: advancedFilters,
    filteredItems: finalTweets,
    updateFilter,
    updateDateRange,
    resetFilters,
    hasActiveFilters
  } = useFilters(searchedTweets);
  
  // Use refs to store current values for use in socket handlers
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

  // Update username from URL params
  useEffect(() => {
    const urlUsername = searchParams.get('username');
    if (urlUsername) {
      setUsername(urlUsername);
    }
  }, [searchParams]);

  useEffect(() => {
    // Initialize Socket.io connection
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
      setSeenTweetKeys(new Set()); // Reset seen tweets when starting new scrape
      setStats({ total: 0, filtered: 0 });
      setCsvFilename(null);
      setError(null);
    });

    newSocket.on('scrape:progress', (data) => {
      console.log('Progress:', data);
      const newTweet = data.tweet;
      // Create unique key for deduplication
      const tweetKey = `${newTweet.content}|${newTweet.date}`;
      
      setSeenTweetKeys((prev) => {
        // Skip if we've seen this tweet
        if (prev.has(tweetKey)) {
          return prev;
        }
        // Add to seen set and to tweets list
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

      // Save to IndexedDB using refs to get current values
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
      setError(data.message || 'An error occurred during scraping');
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

    socket.emit('scrape:start', {
      username: username.trim(),
      filters: filters,
    });
  };

  const handleDownload = () => {
    if (csvFilename) {
      window.open(`${SOCKET_URL}/api/download/${csvFilename}`, '_blank');
    }
  };

  const handleHookClick = (tweetIndex) => {
    // Switch to tweets tab and scroll to the tweet
    setActiveTab('tweets');
    // Note: Scroll functionality can be enhanced later with refs
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

  return (
    <div className="min-h-screen bg-electric-dark p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="electric-heading text-4xl md:text-5xl text-electric-text mb-2">
            Twitter <span className="electric-accent">Scraper</span> Dashboard
          </h1>
          <p className="electric-body text-electric-text-muted">
            Scrape and filter tweets in real-time
          </p>
        </div>

        {/* Error Display */}
        {error && status === 'error' && (
          <div className="bg-red-900/20 border border-red-500 rounded-xl p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Form Section */}
        <div className="space-y-6">
          <TweetForm
            username={username}
            onUsernameChange={setUsername}
            onSubmit={handleSubmit}
            isScraping={status === 'scraping'}
          />

          <Filters filters={filters} onFilterChange={handleFilterChange} />

          {/* Enhanced Progress Bar */}
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

        {/* Search and Advanced Filters */}
        {tweets.length > 0 && (
          <div className="space-y-4">
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              placeholder="Search tweets..."
              matchCount={matchCount}
            />
            <AdvancedFilterPanel
              filters={advancedFilters}
              onFilterChange={updateFilter}
              onDateRangeChange={updateDateRange}
              onReset={resetFilters}
            />
            {(searchQuery || hasActiveFilters) && (
              <div className="text-sm text-electric-text-muted">
                Showing {finalTweets.length} of {tweets.length} tweets
              </div>
            )}
          </div>
        )}

        {/* Main Content Area with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Stats Sidebar */}
          <StatsSidebar tweets={finalTweets} />

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Tab Navigation */}
            <TabNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
              tweetCount={finalTweets.length}
            />

            {/* Content Area - Tabs */}
            {activeTab === 'tweets' && <TweetList tweets={finalTweets} />}
            {activeTab === 'hooks' && <HooksList tweets={finalTweets} onHookClick={handleHookClick} />}
            {activeTab === 'analysis' && <AnalysisDashboard tweets={finalTweets} />}
          </div>
        </div>
      </div>
    </div>
  );
}

