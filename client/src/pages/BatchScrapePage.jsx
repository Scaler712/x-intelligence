import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import BatchScrapeForm from '../components/scraping/BatchScrapeForm';
import ScrapeQueue from '../components/scraping/ScrapeQueue';
import { saveScrape } from '../utils/storage';

// Get API URL
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.includes('railway.internal')) {
    console.warn('VITE_API_URL contains internal Railway URL. Please use the public Railway URL instead.');
    return '';
  }
  return envUrl || (import.meta.env.DEV ? 'http://localhost:3001' : '');
};

const SOCKET_URL = getApiUrl();

export default function BatchScrapePage() {
  const { session } = useAuth();
  const [socket, setSocket] = useState(null);
  const [queue, setQueue] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const queueRef = useRef([]);
  const currentIndexRef = useRef(-1);

  // Keep refs in sync
  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Setup socket connection
  useEffect(() => {
    if (!SOCKET_URL || SOCKET_URL.includes('railway.internal')) {
      return;
    }

    const accessToken = session?.access_token;
    if (!accessToken) {
      return;
    }

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      auth: {
        token: accessToken
      },
      extraHeaders: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    newSocket.on('connect', () => {
      console.log('Batch socket connected');
    });

    newSocket.on('scrape:started', (data) => {
      console.log('Scrape started:', data);
      const idx = currentIndexRef.current;
      if (idx >= 0 && idx < queueRef.current.length) {
        setQueue(prev => prev.map((item, i) => 
          i === idx ? { ...item, status: 'running', filename: data.filename } : item
        ));
      }
    });

    newSocket.on('scrape:progress', (data) => {
      const idx = currentIndexRef.current;
      if (idx >= 0 && idx < queueRef.current.length) {
        setQueue(prev => prev.map((item, i) => 
          i === idx ? { 
            ...item, 
            tweetCount: data.stats?.total || 0,
            progress: data.progress || 0
          } : item
        ));
      }
    });

    newSocket.on('scrape:complete', async (data) => {
      console.log('Scrape complete:', data);
      const idx = currentIndexRef.current;
      if (idx >= 0 && idx < queueRef.current.length) {
        setQueue(prev => prev.map((item, i) => 
          i === idx ? { 
            ...item, 
            status: 'completed',
            tweetCount: data.total || 0,
            scrapeId: data.scrapeId
          } : item
        ));

        // Save to IndexedDB
        try {
          await saveScrape({
            id: Date.now() + idx,
            username: queueRef.current[idx].username,
            date: new Date().toISOString(),
            stats: {
              total: data.total || 0,
              filtered: data.filtered || 0
            },
            filters: queueRef.current[idx].filters,
            csvFilename: data.filename,
            tweets: [] // Tweets are stored in database, not IndexedDB for batch
          });
        } catch (error) {
          console.error('Error saving scrape:', error);
        }

        // Process next item
        processNext();
      }
    });

    newSocket.on('scrape:error', (data) => {
      console.error('Scrape error:', data);
      const idx = currentIndexRef.current;
      if (idx >= 0 && idx < queueRef.current.length) {
        setQueue(prev => prev.map((item, i) => 
          i === idx ? { 
            ...item, 
            status: 'failed',
            error: data.message || 'Unknown error'
          } : item
        ));
        // Continue with next item even on error
        processNext();
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [session?.access_token]);

  const processNext = () => {
    const nextIndex = currentIndexRef.current + 1;
    if (nextIndex < queueRef.current.length) {
      setCurrentIndex(nextIndex);
      startScrape(nextIndex);
    } else {
      // All done
      setIsProcessing(false);
      setCurrentIndex(-1);
    }
  };

  const startScrape = (index) => {
    if (!socket || !socket.connected) {
      setQueue(prev => prev.map((item, i) => 
        i === index ? { ...item, status: 'failed', error: 'Not connected' } : item
      ));
      processNext();
      return;
    }

    const item = queueRef.current[index];
    if (!item) return;

    const scraperApiKey = localStorage.getItem('scraperApiKey');
    
    socket.emit('scrape:start', {
      username: item.username.trim(),
      filters: item.filters,
      apiKey: scraperApiKey || undefined,
    });
  };

  const handleBatchStart = (usernames, filters) => {
    if (usernames.length === 0) {
      alert('Please enter at least one username');
      return;
    }

    const newQueue = usernames.map((username, index) => ({
      id: Date.now() + index,
      username: username.trim(),
      filters,
      status: 'pending',
      tweetCount: 0,
      progress: 0,
    }));

    setQueue(newQueue);
    setIsProcessing(true);
    setCurrentIndex(0);
    
    // Start processing immediately
    setTimeout(() => {
      startScrape(0);
    }, 100);
  };

  const handleRemove = (id) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div>
      <PageHeader
        breadcrumbs={['Home', 'Batch']}
        title="Batch Analysis"
        subtitle="Analyze multiple X profiles at once"
      />

      <div className="px-4 sm:px-6 lg:px-8 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BatchScrapeForm
            onBatchStart={handleBatchStart}
            isProcessing={isProcessing}
          />
          <ScrapeQueue
            queue={queue}
            onRemove={handleRemove}
          />
        </div>
      </div>
    </div>
  );
}
