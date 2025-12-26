import '../../styles/electric.css';

export default function ScrapeQueue({ queue, onRemove }) {
  if (queue.length === 0) {
    return null;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-electric-text-muted';
      case 'running': return 'text-electric-lime';
      case 'completed': return 'text-green-400';
      case 'failed': return 'text-red-400';
      default: return 'text-electric-text';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'running': return '⚡';
      case 'completed': return '✅';
      case 'failed': return '❌';
      default: return '○';
    }
  };

  return (
    <div className="bg-electric-muted border border-electric-border rounded-xl p-6">
      <h3 className="electric-heading text-xl text-electric-text mb-4">
        Scrape Queue <span className="electric-accent">({queue.length})</span>
      </h3>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {queue.map((item, index) => (
          <div
            key={item.id || index}
            className="flex items-center justify-between p-3 bg-electric-dark rounded-lg border border-electric-border"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getStatusIcon(item.status)}</span>
              <div>
                <div className="electric-body text-electric-text font-medium">
                  @{item.username}
                </div>
                <div className={`text-sm ${getStatusColor(item.status)}`}>
                  {item.status}
                  {item.tweetCount !== undefined && ` - ${item.tweetCount} tweets`}
                </div>
              </div>
            </div>

            {(item.status === 'completed' || item.status === 'failed') && onRemove && (
              <button
                onClick={() => onRemove(item.id)}
                className="text-electric-text-muted hover:text-red-400 transition-colors"
                title="Remove from queue"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
