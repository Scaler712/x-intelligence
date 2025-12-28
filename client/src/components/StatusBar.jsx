import Button from './ui/Button';
import { DownloadIcon } from './ui/Icons';

export default function StatusBar({ status, stats, csvFilename, onDownload }) {
  const getStatusColor = () => {
    switch (status) {
      case 'scraping':
        return 'var(--color-blue)';
      case 'complete':
        return 'var(--color-text)';
      case 'error':
        return 'var(--color-red)';
      default:
        return 'var(--color-text-muted)';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'idle':
        return 'Ready to analyze';
      case 'scraping':
        return 'Analyzing in progress...';
      case 'complete':
        return 'Analysis complete';
      case 'error':
        return 'Error occurred';
      default:
        return '';
    }
  };

  return (
    <div className="glass-panel" style={{ padding: 'var(--space-5)' }}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: getStatusColor() }}>
            {getStatusText()}
          </p>
          {stats && (
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
              {stats.total} tweets collected
              {stats.filtered > 0 && ` • ${stats.filtered} filtered`}
            </p>
          )}
        </div>

        {csvFilename && (
          <Button
            variant="primary"
            size="sm"
            onClick={onDownload}
          >
            <DownloadIcon className="w-3.5 h-3.5" />
            Download CSV
          </Button>
        )}
      </div>
    </div>
  );
}
