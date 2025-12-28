import Button from '../ui/Button';

export default function ScrapeQueue({ queue, onRemove }) {
  if (queue.length === 0) {
    return null;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-text-muted';
      case 'running': return 'text-blue-primary';
      case 'completed': return 'text-green-400';
      case 'failed': return 'text-red-400';
      default: return 'text-text-primary';
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
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-text-primary">
        Analysis Queue <span className="text-blue-primary">({queue.length})</span>
      </h3>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {queue.map((item, index) => (
          <div
            key={item.id || index}
            className="flex items-center justify-between p-3 hover:bg-bg-hover transition-colors rounded-md"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getStatusIcon(item.status)}</span>
              <div>
                <div className="text-text-primary font-medium">
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
                className="text-[#a0a0a0] hover:text-red-400 px-2 py-1"
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
