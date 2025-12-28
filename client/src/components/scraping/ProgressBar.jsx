import { useMemo } from 'react';
import Button from '../ui/Button';
import { PauseIcon, PlayIcon, CloseIcon } from '../ui/Icons';

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
    const remaining = total - current;
    const seconds = Math.round(remaining * 0.5);
    if (seconds < 60) return `~${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `~${minutes}m`;
  }, [current, total, status]);

  if (status === 'idle') return null;

  return (
    <div className="glass-panel" style={{ padding: 'var(--space-5)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span style={{ color: 'var(--color-text)', fontSize: 'var(--text-xs)', fontWeight: 500 }}>
            {status === 'scraping' && !isPaused && 'Analyzing...'}
            {isPaused && 'Paused'}
            {status === 'complete' && 'Complete'}
            {status === 'error' && 'Error'}
          </span>
          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>
            {current} / {total > 0 ? total : '?'} tweets
            {percentage > 0 && ` (${percentage}%)`}
          </span>
          {estimatedTimeRemaining && (
            <span style={{ color: 'var(--color-blue)', fontSize: 'var(--text-xs)' }}>{estimatedTimeRemaining} remaining</span>
          )}
        </div>

        {status === 'scraping' && (
          <div className="flex items-center gap-2">
            {isPaused ? (
              <Button
                variant="primary"
                size="sm"
                onClick={onResume}
              >
                <PlayIcon className="w-3.5 h-3.5" />
                Resume
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={onPause}
              >
                <PauseIcon className="w-3.5 h-3.5" />
                Pause
              </Button>
            )}
            {onCancel && (
              <Button
                variant="danger"
                size="sm"
                onClick={onCancel}
              >
                <CloseIcon className="w-3.5 h-3.5" />
                Cancel
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {total > 0 && (
        <div className="progress-bar">
          <div
            className="progress-bar__fill"
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}
