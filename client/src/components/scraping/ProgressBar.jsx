import { useMemo } from 'react';
import '../../styles/electric.css';

export default function ProgressBar({
  current = 0,
  total = 0,
  status = 'idle',
  isPaused = false,
  onPause,
  onResume,
  onCancel
}) {
  const percentage = useMemo(() => {
    if (total === 0) return 0;
    return Math.min(100, Math.round((current / total) * 100));
  }, [current, total]);

  const estimatedTimeRemaining = useMemo(() => {
    if (status !== 'scraping' || current === 0 || total === 0) return null;
    // Rough estimate: ~0.5 seconds per tweet
    const remaining = total - current;
    const seconds = Math.round(remaining * 0.5);
    if (seconds < 60) return `~${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `~${minutes}m`;
  }, [current, total, status]);

  if (status === 'idle') return null;

  return (
    <div className="bg-electric-muted border border-electric-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="electric-body text-electric-text">
            {status === 'scraping' && !isPaused && '⚡ Scraping...'}
            {isPaused && '⏸️ Paused'}
            {status === 'complete' && '✅ Complete'}
            {status === 'error' && '❌ Error'}
          </span>
          <span className="text-electric-text-muted text-sm">
            {current} / {total > 0 ? total : '?'} tweets
            {percentage > 0 && ` (${percentage}%)`}
          </span>
          {estimatedTimeRemaining && (
            <span className="text-electric-lime text-sm">{estimatedTimeRemaining} remaining</span>
          )}
        </div>

        {status === 'scraping' && (
          <div className="flex items-center gap-2">
            {isPaused ? (
              <button
                onClick={onResume}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-light transition-all duration-200 bg-electric-lime text-black hover:bg-electric-lime/90"
              >
                ▶️ Resume
              </button>
            ) : (
              <button
                onClick={onPause}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-light transition-all duration-200 bg-electric-dark border border-electric-border text-electric-text hover:border-electric-lime"
              >
                ⏸️ Pause
              </button>
            )}
            {onCancel && (
              <button
                onClick={onCancel}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-light transition-all duration-200 bg-red-900/20 border border-red-500/50 text-red-400 hover:bg-red-900/30"
              >
                ✕ Cancel
              </button>
            )}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {total > 0 && (
        <div className="relative w-full h-2 bg-electric-border rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-electric-lime transition-all duration-300 ease-out electric-glow"
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}
