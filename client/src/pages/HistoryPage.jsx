import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAllScrapes } from '../utils/storage';
import PageHeader from '../components/layout/PageHeader';

// Get API URL
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.includes('railway.internal')) {
    return '';
  }
  return envUrl || (import.meta.env.DEV ? 'http://localhost:3001' : '');
};

const API_URL = getApiUrl();

export default function HistoryPage() {
  const { session, getAccessToken } = useAuth();
  const [scrapes, setScrapes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScrapes();
  }, [session]);

  async function loadScrapes() {
    try {
      setLoading(true);
      
      // Load from IndexedDB (old scrapes)
      const localScrapes = await getAllScrapes();
      
      // Load from database (new batch scrapes)
      let dbScrapes = [];
      if (session?.access_token && API_URL) {
        try {
          const token = getAccessToken();
          if (!token) {
            console.warn('No access token available for loading database scrapes');
          } else {
            console.log('Loading scrapes from database...');
            const response = await fetch(`${API_URL}/api/scrapes`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              console.log(`Loaded ${data.scrapes?.length || 0} scrapes from database`);
              dbScrapes = (data.scrapes || []).map(s => ({
                ...s,
                id: s.id, // UUID from database
                isDatabase: true,
                date: s.created_at || s.date
              }));
            } else {
              const errorData = await response.json().catch(() => ({}));
              console.error('Error loading database scrapes:', response.status, errorData);
            }
          }
        } catch (error) {
          console.error('Error loading database scrapes:', error);
        }
      }
      
      // Combine and deduplicate (prefer database version if both exist)
      const allScrapes = [...localScrapes, ...dbScrapes];
      const uniqueScrapes = new Map();
      
      allScrapes.forEach(scrape => {
        // For database scrapes, use UUID as key
        // For IndexedDB scrapes, use numeric ID
        const key = scrape.isDatabase ? scrape.id : scrape.id;
        if (!uniqueScrapes.has(key)) {
          uniqueScrapes.set(key, scrape);
        } else {
          // Prefer database version
          const existing = uniqueScrapes.get(key);
          if (scrape.isDatabase && !existing.isDatabase) {
            uniqueScrapes.set(key, scrape);
          }
        }
      });
      
      const sorted = Array.from(uniqueScrapes.values()).sort((a, b) => {
        const dateA = new Date(a.date || a.created_at);
        const dateB = new Date(b.date || b.created_at);
        return dateB - dateA;
      });
      
      setScrapes(sorted);
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
                      {new Date(scrape.date || scrape.created_at).toLocaleString()} • {scrape.stats?.total || 0} tweets
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
