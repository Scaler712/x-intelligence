import { useState } from 'react';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import BatchScrapeForm from '../components/scraping/BatchScrapeForm';
import ScrapeQueue from '../components/scraping/ScrapeQueue';

export default function BatchScrapePage() {
  const [queue, setQueue] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBatchStart = (usernames, filters) => {
    // Batch scraping functionality would go here
    console.log('Batch scrape:', usernames, filters);
    // For now, just add to queue
    const newQueue = usernames.map((username, index) => ({
      id: Date.now() + index,
      username,
      filters,
      status: 'pending',
    }));
    setQueue(newQueue);
  };

  const handleRemove = (id) => {
    setQueue(queue.filter(item => item.id !== id));
  };

  return (
    <div>
      <PageHeader
        breadcrumbs={['Home', 'Batch']}
        title="Batch Analysis"
        subtitle="Analyze multiple X profiles at once"
      />

      <div className="px-8 pb-10">
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
