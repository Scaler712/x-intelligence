import { useMemo } from 'react';
import { compareScrapes } from '../../utils/comparison';

export default function ComparisonView({ scrapes, selectedScrapes, toggleScrape, isSelected, clearSelection }) {
  const comparisonData = useMemo(() => {
    if (!selectedScrapes || selectedScrapes.length === 0) return null;
    
    // Filter out scrapes without tweets for comparison
    const scrapesWithTweets = selectedScrapes.filter(s => s.tweets && s.tweets.length > 0);
    if (scrapesWithTweets.length === 0) {
      // Return a special flag to indicate tweets are loading
      return { loading: true };
    }
    
    try {
      return compareScrapes(scrapesWithTweets);
    } catch (error) {
      console.error('Error comparing scrapes:', error);
      return null;
    }
  }, [selectedScrapes]);

  if (!scrapes || scrapes.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-[#a0a0a0]">
          Select at least one scrape to compare.
        </p>
      </div>
    );
  }

  if (!selectedScrapes || selectedScrapes.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-[#a0a0a0] mb-4">
          Select scrapes from the list below to compare them.
        </p>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {scrapes.map((scrape) => (
            <div
              key={scrape.id}
              onClick={() => toggleScrape && toggleScrape(scrape)}
              className={`
                p-4 cursor-pointer transition-colors rounded
                ${isSelected && isSelected(scrape.id) 
                  ? 'bg-[#252525]' 
                  : 'hover:bg-[#1a1a1a]'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">@{scrape.username}</h3>
                  <p className="text-sm text-[#a0a0a0] mt-1">
                    {scrape.stats?.total || 0} tweets
                  </p>
                </div>
                {isSelected && isSelected(scrape.id) && (
                  <span className="text-[#2563eb]">✓</span>
                )}
              </div>
            </div>
          ))}
        </div>
        {selectedScrapes && selectedScrapes.length > 0 && clearSelection && (
          <button
            onClick={clearSelection}
            className="mt-4 text-[#2563eb] hover:text-[#1d4ed8] text-sm"
          >
            Clear Selection
          </button>
        )}
      </div>
    );
  }

  if (!comparisonData || comparisonData.loading) {
    return (
      <div className="py-12 text-center">
        <p className="text-[#a0a0a0] mb-2">
          {selectedScrapes && selectedScrapes.length > 0 
            ? 'Loading tweets for selected scrapes...'
            : 'Select at least one scrape to compare.'
          }
        </p>
      </div>
    );
  }

  if (!comparisonData.metrics || comparisonData.metrics.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-[#a0a0a0] mb-2">
          Selected scrapes don't have tweets loaded. Please wait or try selecting different scrapes.
        </p>
      </div>
    );
  }

  const { metrics, bestPerformer } = comparisonData;
  
  if (!bestPerformer) {
    return (
      <div className="py-12 text-center">
        <p className="text-[#a0a0a0]">
          Unable to compare scrapes. Make sure they have tweets.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-xl text-white mb-2">
          Side-by-Side Comparison
        </h3>
        <p className="text-sm text-[#a0a0a0]">
          Comparing {selectedScrapes.length} profile{selectedScrapes.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2a2a2a]">
              <th className="text-left py-4 px-4 text-[#a0a0a0] font-medium">
                Metric
              </th>
              {metrics.map(metric => (
                <th
                  key={metric.id}
                  className="text-right py-4 px-4 text-white"
                >
                  <div className="flex flex-col items-end">
                    <span className="font-medium">{metric.username}</span>
                    {bestPerformer.id === metric.id && (
                      <span className="text-xs text-[#2563eb] mt-1">Best Performer</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[#2a2a2a]">
              <td className="py-4 px-4 text-[#a0a0a0]">Total Tweets</td>
              {metrics.map(metric => (
                <td
                  key={metric.id}
                  className="py-4 px-4 text-right text-white font-medium"
                >
                  {(metric.tweetCount || 0).toLocaleString()}
                </td>
              ))}
            </tr>

            <tr className="border-b border-[#2a2a2a]">
              <td className="py-4 px-4 text-[#a0a0a0]">Avg Likes</td>
              {metrics.map(metric => (
                <td
                  key={metric.id}
                  className={`py-4 px-4 text-right font-medium ${
                    metric.id === bestPerformer.id ? 'text-[#2563eb]' : 'text-white'
                  }`}
                >
                  {(metric.avgLikes || 0).toLocaleString()}
                </td>
              ))}
            </tr>

            <tr className="border-b border-[#2a2a2a]">
              <td className="py-4 px-4 text-[#a0a0a0]">Avg Retweets</td>
              {metrics.map(metric => (
                <td
                  key={metric.id}
                  className={`py-4 px-4 text-right font-medium ${
                    metric.id === bestPerformer.id ? 'text-[#2563eb]' : 'text-white'
                  }`}
                >
                  {(metric.avgRetweets || 0).toLocaleString()}
                </td>
              ))}
            </tr>

            <tr className="border-b border-[#2a2a2a]">
              <td className="py-4 px-4 text-[#a0a0a0]">Avg Comments</td>
              {metrics.map(metric => (
                <td
                  key={metric.id}
                  className={`py-4 px-4 text-right font-medium ${
                    metric.id === bestPerformer.id ? 'text-[#2563eb]' : 'text-white'
                  }`}
                >
                  {(metric.avgComments || 0).toLocaleString()}
                </td>
              ))}
            </tr>

            <tr className="border-b border-[#2a2a2a] bg-[#1a1a1a]">
              <td className="py-4 px-4 text-white font-medium">Avg Total Engagement</td>
              {metrics.map(metric => (
                <td
                  key={metric.id}
                  className={`py-4 px-4 text-right font-bold ${
                    metric.id === bestPerformer.id ? 'text-[#2563eb]' : 'text-white'
                  }`}
                >
                  {(metric.avgEngagement || 0).toLocaleString()}
                </td>
              ))}
            </tr>

            <tr className="border-b border-[#2a2a2a]">
              <td className="py-4 px-4 text-[#a0a0a0]">Best Tweet</td>
              {metrics.map(metric => (
                <td
                  key={metric.id}
                  className="py-4 px-4 text-right text-white text-sm"
                >
                  {metric.bestTweet ? (
                    <div className="text-left">
                      <div className="line-clamp-2 mb-1">
                        {(metric.bestTweet.content || '').substring(0, 80)}...
                      </div>
                      <div className="text-xs text-[#a0a0a0]">
                        {((metric.bestTweet.likes || 0) + (metric.bestTweet.retweets || 0) + (metric.bestTweet.comments || 0)).toLocaleString()} engagement
                      </div>
                    </div>
                  ) : (
                    'N/A'
                  )}
                </td>
              ))}
            </tr>

            <tr>
              <td className="py-4 px-4 text-[#a0a0a0]">Best Time to Post</td>
              {metrics.map(metric => (
                <td
                  key={metric.id}
                  className="py-4 px-4 text-right text-white"
                >
                  {metric.bestTime ? (
                    <div>
                      <div>{metric.bestTime.day} {metric.bestTime.hour}:00</div>
                      <div className="text-xs text-[#a0a0a0]">
                        {Math.round(metric.bestTime.avgEngagement || 0).toLocaleString()} avg
                      </div>
                    </div>
                  ) : (
                    'N/A'
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
