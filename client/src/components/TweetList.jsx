import { useEffect, useRef, useState } from 'react';
import { extractHook } from '../utils/hooksExtractor';
import Button from './ui/Button';
import { CopyIcon } from './ui/Icons';

export default function TweetList({ tweets }) {
  const listRef = useRef(null);
  const [viewMode, setViewMode] = useState('full');

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [tweets]);

  if (tweets.length === 0) {
    return (
      <div className="liquid-glass p-12 text-center">
        <p className="text-muted-foreground text-xs font-light">
          No tweets collected yet. Enter a username and start analysis to see tweets here.
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
    <div className="overflow-hidden liquid-glass">
      <div className="p-3 flex items-center justify-between border-b border-glass-border">
        <h3 className="text-xs font-light text-foreground tracking-tight">
          Collected Tweets <span className="glass-accent">({tweets.length})</span>
        </h3>
        <Button
          variant="ghost"
          onClick={() => setViewMode(viewMode === 'full' ? 'compact' : 'full')}
          className="text-xs h-7 px-3"
        >
          {viewMode === 'full' ? 'Hook View' : 'Full View'}
        </Button>
      </div>
      
      <div
        ref={listRef}
        className="max-h-[600px] overflow-y-auto p-4 space-y-3"
        style={{ scrollBehavior: 'smooth' }}
      >
        {tweets.map((tweet, index) => {
          const hook = extractHook(tweet.content, 15);
          const totalEngagement = (tweet.likes || 0) + (tweet.retweets || 0) + (tweet.comments || 0);
          const showFull = viewMode === 'full';
          
          return (
            <div
              key={index}
              data-tweet-index={index}
              className="p-4 hover:bg-glass-background transition-none rounded-xl group border border-transparent hover:border-glass-border"
            >
              {showFull ? (
                <>
                  <p className="text-foreground mb-3 whitespace-pre-wrap break-words text-xs leading-relaxed font-light">
                    {tweet.content}
                  </p>
                  <div className="flex items-center gap-2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      onClick={() => handleCopyTweet(tweet.content)}
                      className="text-xs h-7 px-2 flex items-center gap-1.5"
                    >
                      <CopyIcon className="w-3.5 h-3.5" />
                      Copy
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-foreground mb-3 whitespace-pre-wrap break-words font-light text-xs leading-relaxed">
                    {hook}
                  </p>
                  <div className="flex items-center gap-2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      onClick={() => handleCopyTweet(tweet.content)}
                      className="text-xs h-7 px-2 flex items-center gap-1.5"
                    >
                      <CopyIcon className="w-3.5 h-3.5" />
                      Copy Full
                    </Button>
                  </div>
                </>
              )}
              
              <div className="flex flex-wrap gap-4 text-[11px] text-muted-foreground font-light">
                <span>Likes: {(tweet.likes || 0).toLocaleString()}</span>
                <span>Retweets: {(tweet.retweets || 0).toLocaleString()}</span>
                <span>Comments: {(tweet.comments || 0).toLocaleString()}</span>
                {!showFull && (
                  <span className="ml-auto font-light glass-accent">
                    {totalEngagement.toLocaleString()} total
                  </span>
                )}
                <span className={showFull ? "ml-auto" : ""}>
                  {new Date(tweet.date).toLocaleDateString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
