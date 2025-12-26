import { useState } from 'react';
import '../../styles/electric.css';

export default function BatchScrapeForm({ onBatchStart, isProcessing }) {
  const [usernames, setUsernames] = useState('');
  const [filters, setFilters] = useState({
    MIN_LIKES: 0,
    MIN_RETWEETS: 0,
    MIN_COMMENTS: 0,
    MIN_TOTAL_ENGAGEMENT: 0
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const usernameList = usernames
      .split('\n')
      .map(u => u.trim())
      .filter(u => u.length > 0);

    if (usernameList.length === 0) {
      alert('Please enter at least one username');
      return;
    }

    onBatchStart(usernameList, filters);
  };

  return (
    <div className="bg-electric-muted border border-electric-border rounded-xl p-6">
      <h2 className="electric-heading text-2xl text-electric-text mb-4">
        Batch <span className="electric-accent">Scrape</span>
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-electric-text-muted mb-2">
            Usernames (one per line)
          </label>
          <textarea
            value={usernames}
            onChange={(e) => setUsernames(e.target.value)}
            placeholder="elonmusk&#10;naval&#10;pmarca"
            className="w-full h-32 bg-electric-dark border border-electric-border rounded-lg px-4 py-3 text-electric-text placeholder-electric-text-muted focus:outline-none focus:border-electric-lime transition-colors font-mono text-sm"
            disabled={isProcessing}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-electric-text-muted mb-2">Min Likes</label>
            <input
              type="number"
              value={filters.MIN_LIKES}
              onChange={(e) => setFilters(prev => ({ ...prev, MIN_LIKES: parseInt(e.target.value) || 0 }))}
              className="w-full bg-electric-dark border border-electric-border rounded-lg px-3 py-2 text-electric-text focus:outline-none focus:border-electric-lime transition-colors"
              disabled={isProcessing}
            />
          </div>
          <div>
            <label className="block text-sm text-electric-text-muted mb-2">Min Retweets</label>
            <input
              type="number"
              value={filters.MIN_RETWEETS}
              onChange={(e) => setFilters(prev => ({ ...prev, MIN_RETWEETS: parseInt(e.target.value) || 0 }))}
              className="w-full bg-electric-dark border border-electric-border rounded-lg px-3 py-2 text-electric-text focus:outline-none focus:border-electric-lime transition-colors"
              disabled={isProcessing}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isProcessing}
          className="w-full inline-flex items-center justify-center rounded-lg font-light transition-all duration-200 h-12 px-6 bg-electric-lime text-black hover:bg-electric-lime/90 electric-glow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? '⏳ Processing...' : '🚀 Start Batch Scrape'}
        </button>
      </form>
    </div>
  );
}
