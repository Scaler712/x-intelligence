import { useMemo } from 'react';
import '../../styles/electric.css';
import { analyzeSentiment } from '../../utils/sentimentAnalysis';

export default function SentimentAnalysis({ tweets }) {
  const sentimentData = useMemo(() => analyzeSentiment(tweets), [tweets]);

  if (tweets.length === 0) {
    return null;
  }

  const { distribution, mostPositive, mostNegative } = sentimentData;
  const total = distribution.positive.count + distribution.neutral.count + distribution.negative.count;

  const sentiments = [
    {
      key: 'positive',
      label: 'Positive',
      icon: '😊',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500',
      data: distribution.positive
    },
    {
      key: 'neutral',
      label: 'Neutral',
      icon: '😐',
      color: 'text-electric-text-muted',
      bgColor: 'bg-electric-muted',
      borderColor: 'border-electric-border',
      data: distribution.neutral
    },
    {
      key: 'negative',
      label: 'Negative',
      icon: '😞',
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500',
      data: distribution.negative
    }
  ];

  const bestPerformer = sentiments.reduce((best, current) =>
    current.data.avgEngagement > best.data.avgEngagement ? current : best
  );

  return (
    <div className="space-y-6">
      {/* Recommendation */}
      <div className="bg-electric-lime/10 border border-electric-lime rounded-xl p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <div className="electric-body text-electric-text font-medium">
              Sentiment Recommendation
            </div>
            <div className="text-sm text-electric-lime">
              {bestPerformer.label} sentiment performs best ({bestPerformer.data.avgEngagement.toLocaleString()} avg engagement)
            </div>
          </div>
        </div>
      </div>

      {/* Sentiment Distribution */}
      <div className="bg-electric-dark border border-electric-border rounded-xl p-6">
        <h3 className="electric-heading text-xl text-electric-text mb-4">
          Sentiment Distribution
        </h3>
        <div className="space-y-4">
          {sentiments.map(({ key, label, icon, color, bgColor, borderColor, data }) => {
            const percentage = total > 0 ? (data.count / total) * 100 : 0;

            return (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{icon}</span>
                    <span className="electric-body text-electric-text">{label}</span>
                    <span className="text-sm text-electric-text-muted">
                      ({data.count} tweets, {data.percentage}%)
                    </span>
                  </div>
                  <div className={`font-medium ${color}`}>
                    {data.avgEngagement.toLocaleString()} avg
                  </div>
                </div>
                <div className="relative w-full h-2 bg-electric-border rounded-full overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 ${bgColor} transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Most Positive Tweets */}
      {mostPositive.length > 0 && (
        <div className="bg-electric-dark border border-electric-border rounded-xl p-6">
          <h3 className="electric-heading text-xl text-electric-text mb-4">
            Most Positive Tweets
          </h3>
          <div className="space-y-3">
            {mostPositive.map((tweet, index) => (
              <div
                key={index}
                className="bg-green-500/10 border border-green-500/30 rounded-lg p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="text-green-400 font-bold">#{index + 1}</span>
                  <div className="flex-1">
                    <p className="electric-body text-electric-text mb-2 line-clamp-2">
                      {tweet.content}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-electric-text-muted">
                      <span>Score: +{tweet.sentimentScore}</span>
                      <span>❤️ {tweet.likes}</span>
                      <span>🔄 {tweet.retweets}</span>
                      <span>💬 {tweet.comments}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Most Negative Tweets */}
      {mostNegative.length > 0 && (
        <div className="bg-electric-dark border border-electric-border rounded-xl p-6">
          <h3 className="electric-heading text-xl text-electric-text mb-4">
            Most Negative Tweets
          </h3>
          <div className="space-y-3">
            {mostNegative.map((tweet, index) => (
              <div
                key={index}
                className="bg-red-500/10 border border-red-500/30 rounded-lg p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="text-red-400 font-bold">#{index + 1}</span>
                  <div className="flex-1">
                    <p className="electric-body text-electric-text mb-2 line-clamp-2">
                      {tweet.content}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-electric-text-muted">
                      <span>Score: {tweet.sentimentScore}</span>
                      <span>❤️ {tweet.likes}</span>
                      <span>🔄 {tweet.retweets}</span>
                      <span>💬 {tweet.comments}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
