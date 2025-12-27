import { useMemo } from 'react';
import '../../styles/electric.css';
import { extractLinks, analyzeLinkPerformance } from '../../utils/linkAnalysis';

export default function LinkAnalysis({ tweets }) {
  const linkData = useMemo(() => extractLinks(tweets), [tweets]);
  const performance = useMemo(() => analyzeLinkPerformance(tweets), [tweets]);

  if (tweets.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Link Performance Overview */}
      <div className="bg-electric-dark border border-electric-border rounded-xl p-6">
        <h3 className="electric-heading text-xl text-electric-text mb-4">
          Link Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-electric-muted rounded-lg p-4 border border-electric-border">
            <div className="text-sm text-electric-text-muted mb-1">With Links</div>
            <div className="electric-heading text-2xl text-electric-text">
              {performance.withLinks.count}
            </div>
            <div className="text-sm text-electric-lime mt-1">
              {performance.withLinks.avgEngagement} avg engagement
            </div>
          </div>
          <div className="bg-electric-muted rounded-lg p-4 border border-electric-border">
            <div className="text-sm text-electric-text-muted mb-1">Without Links</div>
            <div className="electric-heading text-2xl text-electric-text">
              {performance.withoutLinks.count}
            </div>
            <div className="text-sm text-electric-text-muted mt-1">
              {performance.withoutLinks.avgEngagement} avg engagement
            </div>
          </div>
          <div className="bg-electric-muted rounded-lg p-4 border border-electric-border">
            <div className="text-sm text-electric-text-muted mb-1">Performance</div>
            <div className="electric-heading text-2xl text-electric-lime">
              {performance.performance}
            </div>
            <div className="text-sm text-electric-text-muted mt-1">
              {performance.withLinks.avgEngagement > performance.withoutLinks.avgEngagement
                ? 'Links boost engagement'
                : 'Links reduce engagement'}
            </div>
          </div>
        </div>
      </div>

      {/* Top Domains */}
      <div className="bg-electric-dark border border-electric-border rounded-xl p-6">
        <h3 className="electric-heading text-xl text-electric-text mb-4">
          Top Domains <span className="electric-accent">({linkData.topDomains.length})</span>
        </h3>
        {linkData.topDomains.length === 0 ? (
          <p className="text-electric-text-muted text-sm">No links found in tweets.</p>
        ) : (
          <div className="space-y-2">
            {linkData.topDomains.map((domain, index) => (
              <div
                key={domain.domain}
                className="flex items-center justify-between p-3 bg-electric-muted rounded-lg border border-electric-border hover:border-electric-lime/50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="electric-accent font-medium text-lg">#{index + 1}</span>
                  <div>
                    <div className="electric-body text-electric-text font-medium">
                      {domain.domain}
                    </div>
                    <div className="text-sm text-electric-text-muted">
                      {domain.count} {domain.count === 1 ? 'link' : 'links'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="electric-accent font-medium">
                    {domain.avgEngagement.toLocaleString()}
                  </div>
                  <div className="text-sm text-electric-text-muted">avg engagement</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
