import { useMemo } from 'react';
import '../../styles/electric.css';
import { compareScrapes } from '../../utils/comparison';

export default function GapAnalysis({ scrapes }) {
  const comparisonData = useMemo(() => compareScrapes(scrapes), [scrapes]);

  if (!scrapes || scrapes.length < 2) {
    return (
      <div className="bg-electric-dark border border-electric-border rounded-xl p-6">
        <p className="electric-body text-electric-text-muted text-center">
          Select at least 2 scrapes to perform gap analysis.
        </p>
      </div>
    );
  }

  const { gaps, bestPerformer } = comparisonData;

  if (!gaps || gaps.length === 0) {
    return null;
  }

  return (
    <div className="bg-electric-dark border border-electric-border rounded-xl p-6">
      <div className="mb-4">
        <h3 className="electric-heading text-xl text-electric-text mb-2">
          Performance Gap Analysis
        </h3>
        <p className="electric-body text-sm text-electric-text-muted">
          How far behind {bestPerformer?.username} are other profiles?
        </p>
      </div>

      <div className="space-y-6">
        {gaps.map((gap, index) => (
          <div key={index} className="border border-electric-border rounded-lg p-4">
            <div className="mb-4">
              <h4 className="electric-heading text-lg text-electric-text mb-1">
                {gap.username}
              </h4>
              <p className="text-sm text-electric-text-muted">
                Gaps compared to {bestPerformer?.username}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Likes Gap */}
              <div className="bg-electric-muted rounded-lg p-3">
                <div className="text-xs text-electric-text-muted mb-1">Likes Gap</div>
                <div className="electric-accent font-bold text-lg">
                  -{gap.gaps.likes.value.toLocaleString()}
                </div>
                <div className="text-xs text-red-400">
                  {gap.gaps.likes.percentage}% behind
                </div>
              </div>

              {/* Retweets Gap */}
              <div className="bg-electric-muted rounded-lg p-3">
                <div className="text-xs text-electric-text-muted mb-1">Retweets Gap</div>
                <div className="electric-accent font-bold text-lg">
                  -{gap.gaps.retweets.value.toLocaleString()}
                </div>
                <div className="text-xs text-red-400">
                  {gap.gaps.retweets.percentage}% behind
                </div>
              </div>

              {/* Comments Gap */}
              <div className="bg-electric-muted rounded-lg p-3">
                <div className="text-xs text-electric-text-muted mb-1">Comments Gap</div>
                <div className="electric-accent font-bold text-lg">
                  -{gap.gaps.comments.value.toLocaleString()}
                </div>
                <div className="text-xs text-red-400">
                  {gap.gaps.comments.percentage}% behind
                </div>
              </div>

              {/* Total Engagement Gap */}
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <div className="text-xs text-electric-text-muted mb-1">Total Gap</div>
                <div className="text-red-400 font-bold text-lg">
                  -{gap.gaps.engagement.value.toLocaleString()}
                </div>
                <div className="text-xs text-red-400">
                  {gap.gaps.engagement.percentage}% behind
                </div>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="mt-4">
              <div className="text-xs text-electric-text-muted mb-2">
                Catching up to {bestPerformer?.username}
              </div>
              <div className="relative w-full h-2 bg-electric-border rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-electric-lime transition-all duration-300"
                  style={{
                    width: `${Math.max(0, 100 - gap.gaps.engagement.percentage)}%`
                  }}
                />
              </div>
              <div className="text-xs text-electric-text-muted mt-1 text-right">
                {Math.max(0, 100 - gap.gaps.engagement.percentage)}% of leader
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="mt-6 bg-electric-lime/10 border border-electric-lime rounded-xl p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <div className="electric-body text-electric-text font-medium mb-2">
              Recommendations to Close the Gap
            </div>
            <ul className="text-sm text-electric-lime space-y-1">
              <li>• Study {bestPerformer?.username}'s top performing content patterns</li>
              <li>• Analyze their posting schedule and optimal times</li>
              <li>• Compare content types (links, media, text-only)</li>
              <li>• Review their use of CTAs, emojis, and hooks</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
