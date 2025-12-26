import { useMemo } from 'react';
import '../styles/electric.css';
import { calculateEngagementStats, findTopPerformers, analyzePostingTimes } from '../utils/analytics';
import { extractHook } from '../utils/hooksExtractor';

export default function StatsSidebar({ tweets }) {
  const stats = useMemo(() => calculateEngagementStats(tweets), [tweets]);
  const topPerformers = useMemo(() => findTopPerformers(tweets, 5), [tweets]);
  const postingTimes = useMemo(() => analyzePostingTimes(tweets), [tweets]);

  if (tweets.length === 0) {
    return (
      <div className="w-80 bg-electric-muted border border-electric-border rounded-xl p-6">
        <h3 className="electric-heading text-xl text-electric-text mb-4">
          Stats
        </h3>
        <p className="electric-body text-electric-text-muted text-sm">
          Start scraping to see statistics here.
        </p>
      </div>
    );
  }

  return (
      <div className="w-full lg:w-80 bg-electric-muted border border-electric-border rounded-xl p-6 space-y-6 lg:sticky lg:top-4 h-fit lg:max-h-[calc(100vh-2rem)] overflow-y-auto">
      <div>
        <h3 className="electric-heading text-xl text-electric-text mb-4">
          Stats <span className="electric-accent">({tweets.length})</span>
        </h3>
      </div>

      {/* Engagement Stats */}
      <div className="space-y-3">
        <h4 className="electric-heading text-sm text-electric-text-muted uppercase tracking-wide">
          Engagement Averages
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-electric-text-muted">Likes</span>
            <span className="electric-accent font-medium">{stats.avgLikes.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-electric-text-muted">Retweets</span>
            <span className="electric-accent font-medium">{stats.avgRetweets.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-electric-text-muted">Comments</span>
            <span className="electric-accent font-medium">{stats.avgComments.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-electric-border">
            <span className="text-sm text-electric-text font-medium">Total</span>
            <span className="electric-accent font-bold">{stats.avgTotalEngagement.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Posting Frequency */}
      <div className="space-y-3">
        <h4 className="electric-heading text-sm text-electric-text-muted uppercase tracking-wide">
          Posting Frequency
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-electric-text-muted">Per Day</span>
            <span className="electric-accent font-medium">{postingTimes.postsPerDay}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-electric-text-muted">Per Week</span>
            <span className="electric-accent font-medium">{postingTimes.postsPerWeek}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-electric-text-muted">Best Day</span>
            <span className="electric-accent font-medium text-xs">{postingTimes.mostActiveDay}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-electric-text-muted">Best Hour</span>
            <span className="electric-accent font-medium text-xs">{postingTimes.mostActiveHour}</span>
          </div>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="space-y-3">
        <h4 className="electric-heading text-sm text-electric-text-muted uppercase tracking-wide">
          Quick Metrics
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-electric-text-muted">Peak Engagement</span>
            <span className="electric-accent font-medium">{stats.maxEngagement.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-electric-text-muted">Engagement Rate</span>
            <span className="electric-accent font-medium">{Math.round(stats.engagementRate).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      {topPerformers.length > 0 && (
        <div className="space-y-3">
          <h4 className="electric-heading text-sm text-electric-text-muted uppercase tracking-wide">
            Top Performers
          </h4>
          <div className="space-y-3">
            {topPerformers.map((tweet, index) => (
              <div
                key={index}
                className="bg-electric-dark border border-electric-border rounded-lg p-3 hover:border-electric-lime/50 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs text-electric-text-muted">#{tweet.rank}</span>
                  <span className="electric-accent font-medium text-xs">
                    {tweet.totalEngagement.toLocaleString()} engagement
                  </span>
                </div>
                <p className="electric-body text-sm text-electric-text mb-2 overflow-hidden text-ellipsis" style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {extractHook(tweet.content, 10)}
                </p>
                <div className="flex gap-3 text-xs text-electric-text-muted">
                  <span>❤️ {tweet.likes.toLocaleString()}</span>
                  <span>🔄 {tweet.retweets.toLocaleString()}</span>
                  <span>💬 {tweet.comments.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

