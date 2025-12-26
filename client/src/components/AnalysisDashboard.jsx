import '../styles/electric.css';
import ScheduleHeatmap from './ScheduleHeatmap';
import ThemeExtractor from './ThemeExtractor';
import EngagementTimeline from './EngagementTimeline';
import { useMemo } from 'react';
import { extractHashtags, wordFrequency } from '../utils/analytics';

export default function AnalysisDashboard({ tweets }) {
  const hashtags = useMemo(() => extractHashtags(tweets).slice(0, 10), [tweets]);
  const wordFreq = useMemo(() => wordFrequency(tweets, 15), [tweets]);

  if (tweets.length === 0) {
    return (
      <div className="bg-electric-muted border border-electric-border rounded-xl p-12 text-center">
        <p className="electric-body text-electric-text-muted">
          No data available for analysis. Start scraping to see insights.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Schedule Heatmap */}
      <ScheduleHeatmap tweets={tweets} />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Themes */}
        <ThemeExtractor tweets={tweets} />

        {/* Top Hashtags */}
        <div className="bg-electric-dark border border-electric-border rounded-xl p-6">
          <div className="mb-4">
            <h3 className="electric-heading text-xl text-electric-text mb-2">
              Top Hashtags
            </h3>
            <p className="electric-body text-sm text-electric-text-muted">
              Most used hashtags
            </p>
          </div>

          {hashtags.length === 0 ? (
            <p className="electric-body text-electric-text-muted text-sm">
              No hashtags found in tweets.
            </p>
          ) : (
            <div className="space-y-3">
              {hashtags.map((hashtag, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-electric-muted rounded-lg border border-electric-border hover:border-electric-lime/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="electric-accent font-medium">#{index + 1}</span>
                    <span className="electric-body text-electric-text font-medium">
                      {hashtag.tag}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-electric-text-muted">
                    <span>{hashtag.count} uses</span>
                    <span className="electric-accent">
                      {hashtag.avgEngagement.toLocaleString()} avg engagement
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Engagement Timeline */}
      <EngagementTimeline tweets={tweets} />

      {/* Word Frequency */}
      <div className="bg-electric-dark border border-electric-border rounded-xl p-6">
        <div className="mb-4">
          <h3 className="electric-heading text-xl text-electric-text mb-2">
            Word Frequency
          </h3>
          <p className="electric-body text-sm text-electric-text-muted">
            Most common words (excluding stop words)
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {wordFreq.map((item, index) => {
            const maxCount = wordFreq[0]?.count || 1;
            const fontSize = Math.max(12, 12 + (item.count / maxCount) * 8);
            const opacity = 0.6 + (item.count / maxCount) * 0.4;

            return (
              <span
                key={index}
                className="inline-block px-3 py-1.5 bg-electric-muted border border-electric-border rounded-lg hover:border-electric-lime transition-all cursor-default"
                style={{
                  fontSize: `${fontSize}px`,
                  opacity: opacity
                }}
                title={`${item.word}: ${item.count} occurrences`}
              >
                <span className="electric-accent">{item.word}</span>
                <span className="text-electric-text-muted text-xs ml-2">
                  {item.count}
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

