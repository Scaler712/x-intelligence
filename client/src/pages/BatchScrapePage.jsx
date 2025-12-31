import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from '../components/layout/PageHeader';
import BatchScrapeForm from '../components/scraping/BatchScrapeForm';
import ScrapeQueue from '../components/scraping/ScrapeQueue';

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
  const [queue, setQueue] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const pollIntervalRef = useRef(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const startPolling = (scrapeIds) => {
    // Clear any existing polling
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    if (scrapeIds.length === 0) {
      setIsProcessing(false);
      return;
    }

    const accessToken = session?.access_token;
    if (!accessToken) {
      setIsProcessing(false);
      return;
    }

    pollIntervalRef.current = setInterval(async () => {
      const currentAccessToken = session?.access_token;
      if (!currentAccessToken) {
        clearInterval(pollIntervalRef.current);
        setIsProcessing(false);
        return;
      }

      try {
        const statuses = await Promise.all(
          scrapeIds.map(async (scrapeId) => {
            try {
              const response = await fetch(`${SOCKET_URL}/api/scrapes/${scrapeId}/status`, {
                headers: {
                  'Authorization': `Bearer ${currentAccessToken}`
                }
              });
              
              if (response.ok) {
                return await response.json();
              } else if (response.status === 404) {
                return { id: scrapeId, status: 'failed', error_message: 'Job not found' };
              }
            } catch (error) {
              console.error('Error polling status:', error);
            }
            return null;
          })
        );

        // Update queue with statuses
        setQueue(prev => prev.map(item => {
          const status = statuses.find(s => s && s.id === item.scrapeId);
          if (!status) return item;

          return {
            ...item,
            status: status.status,
            tweetCount: status.stats?.total || 0,
            error: status.error_message
          };
        }));

        // Check if all jobs are done
        const allDone = statuses.every(s => 
          !s || s.status === 'completed' || s.status === 'failed'
        );

        if (allDone) {
          clearInterval(pollIntervalRef.current);
          setIsProcessing(false);
        }
      } catch (error) {
        console.error('Error in polling:', error);
      }
    }, 3000); // Poll every 3 seconds
  };

  const handleBatchStart = async (usernames, filters) => {
    if (usernames.length === 0) {
      alert('Please enter at least one username');
      return;
    }

    const accessToken = session?.access_token;
    if (!accessToken) {
      alert('Please log in to use batch analysis');
      return;
    }

    const scraperApiKey = localStorage.getItem('scraperApiKey');

    setIsProcessing(true);

    // Create jobs for all usernames
    const newQueue = await Promise.all(
      usernames.map(async (username, index) => {
        try {
          const response = await fetch(`${SOCKET_URL}/api/scrapes/create-job`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
              username: username.trim(),
              filters,
              apiKey: scraperApiKey || undefined
            })
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to create job');
          }

          const { scrapeId } = await response.json();
          
          return {
            id: Date.now() + index,
            username: username.trim(),
            filters,
            status: 'pending',
            tweetCount: 0,
            scrapeId
          };
        } catch (error) {
          console.error(`Error creating job for ${username}:`, error);
          return {
            id: Date.now() + index,
            username: username.trim(),
            filters,
            status: 'failed',
            error: error.message || 'Failed to create job',
            tweetCount: 0
          };
        }
      })
    );

    setQueue(newQueue);
    
    // Start polling for status updates
    const validScrapeIds = newQueue
      .filter(item => item.scrapeId && item.status !== 'failed')
      .map(item => item.scrapeId);
    
    if (validScrapeIds.length > 0) {
      startPolling(validScrapeIds);
      
      // Also do an immediate poll
      setTimeout(() => {
        const accessToken = session?.access_token;
        if (accessToken) {
          Promise.all(
            validScrapeIds.map(async (scrapeId) => {
              try {
                const response = await fetch(`${SOCKET_URL}/api/scrapes/${scrapeId}/status`, {
                  headers: {
                    'Authorization': `Bearer ${accessToken}`
                  }
                });
                if (response.ok) {
                  return await response.json();
                }
              } catch (error) {
                console.error('Error in immediate poll:', error);
              }
              return null;
            })
          ).then(statuses => {
            setQueue(prev => prev.map(item => {
              const status = statuses.find(s => s && s.id === item.scrapeId);
              if (!status) return item;

              return {
                ...item,
                status: status.status,
                tweetCount: status.stats?.total || 0,
                error: status.error_message
              };
            }));
          });
        }
      }, 500);
    } else {
      setIsProcessing(false);
    }
  };

  const handleRemove = (id) => {
    setQueue(prev => {
      const newQueue = prev.filter(item => item.id !== id);
      // If queue becomes empty, stop processing
      if (newQueue.length === 0) {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
        setIsProcessing(false);
      }
      return newQueue;
    });
  };

  return (
    <div>
      <PageHeader
        breadcrumbs={['Home', 'Batch']}
        title="Batch Analysis"
        subtitle="Analyze multiple X profiles at once - jobs continue even if you close the page"
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
