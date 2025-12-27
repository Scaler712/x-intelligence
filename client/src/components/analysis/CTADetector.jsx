import { useMemo } from 'react';
import '../../styles/electric.css';
import { detectCTAs } from '../../utils/contentAnalysis';

export default function CTADetector({ tweets }) {
  const ctaData = useMemo(() => detectCTAs(tweets), [tweets]);

  if (tweets.length === 0) {
    return null;
  }

  const { topCTAs, withCTA, withoutCTA, performance } = ctaData;
  const maxEngagement = Math.max(withCTA.avgEngagement, withoutCTA.avgEngagement);

  return (
    <div className="space-y-6">
      {/* Recommendation */}
      <div className="bg-electric-lime/10 border border-electric-lime rounded-xl p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <div className="electric-body text-electric-text font-medium">
              Call-to-Action Recommendation
            </div>
            <div className="text-sm text-electric-lime">
              {performance === 'N/A'
                ? 'Not enough data to compare CTA performance'
                : withCTA.avgEngagement > withoutCTA.avgEngagement
                  ? `CTAs boost engagement ${performance} - keep using them!`
                  : `Tweets without CTAs perform better - use CTAs sparingly`
              }
            </div>
          </div>
        </div>
      </div>

      {/* CTA vs No CTA Performance */}
      <div className="bg-electric-dark border border-electric-border rounded-xl p-6">
        <h3 className="electric-heading text-xl text-electric-text mb-4">
          CTA Impact on Engagement
        </h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">📢</span>
                <span className="electric-body text-electric-text">With CTAs</span>
                <span className="text-sm text-electric-text-muted">
                  ({withCTA.count} tweets)
                </span>
              </div>
              <div className="font-medium text-electric-lime">
                {withCTA.avgEngagement.toLocaleString()} avg
              </div>
            </div>
            <div className="relative w-full h-2 bg-electric-border rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-electric-lime transition-all duration-300"
                style={{ width: `${maxEngagement > 0 ? (withCTA.avgEngagement / maxEngagement) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">📝</span>
                <span className="electric-body text-electric-text">Without CTAs</span>
                <span className="text-sm text-electric-text-muted">
                  ({withoutCTA.count} tweets)
                </span>
              </div>
              <div className="font-medium text-electric-text-muted">
                {withoutCTA.avgEngagement.toLocaleString()} avg
              </div>
            </div>
            <div className="relative w-full h-2 bg-electric-border rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-electric-muted transition-all duration-300"
                style={{ width: `${maxEngagement > 0 ? (withoutCTA.avgEngagement / maxEngagement) * 100 : 0}%` }}
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
          <div className="text-sm text-electric-text-muted mt-1">engagement impact</div>
        </div>
      </div>

      {/* Top CTAs */}
      {topCTAs.length > 0 && (
        <div className="bg-electric-dark border border-electric-border rounded-xl p-6">
          <div className="mb-4">
            <h3 className="electric-heading text-xl text-electric-text mb-2">
              Top Performing CTAs
            </h3>
            <p className="electric-body text-sm text-electric-text-muted">
              Most effective call-to-action phrases
            </p>
          </div>

          <div className="space-y-3">
            {topCTAs.map((cta, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-electric-muted rounded-lg border border-electric-border hover:border-electric-lime/50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="electric-accent font-medium">#{index + 1}</span>
                  <div>
                    <div className="electric-body text-electric-text font-medium">
                      {cta.cta}
                    </div>
                    <div className="text-sm text-electric-text-muted">
                      Used {cta.count} time{cta.count !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="electric-accent font-medium">
                    {cta.avgEngagement.toLocaleString()}
                  </div>
                  <div className="text-sm text-electric-text-muted">
                    avg engagement
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {topCTAs.length === 0 && (
        <div className="bg-electric-dark border border-electric-border rounded-xl p-6 text-center">
          <p className="electric-body text-electric-text-muted">
            No CTAs detected in tweets. Try adding phrases like "learn more", "check out", or "join us".
          </p>
        </div>
      )}
    </div>
  );
}
