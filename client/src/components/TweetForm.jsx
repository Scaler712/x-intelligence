import '../styles/electric.css';

export default function TweetForm({ username, onUsernameChange, onSubmit, isScraping }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim() && !isScraping) {
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-electric-muted border border-electric-border rounded-xl p-6 hover:border-electric-lime/50 transition-all duration-300 relative overflow-hidden">
      <div className="relative z-10">
        <h2 className="electric-heading text-2xl text-electric-text mb-4">
          Twitter <span className="electric-accent">Scraper</span>
        </h2>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="username" className="block text-sm text-electric-text-muted mb-2">
              Twitter Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => onUsernameChange(e.target.value)}
              disabled={isScraping}
              placeholder="Enter username (without @)"
              className="w-full bg-electric-dark border border-electric-border rounded-lg px-4 py-3 text-electric-text focus:outline-none focus:border-electric-lime transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          
          <div className="flex items-end">
            <button
              type="submit"
              disabled={!username.trim() || isScraping}
              className="inline-flex items-center justify-center rounded-lg font-light transition-all duration-200 bg-electric-lime text-black hover:bg-electric-lime/90 electric-glow h-12 px-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-electric-lime"
            >
              {isScraping ? 'Scraping...' : 'Start Scraping'}
            </button>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-electric-lime/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </form>
  );
}

