import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';

export default function ScrapeQueue({ queue, onRemove }) {
  const navigate = useNavigate();

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

  const handleView = (scrapeId) => {
    if (scrapeId) {
      navigate(`/history/${scrapeId}`);
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
            <div className="flex items-center gap-3 flex-1">
              <span className="text-2xl">{getStatusIcon(item.status)}</span>
              <div className="flex-1">
                <div className="text-text-primary font-medium">
                  @{item.username}
                </div>
                <div className={`text-sm ${getStatusColor(item.status)}`}>
                  {item.status}
                  {item.tweetCount !== undefined && item.tweetCount > 0 && ` - ${item.tweetCount} tweets`}
                  {item.error && (
                    <div className="text-red-400 text-xs mt-1">
                      {item.error}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {item.status === 'completed' && item.scrapeId && (
                <button
                  onClick={() => handleView(item.scrapeId)}
                  className="text-blue-400 hover:text-blue-300 px-2 py-1 text-sm font-medium"
                  title="View tweets"
                >
                  View
                </button>
              )}
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
          </div>
        ))}
      </div>
    </div>
  );
}
