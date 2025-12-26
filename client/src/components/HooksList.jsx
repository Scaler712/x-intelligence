import { useState } from 'react';
import '../styles/electric.css';
import { extractHooks } from '../utils/hooksExtractor';

export default function HooksList({ tweets, onHookClick }) {
  const [wordCount, setWordCount] = useState(15);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [showFull, setShowFull] = useState({}); // Track which hooks show full tweet

  const hooks = extractHooks(tweets, wordCount);

  const handleCopy = async (hook, index) => {
    try {
      await navigator.clipboard.writeText(hook);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyAll = async () => {
    const allHooks = hooks.map(h => h.hook).join('\n');
    try {
      await navigator.clipboard.writeText(allHooks);
      alert(`Copied ${hooks.length} hooks to clipboard!`);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyFullTweet = async (fullContent, index) => {
    try {
      await navigator.clipboard.writeText(fullContent);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleExportHook = (hookData, index) => {
    try {
      // Create filename based on hook (sanitize for filename)
      const sanitizedHook = hookData.hook
        .replace(/[^a-z0-9\s]/gi, '') // Remove special chars
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .substring(0, 50) // Limit length
        .trim();
      const filename = `${sanitizedHook || `hook_${index + 1}`}.txt`;
      
      // Create file content with hook and full tweet
      const content = `Hook: ${hookData.hook}\n\nFull Tweet:\n${hookData.fullContent}\n\nEngagement:\n- Likes: ${hookData.likes.toLocaleString()}\n- Retweets: ${hookData.retweets.toLocaleString()}\n- Comments: ${hookData.comments.toLocaleString()}\n- Total: ${hookData.totalEngagement.toLocaleString()}\n\nDate: ${new Date(hookData.date).toLocaleString()}`;
      
      // Create blob and download
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export:', err);
      alert('Failed to export hook. Please try again.');
    }
  };

  const toggleFullView = (index) => {
    setShowFull(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  if (tweets.length === 0) {
    return (
      <div className="bg-electric-muted border border-electric-border rounded-xl p-12 text-center">
        <p className="electric-body text-electric-text-muted">
          No hooks available yet. Start scraping to extract hooks from tweets.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-electric-muted border border-electric-border rounded-xl overflow-hidden relative">
      <div className="p-4 border-b border-electric-border flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="electric-heading text-xl text-electric-text mb-2">
            Content Hooks <span className="electric-accent">({hooks.length})</span>
          </h3>
          <p className="electric-body text-electric-text-muted text-sm">
            First lines sorted by engagement
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-electric-text-muted">Words:</label>
            <input
              type="number"
              min="5"
              max="30"
              value={wordCount}
              onChange={(e) => setWordCount(Math.max(5, Math.min(30, parseInt(e.target.value) || 15)))}
              className="w-20 bg-electric-dark border border-electric-border rounded-lg px-3 py-1.5 text-electric-text focus:outline-none focus:border-electric-lime transition-colors text-sm"
            />
          </div>
          
          {hooks.length > 0 && (
            <button
              onClick={handleCopyAll}
              className="inline-flex items-center justify-center rounded-lg font-light transition-all duration-200 bg-electric-dark border border-electric-border text-electric-text hover:bg-electric-border h-9 px-4 text-sm"
            >
              Copy All Hooks
            </button>
          )}
        </div>
      </div>
      
      <div className="max-h-[600px] overflow-y-auto p-4 space-y-3">
        {hooks.map((hookData, index) => (
          <div
            key={hookData.id}
            className="bg-electric-dark border border-electric-border rounded-lg p-4 hover:border-electric-lime/50 transition-all duration-300 relative overflow-hidden group cursor-pointer"
            onClick={() => onHookClick && onHookClick(hookData.originalIndex)}
          >
            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  {showFull[index] ? (
                    <p className="electric-body text-electric-text whitespace-pre-wrap break-words">
                      {hookData.fullContent}
                    </p>
                  ) : (
                    <p className="electric-body text-electric-text font-medium">
                      {hookData.hook}
                    </p>
                  )}
                </div>
                
                <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFullView(index);
                    }}
                    className="inline-flex items-center justify-center rounded-lg font-light transition-all duration-200 bg-electric-muted border border-electric-border text-electric-text hover:bg-electric-border h-8 px-3 text-xs"
                    title={showFull[index] ? "Show hook only" : "Show full tweet"}
                  >
                    {showFull[index] ? '📋 Hook' : '📄 Full'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(hookData.hook, index);
                    }}
                    className="inline-flex items-center justify-center rounded-lg font-light transition-all duration-200 bg-electric-muted border border-electric-border text-electric-text hover:bg-electric-border h-8 px-3 text-xs"
                    title="Copy hook"
                  >
                    {copiedIndex === index ? '✓' : '📋'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyFullTweet(hookData.fullContent, `full_${index}`);
                    }}
                    className="inline-flex items-center justify-center rounded-lg font-light transition-all duration-200 bg-electric-muted border border-electric-border text-electric-text hover:bg-electric-border h-8 px-3 text-xs"
                    title="Copy full tweet"
                  >
                    📄
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExportHook(hookData, index);
                    }}
                    className="inline-flex items-center justify-center rounded-lg font-light transition-all duration-200 bg-electric-lime text-black hover:bg-electric-lime/90 h-8 px-3 text-xs"
                    title="Export to TXT"
                  >
                    💾
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-electric-text-muted">
                <div>
                  <span className="electric-accent">❤️</span> {hookData.likes.toLocaleString()} likes
                </div>
                <div>
                  <span className="electric-accent">🔄</span> {hookData.retweets.toLocaleString()} retweets
                </div>
                <div>
                  <span className="electric-accent">💬</span> {hookData.comments.toLocaleString()} comments
                </div>
                <div className="ml-auto font-medium text-electric-lime">
                  {hookData.totalEngagement.toLocaleString()} total engagement
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-electric-lime/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

