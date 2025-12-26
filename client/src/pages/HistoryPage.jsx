import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/electric.css';
import { getAllScrapes, deleteScrape } from '../utils/storage';
import ScrapeCard from '../components/ScrapeCard';

export default function HistoryPage() {
  const [scrapes, setScrapes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadScrapes();
  }, []);

  const loadScrapes = async () => {
    try {
      setLoading(true);
      const allScrapes = await getAllScrapes();
      setScrapes(allScrapes);
    } catch (error) {
      console.error('Error loading scrapes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (scrapeId) => {
    if (window.confirm('Are you sure you want to delete this scrape?')) {
      try {
        await deleteScrape(scrapeId);
        await loadScrapes();
      } catch (error) {
        console.error('Error deleting scrape:', error);
        alert('Failed to delete scrape');
      }
    }
  };

  const handleScrapeAgain = (username) => {
    navigate(`/?username=${username}`);
  };

  const filteredScrapes = scrapes.filter(scrape =>
    scrape.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-electric-dark p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-electric-muted border border-electric-border rounded-xl p-12 text-center">
            <p className="electric-body text-electric-text-muted">Loading history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-electric-dark p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="electric-heading text-4xl md:text-5xl text-electric-text mb-2">
              Scrape <span className="electric-accent">History</span>
            </h1>
            <p className="electric-body text-electric-text-muted">
              View and manage your past scrapes
            </p>
          </div>

          {/* Search */}
          <div className="flex-1 md:max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username..."
              className="w-full bg-electric-muted border border-electric-border rounded-lg px-4 py-2 text-electric-text focus:outline-none focus:border-electric-lime transition-colors"
            />
          </div>
        </div>

        {/* Scrapes Grid */}
        {filteredScrapes.length === 0 ? (
          <div className="bg-electric-muted border border-electric-border rounded-xl p-12 text-center">
            <p className="electric-body text-electric-text-muted">
              {searchQuery ? 'No scrapes found matching your search.' : 'No scrapes yet. Start scraping to see your history here.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScrapes.map((scrape) => (
              <ScrapeCard
                key={scrape.id}
                scrape={scrape}
                onView={() => navigate(`/history/${scrape.id}`)}
                onScrapeAgain={() => handleScrapeAgain(scrape.username)}
                onDelete={() => handleDelete(scrape.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

