import { useMemo } from 'react';
import { analyzeEmojis } from '../../utils/emojiAnalysis';

export default function EmojiAnalysis({ tweets }) {
  const emojiData = useMemo(() => analyzeEmojis(tweets), [tweets]);

  if (tweets.length === 0) {
    return null;
  }

  const { topEmojis, uniqueEmojis, withEmojis, withoutEmojis, performance, recommendation } = emojiData;

  const maxEngagement = Math.max(withEmojis.avgEngagement, withoutEmojis.avgEngagement);

  return (
    <div className="space-y-6">
      {/* Recommendation */}
      <div className="bg-electric-lime/10 border border-electric-lime rounded-xl p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <div className="electric-body text-electric-text font-medium">
              Emoji Recommendation
            </div>
            <div className="text-sm text-electric-lime">
              {recommendation}
            </div>
          </div>
        </div>
      </div>

      {/* Emoji vs No Emoji Performance */}
      <div className="bg-electric-dark border border-electric-border rounded-xl p-6">
        <h3 className="electric-heading text-xl text-electric-text mb-4">
          Emoji Impact on Engagement
        </h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">😀</span>
                <span className="electric-body text-electric-text">With Emojis</span>
                <span className="text-sm text-electric-text-muted">
                  ({withEmojis.count} tweets)
                </span>
              </div>
              <div className="font-medium text-electric-lime">
                {withEmojis.avgEngagement.toLocaleString()} avg
              </div>
            </div>
            <div className="relative w-full h-2 bg-electric-border rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-electric-lime transition-all duration-300"
                style={{ width: `${maxEngagement > 0 ? (withEmojis.avgEngagement / maxEngagement) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">📝</span>
                <span className="electric-body text-electric-text">Without Emojis</span>
                <span className="text-sm text-electric-text-muted">
                  ({withoutEmojis.count} tweets)
                </span>
              </div>
              <div className="font-medium text-electric-text-muted">
                {withoutEmojis.avgEngagement.toLocaleString()} avg
              </div>
            </div>
            <div className="relative w-full h-2 bg-electric-border rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-electric-muted transition-all duration-300"
                style={{ width: `${maxEngagement > 0 ? (withoutEmojis.avgEngagement / maxEngagement) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Performance Multiplier */}
        <div className="mt-6 bg-electric-muted rounded-lg p-4 border border-electric-border">
          <div className="text-sm text-electric-text-muted mb-1">Performance Multiplier</div>
          <div className="electric-heading text-3xl text-electric-lime">
            {performance}
          </div>
          <div className="text-sm text-electric-text-muted mt-1">engagement boost</div>
        </div>
      </div>

      {/* Top Emojis */}
      {topEmojis.length > 0 && (
        <div className="bg-electric-dark border border-electric-border rounded-xl p-6">
          <div className="mb-4">
            <h3 className="electric-heading text-xl text-electric-text mb-2">
              Top Performing Emojis
            </h3>
            <p className="electric-body text-sm text-electric-text-muted">
              {uniqueEmojis} unique emojis found
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {topEmojis.map((emoji, index) => (
              <div
                key={index}
                className="bg-electric-muted border border-electric-border rounded-lg p-4 hover:border-electric-lime transition-all text-center"
              >
                <div className="text-4xl mb-2">{emoji.emoji}</div>
                <div className="text-sm text-electric-text-muted mb-1">
                  Used {emoji.count}x
                </div>
                <div className="electric-accent font-medium">
                  {emoji.avgEngagement.toLocaleString()} avg
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {topEmojis.length === 0 && (
        <div className="bg-electric-dark border border-electric-border rounded-xl p-6 text-center">
          <p className="electric-body text-electric-text-muted">
            No emojis found in tweets.
          </p>
        </div>
      )}
    </div>
  );
}
