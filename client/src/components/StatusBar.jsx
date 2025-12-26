import '../styles/electric.css';

export default function StatusBar({ status, stats, csvFilename, onDownload }) {
  const getStatusColor = () => {
    switch (status) {
      case 'scraping':
        return 'text-electric-lime electric-pulse';
      case 'complete':
        return 'text-electric-lime';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-electric-text-muted';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'idle':
        return 'Ready to scrape';
      case 'scraping':
        return 'Scraping in progress...';
      case 'complete':
        return 'Scraping complete!';
      case 'error':
        return 'Error occurred';
      default:
        return '';
    }
  };

  return (
    <div className="bg-electric-muted border border-electric-border rounded-xl p-6 relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-3 h-3 rounded-full ${
                status === 'scraping' ? 'bg-electric-lime electric-pulse' :
                status === 'complete' ? 'bg-electric-lime' :
                status === 'error' ? 'bg-red-400' :
                'bg-electric-text-muted'
              }`}></div>
              <span className={`electric-body font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </div>
            
            {stats && (
              <div className="flex flex-wrap gap-4 text-sm text-electric-text-muted">
                <span>
                  <span className="electric-accent">✓</span> {stats.total || 0} tweets scraped
                </span>
                {stats.filtered !== undefined && stats.filtered > 0 && (
                  <span>
                    <span className="electric-accent">⊘</span> {stats.filtered} filtered out
                  </span>
                )}
              </div>
            )}
          </div>

          {status === 'complete' && csvFilename && (
            <button
              onClick={onDownload}
              className="inline-flex items-center justify-center rounded-lg font-light transition-all duration-200 bg-electric-lime text-black hover:bg-electric-lime/90 electric-glow h-10 px-6"
            >
              Download CSV
            </button>
          )}
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-electric-lime/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
}

