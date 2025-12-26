import '../styles/electric.css';

export default function ScrapeCard({ scrape, onView, onScrapeAgain, onDelete }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-electric-muted border border-electric-border rounded-xl p-6 hover:border-electric-lime/50 transition-all duration-300 relative overflow-hidden group">
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="electric-heading text-xl text-electric-text mb-1">
              @{scrape.username}
            </h3>
            <p className="electric-body text-sm text-electric-text-muted">
              {formatDate(scrape.date)}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-electric-text-muted mb-1">Tweets</p>
            <p className="electric-accent font-medium text-lg">{scrape.tweetCount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-electric-text-muted mb-1">Total Engagement</p>
            <p className="electric-accent font-medium text-lg">
              {((scrape.stats?.total || 0) + (scrape.stats?.filtered || 0)).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Engagement Breakdown */}
        {scrape.stats && (
          <div className="flex gap-4 text-sm text-electric-text-muted mb-4 pb-4 border-b border-electric-border">
            <span>✓ {scrape.stats.total || 0} scraped</span>
            {scrape.stats.filtered > 0 && (
              <span>⊘ {scrape.stats.filtered} filtered</span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onView}
            className="flex-1 inline-flex items-center justify-center rounded-lg font-light transition-all duration-200 bg-electric-lime text-black hover:bg-electric-lime/90 electric-glow h-9 px-4 text-sm"
          >
            View Details
          </button>
          <button
            onClick={onScrapeAgain}
            className="flex-1 inline-flex items-center justify-center rounded-lg font-light transition-all duration-200 bg-electric-dark border border-electric-border text-electric-text hover:bg-electric-border h-9 px-4 text-sm"
          >
            Scrape Again
          </button>
          <button
            onClick={onDelete}
            className="inline-flex items-center justify-center rounded-lg font-light transition-all duration-200 bg-electric-dark border border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 h-9 px-4 text-sm"
            title="Delete scrape"
          >
            🗑️
          </button>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-electric-lime/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
}

