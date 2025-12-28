import { useState } from 'react';
import { extractHooks } from '../utils/hooksExtractor';
import Input from './ui/Input';
import Button from './ui/Button';

export default function HooksList({ tweets, onHookClick }) {
  const [wordCount, setWordCount] = useState(15);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [showFull, setShowFull] = useState({});

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
      const sanitizedHook = hookData.hook
        .replace(/[^a-z0-9\s]/gi, '')
        .replace(/\s+/g, '_')
        .substring(0, 50)
        .trim();
      const filename = `${sanitizedHook || `hook_${index + 1}`}.txt`;
      
      const content = `Hook: ${hookData.hook}\n\nFull Tweet:\n${hookData.fullContent}\n\nEngagement:\n- Likes: ${hookData.likes.toLocaleString()}\n- Retweets: ${hookData.retweets.toLocaleString()}\n- Comments: ${hookData.comments.toLocaleString()}\n- Total: ${hookData.totalEngagement.toLocaleString()}\n\nDate: ${new Date(hookData.date).toLocaleString()}`;
      
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
      <div className="p-12 text-center border border-[#2a2a2a] rounded-md bg-[#252525]">
        <p className="text-[#a0a0a0]">
          No hooks available yet. Start scraping to extract hooks from tweets.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="p-4 border-b border-[#2a2a2a] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-white mb-1">
            Content Hooks <span className="text-[#2563eb]">({hooks.length})</span>
          </h3>
          <p className="text-xs text-[#a0a0a0]">
            First lines sorted by engagement
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs text-[#a0a0a0]">Words:</label>
            <Input
              type="number"
              min="5"
              max="30"
              value={wordCount}
              onChange={(e) => setWordCount(Math.max(5, Math.min(30, parseInt(e.target.value) || 15)))}
              className="w-20 text-sm h-8"
            />
          </div>
          
          {hooks.length > 0 && (
            <Button
              variant="secondary"
              onClick={handleCopyAll}
              className="text-xs h-8 px-3"
            >
              Copy All Hooks
            </Button>
          )}
        </div>
      </div>
      
      <div className="max-h-[600px] overflow-y-auto p-4 space-y-3">
        {hooks.map((hookData, index) => (
          <div
            key={hookData.id}
            className="p-4 hover:bg-[#1a1a1a] transition-colors rounded cursor-pointer group"
            onClick={() => onHookClick && onHookClick(hookData.originalIndex)}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1">
                {showFull[index] ? (
                  <p className="text-white whitespace-pre-wrap break-words">
                    {hookData.fullContent}
                  </p>
                ) : (
                  <p className="text-white font-medium">
                    {hookData.hook}
                  </p>
                )}
              </div>
              
              <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFullView(index);
                  }}
                  className="text-xs h-7 px-2"
                  title={showFull[index] ? "Show hook only" : "Show full tweet"}
                >
                  {showFull[index] ? '📋 Hook' : '📄 Full'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(hookData.hook, index);
                  }}
                  className="text-xs h-7 px-2"
                  title="Copy hook"
                >
                  {copiedIndex === index ? '✓' : '📋'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyFullTweet(hookData.fullContent, `full_${index}`);
                  }}
                  className="text-xs h-7 px-2"
                  title="Copy full tweet"
                >
                  📄
                </Button>
                <Button
                  variant="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExportHook(hookData, index);
                  }}
                  className="text-xs h-7 px-2"
                  title="Export to TXT"
                >
                  💾
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-[#a0a0a0]">
              <div>
                <span className="text-[#2563eb]">❤️</span> {hookData.likes.toLocaleString()} likes
              </div>
              <div>
                <span className="text-[#2563eb]">🔄</span> {hookData.retweets.toLocaleString()} retweets
              </div>
              <div>
                <span className="text-[#2563eb]">💬</span> {hookData.comments.toLocaleString()} comments
              </div>
              <div className="ml-auto font-medium text-[#2563eb]">
                {hookData.totalEngagement.toLocaleString()} total engagement
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
