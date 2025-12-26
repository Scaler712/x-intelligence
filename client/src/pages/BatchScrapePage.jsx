import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import '../styles/electric.css';
import BatchScrapeForm from '../components/scraping/BatchScrapeForm';
import ScrapeQueue from '../components/scraping/ScrapeQueue';
import { addToQueue, getQueue, updateQueueItem, deleteQueueItem } from '../utils/storage';

const SOCKET_URL = 'http://localhost:3001';

export default function BatchScrapePage() {
  const [socket, setSocket] = useState(null);
  const [queue, setQueue] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Load queue from IndexedDB
  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    const savedQueue = await getQueue();
    setQueue(savedQueue);
  };

  // Initialize Socket.io
  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to server for batch scraping');
    });

    newSocket.on('scrape:complete', async (data) => {
      // Update current item in queue
      if (queue[currentIndex]) {
        const item = queue[currentIndex];
        await updateQueueItem(item.id, 'completed', { tweetCount: data.total });
        await loadQueue();
      }

      // Move to next user
      if (currentIndex < queue.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsProcessing(false);
        setCurrentIndex(0);
      }
    });

    newSocket.on('scrape:error', async (data) => {
      if (queue[currentIndex]) {
        const item = queue[currentIndex];
        await updateQueueItem(item.id, 'failed', { error: data.message });
        await loadQueue();
      }

      // Move to next regardless of error
      if (currentIndex < queue.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsProcessing(false);
        setCurrentIndex(0);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [currentIndex, queue]);

  const handleBatchStart = async (usernames, filters) => {
    // Clear old queue
    setQueue([]);
    setCurrentIndex(0);

    // Add all usernames to queue
    const queueItems = [];
    for (const username of usernames) {
      const id = await addToQueue({ username, filters, status: 'pending' });
      queueItems.push({ id, username, filters, status: 'pending' });
    }

    setQueue(queueItems);
    setIsProcessing(true);

    // Start scraping first user
    if (socket && socket.connected && queueItems.length > 0) {
      const firstItem = queueItems[0];
      await updateQueueItem(firstItem.id, 'running');
      socket.emit('scrape:start', {
        username: firstItem.username,
        filters: firstItem.filters
      });
    }
  };

  // Process next in queue when current changes
  useEffect(() => {
    if (isProcessing && queue.length > 0 && currentIndex < queue.length) {
      const processNext = async () => {
        const item = queue[currentIndex];
        if (socket && socket.connected) {
          await updateQueueItem(item.id, 'running');
          await loadQueue();

          // Small delay between scrapes
          setTimeout(() => {
            socket.emit('scrape:start', {
              username: item.username,
              filters: item.filters
            });
          }, 1000);
        }
      };

      processNext();
    }
  }, [currentIndex, isProcessing, queue, socket]);

  const handleRemove = async (id) => {
    await deleteQueueItem(id);
    await loadQueue();
  };

  return (
    <div className="min-h-screen bg-electric-dark p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="electric-heading text-4xl md:text-5xl text-electric-text mb-2">
            Batch <span className="electric-accent">Scraping</span>
          </h1>
          <p className="electric-body text-electric-text-muted">
            Scrape multiple Twitter accounts in sequence
          </p>
        </div>

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

        {isProcessing && (
          <div className="bg-electric-lime/10 border border-electric-lime rounded-xl p-4 text-center">
            <p className="text-electric-lime">
              ⚡ Processing {currentIndex + 1} of {queue.length}...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
