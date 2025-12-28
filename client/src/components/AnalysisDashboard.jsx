import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { generateRecommendations, getAIInsights, getApiKeys, analyzeContent } from '../services/aiService';
import { cacheAIInsights, getCachedAIInsights } from '../utils/storage';
import Button from './ui/Button';

export default function AnalysisDashboard({ tweets, scrapeId, stats, username }) {
  const { getAccessToken, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState(null);
  const [provider, setProvider] = useState('anthropic');
  const [apiKeys, setApiKeys] = useState([]);
  const [loadingKeys, setLoadingKeys] = useState(true);

  useEffect(() => {
    if (user) {
      loadApiKeys();
    }
  }, [user]);

  useEffect(() => {
    if ((scrapeId || username) && user) {
      loadCachedInsights();
    }
  }, [scrapeId, username, provider, user]);

  // Reload API keys when component becomes visible (user might have added keys in settings)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        loadApiKeys();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  const loadApiKeys = async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        setLoadingKeys(false);
        return;
      }
      
      const response = await getApiKeys(token);
      const keys = response.apiKeys || [];
      setApiKeys(keys);
      
      // Auto-select provider that has a key configured, preferring Claude
      if (keys.length > 0) {
        const hasAnthropic = keys.some(k => k.provider === 'anthropic');
        const hasOpenAI = keys.some(k => k.provider === 'openai');
        
        if (hasAnthropic) {
          setProvider('anthropic');
        } else if (hasOpenAI) {
          setProvider('openai');
        }
      }
    } catch (err) {
      console.error('Error loading API keys:', err);
    } finally {
      setLoadingKeys(false);
    }
  };

  const loadCachedInsights = async () => {
    try {
      // First try loading from IndexedDB by username (for persistence)
      if (username) {
        const cached = await getCachedAIInsights(`username_${username}`);
        if (cached && cached.formattedAnalysis) {
          setInsights({ formattedAnalysis: cached.formattedAnalysis });
          return;
        }
      }
      
      // Then try database lookup if we have a scrapeId
      const token = getAccessToken();
      if (!token || !scrapeId) return;
      
      // Check if scrapeId is a timestamp (IndexedDB) or UUID (database)
      const isIndexedDBScrape = typeof scrapeId === 'number' || (typeof scrapeId === 'string' && !scrapeId.includes('-'));
      
      if (isIndexedDBScrape) {
        // Try loading from IndexedDB by scrapeId
        const cached = await getCachedAIInsights(scrapeId);
        if (cached && cached.formattedAnalysis) {
          setInsights({ formattedAnalysis: cached.formattedAnalysis });
        }
        return;
      }
      
      const cached = await getAIInsights(token, scrapeId, provider);
      if (cached && cached.length > 0 && cached[0].insights) {
        setInsights(cached[0].insights);
      }
    } catch (err) {
      // Silently fail for IndexedDB scrapes or missing cache
      if (err.message && err.message.includes('Scrape not found')) {
        // Expected for IndexedDB scrapes, don't log
        return;
      }
      console.error('Error loading cached insights:', err);
    }
  };

  const handleGenerateInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getAccessToken();
      if (!token) {
        throw new Error('Please log in to use AI analysis');
      }

      if (!tweets || tweets.length === 0) {
        throw new Error('No tweets available for analysis');
      }

      // Check if scrapeId is from IndexedDB (timestamp) or database (UUID)
      const isIndexedDBScrape = scrapeId && (typeof scrapeId === 'number' || (typeof scrapeId === 'string' && !scrapeId.includes('-')));

      // If we have a scrapeId and it's a database UUID, try the recommendations endpoint
      // Otherwise, use analyze endpoint directly (for IndexedDB scrapes or no scrapeId)
      if (scrapeId && !isIndexedDBScrape) {
        try {
          const recommendations = await generateRecommendations(token, scrapeId, provider);
          setInsights(recommendations);
        } catch (dbError) {
          // If scrape not found in database, use analyze endpoint
          console.log('Scrape not in database, using analyze endpoint:', dbError.message);
          const analysis = await analyzeContent(token, tweets, provider);
          setInsights(analysis);
          
          // Save to IndexedDB for persistence (by username if available, otherwise by scrapeId)
          if (analysis && analysis.formattedAnalysis) {
            const cacheKey = username ? `username_${username}` : scrapeId;
            if (cacheKey) {
              await cacheAIInsights(cacheKey, analysis);
            }
          }
        }
      } else {
        // For IndexedDB scrapes or no scrapeId, use analyze endpoint directly
        const analysis = await analyzeContent(token, tweets, provider);
        setInsights(analysis);
        
        // Save to IndexedDB for persistence (by username if available, otherwise by scrapeId)
        if (analysis && analysis.formattedAnalysis) {
          const cacheKey = username ? `username_${username}` : scrapeId;
          if (cacheKey) {
            await cacheAIInsights(cacheKey, analysis);
          }
        }
      }
    } catch (err) {
      console.error('Error generating insights:', err);
      setError(err.message || 'Failed to generate AI insights');
    } finally {
      setLoading(false);
    }
  };

  if (!tweets || tweets.length === 0) {
    return (
      <div className="liquid-glass p-12 text-center">
        <p className="text-muted-foreground font-light">
          No data available for analysis. Start collecting tweets to see insights here.
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="liquid-glass p-12 text-center">
        <p className="text-muted-foreground mb-4 font-light">
          Please log in to use AI analysis features.
        </p>
      </div>
    );
  }

  const hasApiKey = apiKeys.some(k => k.provider === provider);

  return (
    <div className="space-y-6">
      {/* Provider Selection */}
      <div className="liquid-glass flex items-center gap-4 p-4">
        <label className="text-sm font-light text-foreground">AI Provider:</label>
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="px-3 py-2 bg-white border border-glass-border rounded-xl text-black text-sm font-light focus:outline-none focus:border-ring"
          style={{ color: '#000000', backgroundColor: '#ffffff' }}
        >
          <option value="openai" style={{ backgroundColor: '#ffffff', color: '#000000' }}>OpenAI</option>
          <option value="anthropic" style={{ backgroundColor: '#ffffff', color: '#000000' }}>Anthropic</option>
        </select>
        {loadingKeys ? (
          <span className="text-sm text-muted-foreground font-light">Loading...</span>
        ) : !hasApiKey ? (
          <span className="text-sm text-yellow-400 font-light">
            ⚠️ No API key configured for {provider === 'anthropic' ? 'Claude' : 'OpenAI'}.{' '}
            <button 
              onClick={() => navigate('/settings')} 
              className="underline hover:text-yellow-300"
            >
              Add one in Settings
            </button>
          </span>
        ) : (
          <span className="text-sm text-green-400 font-light">✓ API key configured</span>
        )}
      </div>

      {/* Generate Button */}
      <div className="flex gap-3">
        <Button
          onClick={handleGenerateInsights}
          disabled={loading || !hasApiKey}
          variant="primary"
        >
          {loading ? 'Generating Insights...' : 'Generate AI Insights'}
        </Button>
        {!scrapeId && (
          <span className="text-xs text-muted-foreground self-center font-light">
            (Analysis will use current tweets)
          </span>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="liquid-glass p-4 border-destructive/30 text-destructive text-sm font-light">
          {error}
        </div>
      )}

      {/* Insights Display */}
      {insights && (
        <div className="liquid-glass space-y-4 p-6">
          {/* Handle formatted text analysis */}
          {insights.formattedAnalysis && (
            <div className="prose prose-invert max-w-none">
              <div 
                className="text-sm text-muted-foreground font-light whitespace-pre-wrap leading-relaxed"
                style={{
                  fontFamily: 'inherit'
                }}
              >
                {insights.formattedAnalysis.split('\n').map((line, i) => {
                  // Remove all ** markdown and convert to bold
                  const processBold = (text) => {
                    const parts = text.split(/(\*\*[^*]+\*\*)/g);
                    return parts.map((part, j) => 
                      part.match(/\*\*(.+?)\*\*/) ? (
                        <strong key={j} className="text-foreground font-semibold">
                          {part.replace(/\*\*/g, '')}
                        </strong>
                      ) : (
                        <span key={j}>{part}</span>
                      )
                    );
                  };
                  
                  // Style headers
                  if (line.match(/^##\s+/)) {
                    const headerText = line.replace(/^##\s+/, '');
                    return (
                      <h2 key={i} className="text-lg font-semibold text-foreground mt-6 mb-3 first:mt-0">
                        {processBold(headerText)}
                      </h2>
                    );
                  }
                  if (line.match(/^###\s+/)) {
                    const headerText = line.replace(/^###\s+/, '');
                    return (
                      <h3 key={i} className="text-base font-semibold text-foreground mt-4 mb-2">
                        {processBold(headerText)}
                      </h3>
                    );
                  }
                  // Style bullet points
                  if (line.match(/^[-•*]\s+/)) {
                    const bulletText = line.replace(/^[-•*]\s+/, '');
                    return (
                      <div key={i} className="flex items-start gap-2 ml-4 mb-1">
                        <span className="text-green-400 mt-1">•</span>
                        <span>{processBold(bulletText)}</span>
                      </div>
                    );
                  }
                  // Style numbered lists
                  if (line.match(/^\d+\.\s+/)) {
                    const number = line.match(/^\d+/)[0];
                    const listText = line.replace(/^\d+\.\s+/, '');
                    return (
                      <div key={i} className="flex items-start gap-2 ml-4 mb-1">
                        <span className="text-blue-400 mt-1 font-medium">{number}.</span>
                        <span>{processBold(listText)}</span>
                      </div>
                    );
                  }
                  // Regular paragraphs with bold processing
                  if (line.trim()) {
                    return (
                      <p key={i} className="mb-2">
                        {processBold(line)}
                      </p>
                    );
                  }
                  // Empty lines for spacing
                  return <br key={i} />;
                })}
              </div>
            </div>
          )}

          {/* Fallback for old JSON format */}
          {!insights.formattedAnalysis && insights.recommendations && Array.isArray(insights.recommendations) && insights.recommendations.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-light text-foreground mb-3">Recommendations</h4>
              <ul className="space-y-2 text-sm text-muted-foreground font-light">
                {insights.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="glass-accent mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!insights.formattedAnalysis && insights.strategySuggestions && Array.isArray(insights.strategySuggestions) && insights.strategySuggestions.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-light text-foreground mb-3">Strategy Suggestions</h4>
              <ul className="space-y-2 text-sm text-muted-foreground font-light">
                {insights.strategySuggestions.map((suggestion, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!insights.formattedAnalysis && insights.contentAnalysis && (
            <div className="mb-6">
              <h4 className="text-sm font-light text-foreground mb-3">Content Analysis</h4>
              <div className="text-sm text-muted-foreground space-y-2 font-light">
                {insights.contentAnalysis.dominantThemes && Array.isArray(insights.contentAnalysis.dominantThemes) && (
                  <div>
                    <span className="font-medium text-white">Dominant Themes: </span>
                    <span>{insights.contentAnalysis.dominantThemes.join(', ')}</span>
                  </div>
                )}
                {insights.contentAnalysis.sentiment && (
                  <div>
                    <span className="font-medium text-white">Sentiment: </span>
                    <span className={`capitalize ${
                      insights.contentAnalysis.sentiment === 'positive' ? 'text-green-400' :
                      insights.contentAnalysis.sentiment === 'negative' ? 'text-red-400' :
                      'text-yellow-400'
                    }`}>
                      {insights.contentAnalysis.sentiment}
                    </span>
                  </div>
                )}
                {insights.contentAnalysis.contentCategories && Array.isArray(insights.contentAnalysis.contentCategories) && (
                  <div>
                    <span className="font-medium text-white">Categories: </span>
                    <span>{insights.contentAnalysis.contentCategories.join(', ')}</span>
                  </div>
                )}
                {insights.contentAnalysis.keyTopics && Array.isArray(insights.contentAnalysis.keyTopics) && (
                  <div>
                    <span className="font-medium text-white">Key Topics: </span>
                    <span>{insights.contentAnalysis.keyTopics.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Final fallback for any other structure */}
          {!insights.formattedAnalysis && !insights.recommendations && !insights.strategySuggestions && !insights.contentAnalysis && (
            <div className="text-sm text-muted-foreground font-light">
              <pre className="whitespace-pre-wrap">{JSON.stringify(insights, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      {/* Placeholder if no insights */}
      {!insights && !loading && (
        <div className="liquid-glass p-12 text-center">
          <p className="text-muted-foreground mb-4 font-light">
            Click "Generate AI Insights" to analyze your {tweets.length} tweet{tweets.length !== 1 ? 's' : ''} with AI.
          </p>
          {hasApiKey && (
            <p className="text-xs text-muted-foreground/70 font-light">
              This will analyze content themes, sentiment, and provide strategic recommendations.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
