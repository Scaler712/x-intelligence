import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllScrapes } from '../utils/storage';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';

export default function HistoryPage() {
  const [scrapes, setScrapes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScrapes();
  }, []);

  async function loadScrapes() {
    try {
      const allScrapes = await getAllScrapes();
      setScrapes(allScrapes.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (error) {
      console.error('Error loading scrapes:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div>
        <PageHeader
          breadcrumbs={['Home', 'History']}
          title="History"
          subtitle="View your previous analyses"
        />
        <div className="px-8 pb-10">
          <div className="text-center py-12 text-[#a0a0a0] font-light">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        breadcrumbs={['Home', 'History']}
        title="History"
        subtitle="View your previous analyses"
      />

      <div className="px-8 pb-10">
        {scrapes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#a0a0a0] font-light">No previous analyses found.</p>
            <Link to="/" className="text-[#2563eb] hover:opacity-80 underline mt-4 inline-block font-light">
              Start a new analysis
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {scrapes.map((scrape) => (
              <Link
                key={scrape.id}
                to={`/history/${scrape.id}`}
                className="block p-4 hover:bg-[#1a1a1a] transition-none rounded-xl"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-light">@{scrape.username}</h3>
                    <p className="text-sm text-[#a0a0a0] mt-1 font-light">
                      {new Date(scrape.date).toLocaleString()} • {scrape.stats?.total || 0} tweets
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-[#a0a0a0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
