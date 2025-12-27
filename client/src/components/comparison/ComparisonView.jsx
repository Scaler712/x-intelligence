import { useMemo } from 'react';
import '../../styles/electric.css';
import { compareScrapes } from '../../utils/comparison';

export default function ComparisonView({ scrapes }) {
  const comparisonData = useMemo(() => compareScrapes(scrapes), [scrapes]);

  if (!scrapes || scrapes.length === 0) {
    return (
      <div className="bg-electric-dark border border-electric-border rounded-xl p-6">
        <p className="electric-body text-electric-text-muted text-center">
          Select at least one scrape to compare.
        </p>
      </div>
    );
  }

  const { metrics, bestPerformer } = comparisonData;

  return (
    <div className="bg-electric-dark border border-electric-border rounded-xl p-6">
      <div className="mb-4">
        <h3 className="electric-heading text-xl text-electric-text mb-2">
          Side-by-Side Comparison
        </h3>
        <p className="electric-body text-sm text-electric-text-muted">
          Comparing {scrapes.length} profile{scrapes.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-electric-border">
              <th className="text-left py-3 px-4 electric-body text-electric-text-muted">
                Metric
              </th>
              {metrics.map(metric => (
                <th
                  key={metric.id}
                  className="text-right py-3 px-4 electric-body text-electric-text"
                >
                  <div className="flex flex-col items-end">
                    <span className="font-medium">{metric.username}</span>
                    {bestPerformer.id === metric.id && (
                      <span className="text-xs text-electric-lime">Best Performer</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-electric-border">
              <td className="py-3 px-4 text-electric-text-muted">Total Tweets</td>
              {metrics.map(metric => (
                <td
                  key={metric.id}
                  className="py-3 px-4 text-right electric-accent font-medium"
                >
                  {metric.tweetCount.toLocaleString()}
                </td>
              ))}
            </tr>

            <tr className="border-b border-electric-border">
              <td className="py-3 px-4 text-electric-text-muted">Avg Likes</td>
              {metrics.map(metric => (
                <td
                  key={metric.id}
                  className={`py-3 px-4 text-right font-medium ${
                    metric.id === bestPerformer.id ? 'text-electric-lime' : 'text-electric-text'
                  }`}
                >
                  {metric.avgLikes.toLocaleString()}
                </td>
              ))}
            </tr>

            <tr className="border-b border-electric-border">
              <td className="py-3 px-4 text-electric-text-muted">Avg Retweets</td>
              {metrics.map(metric => (
                <td
                  key={metric.id}
                  className={`py-3 px-4 text-right font-medium ${
                    metric.id === bestPerformer.id ? 'text-electric-lime' : 'text-electric-text'
                  }`}
                >
                  {metric.avgRetweets.toLocaleString()}
                </td>
              ))}
            </tr>

            <tr className="border-b border-electric-border">
              <td className="py-3 px-4 text-electric-text-muted">Avg Comments</td>
              {metrics.map(metric => (
                <td
                  key={metric.id}
                  className={`py-3 px-4 text-right font-medium ${
                    metric.id === bestPerformer.id ? 'text-electric-lime' : 'text-electric-text'
                  }`}
                >
                  {metric.avgComments.toLocaleString()}
                </td>
              ))}
            </tr>

            <tr className="border-b border-electric-border bg-electric-muted">
              <td className="py-3 px-4 text-electric-text font-medium">Avg Total Engagement</td>
              {metrics.map(metric => (
                <td
                  key={metric.id}
                  className={`py-3 px-4 text-right font-bold ${
                    metric.id === bestPerformer.id ? 'text-electric-lime' : 'text-electric-text'
                  }`}
                >
                  {metric.avgEngagement.toLocaleString()}
                </td>
              ))}
            </tr>

            <tr className="border-b border-electric-border">
              <td className="py-3 px-4 text-electric-text-muted">Best Tweet</td>
              {metrics.map(metric => (
                <td
                  key={metric.id}
                  className="py-3 px-4 text-right text-electric-text text-sm"
                >
                  {metric.bestTweet ? (
                    <div className="text-left">
                      <div className="line-clamp-2 mb-1">
                        {metric.bestTweet.content.substring(0, 80)}...
                      </div>
                      <div className="text-xs text-electric-text-muted">
                        {(metric.bestTweet.likes + metric.bestTweet.retweets + metric.bestTweet.comments).toLocaleString()} engagement
                      </div>
                    </div>
                  ) : (
                    'N/A'
                  )}
                </td>
              ))}
            </tr>

            <tr>
              <td className="py-3 px-4 text-electric-text-muted">Best Time to Post</td>
              {metrics.map(metric => (
                <td
                  key={metric.id}
                  className="py-3 px-4 text-right text-electric-text"
                >
                  {metric.bestTime ? (
                    <div>
                      <div>{metric.bestTime.day} {metric.bestTime.hour}:00</div>
                      <div className="text-xs text-electric-text-muted">
                        {Math.round(metric.bestTime.avgEngagement).toLocaleString()} avg
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
