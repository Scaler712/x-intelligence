import '../styles/electric.css';

export default function SettingsPage() {

  return (
    <div className="min-h-screen bg-electric-dark p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="electric-heading text-4xl md:text-5xl text-electric-text mb-2">
            <span className="electric-accent">Settings</span>
          </h1>
          <p className="electric-body text-electric-text-muted">
            Configure API keys and preferences
          </p>
        </div>

        {/* Scraper API Key Info */}
        <div className="bg-electric-muted border border-electric-border rounded-xl p-6">
          <div className="mb-4">
            <h2 className="electric-heading text-xl text-electric-text mb-2">
              Scraper API Key
            </h2>
            <p className="electric-body text-sm text-electric-text-muted">
              The scraper API key is configured on the server. Contact your administrator to change it.
            </p>
          </div>
        </div>

        {/* About */}
        <div className="bg-electric-muted border border-electric-border rounded-xl p-6">
          <h2 className="electric-heading text-xl text-electric-text mb-4">
            About
          </h2>
          <div className="space-y-2 text-sm text-electric-text-muted electric-body">
            <p>
              <strong className="electric-accent">Twitter Scraper</strong> - Scrape and analyze Twitter profiles with advanced filtering and analytics.
            </p>
            <p>
              All scraped data is stored locally in your browser using IndexedDB. Your data never leaves your device unless you explicitly export it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

