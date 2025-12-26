import { useEffect, useRef, useState } from 'react';
import '../styles/electric.css';
import { extractHook } from '../utils/hooksExtractor';

export default function TweetList({ tweets }) {
  const listRef = useRef(null);
  const [viewMode, setViewMode] = useState('full'); // 'full' or 'compact' (hook + engagement)

  useEffect(() => {
    // Auto-scroll to bottom when new tweets arrive
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [tweets]);

  if (tweets.length === 0) {
    return (
      <div className="bg-electric-muted border border-electric-border rounded-xl p-12 text-center">
        <p className="electric-body text-electric-text-muted">
          No tweets scraped yet. Enter a username and start scraping to see tweets here.
        </p>
      </div>
    );
  }

  const handleCopyTweet = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-electric-muted border border-electric-border rounded-xl overflow-hidden relative">
      <div className="p-4 border-b border-electric-border flex items-center justify-between">
        <h3 className="electric-heading text-xl text-electric-text">
          Scraped Tweets <span className="electric-accent">({tweets.length})</span>
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'full' ? 'compact' : 'full')}
            className="inline-flex items-center justify-center rounded-lg font-light transition-all duration-200 h-9 px-4 text-sm bg-electric-dark border border-electric-border text-electric-text hover:bg-electric-border"
          >
            {viewMode === 'full' ? '📋 Hook View' : '📄 Full View'}
          </button>
        </div>
      </div>
      
      <div
        ref={listRef}
        className="max-h-[600px] overflow-y-auto p-4 space-y-4"
        style={{ scrollBehavior: 'smooth' }}
      >
        {tweets.map((tweet, index) => {
          const hook = extractHook(tweet.content, 15);
          const totalEngagement = tweet.likes + tweet.retweets + tweet.comments;
          const showFull = viewMode === 'full';
          
          return (
            <div
              key={index}
              data-tweet-index={index}
              className="bg-electric-dark border border-electric-border rounded-lg p-4 hover:border-electric-lime/50 transition-all duration-300 relative overflow-hidden group"
            >
              <div className="relative z-10">
                {showFull ? (
                  <>
                    <p className="electric-body text-electric-text mb-3 whitespace-pre-wrap break-words">
                      {tweet.content}
                    </p>
                    <div className="flex items-center gap-2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleCopyTweet(tweet.content)}
                        className="inline-flex items-center justify-center rounded-lg font-light transition-all duration-200 h-7 px-3 text-xs bg-electric-muted border border-electric-border text-electric-text hover:bg-electric-border"
                      >
                        📋 Copy Tweet
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="electric-body text-electric-text mb-3 whitespace-pre-wrap break-words font-medium">
                      {hook}
                    </p>
                    <div className="flex items-center gap-2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleCopyTweet(tweet.content)}
                        className="inline-flex items-center justify-center rounded-lg font-light transition-all duration-200 h-7 px-3 text-xs bg-electric-muted border border-electric-border text-electric-text hover:bg-electric-border"
                      >
                        📋 Copy Full Tweet
                      </button>
                      <button
                        onClick={() => {
                          setViewMode('full');
                          // Scroll to this tweet
                          setTimeout(() => {
                            const element = document.querySelector(`[data-tweet-index="${index}"]`);
                            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }, 100);
                        }}
                        className="inline-flex items-center justify-center rounded-lg font-light transition-all duration-200 h-7 px-3 text-xs bg-electric-lime text-black hover:bg-electric-lime/90"
                      >
                        👁️ View Full
                      </button>
                    </div>
                  </>
                )}
                
                <div className="flex flex-wrap gap-4 text-sm text-electric-text-muted">
                  <div>
                    <span className="electric-accent">❤️</span> {tweet.likes.toLocaleString()} likes
                  </div>
                  <div>
                    <span className="electric-accent">🔄</span> {tweet.retweets.toLocaleString()} retweets
                  </div>
                  <div>
                    <span className="electric-accent">💬</span> {tweet.comments.toLocaleString()} comments
                  </div>
                  {!showFull && (
                    <div className="ml-auto font-medium text-electric-lime">
                      {totalEngagement.toLocaleString()} total engagement
                    </div>
                  )}
                  <div className={showFull ? "ml-auto" : ""}>
                    <span className="text-xs">{new Date(tweet.date).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-electric-lime/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

