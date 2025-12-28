import { useState, useMemo } from 'react';
import { calculateEngagementStats, findTopPerformers, analyzePostingTimes } from '../utils/analytics';
import { extractHook } from '../utils/hooksExtractor';

export default function StatsSidebar({ tweets }) {
  const [isOpen, setIsOpen] = useState(true);
  const stats = useMemo(() => calculateEngagementStats(tweets), [tweets]);
  const topPerformers = useMemo(() => findTopPerformers(tweets, 5), [tweets]);
  const postingTimes = useMemo(() => analyzePostingTimes(tweets), [tweets]);

  if (tweets.length === 0) {
    return (
      <div className="bg-[#1a1a1a] rounded-xl p-6">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between"
        >
          <h3 className="text-sm font-semibold text-white">
            Statistics
          </h3>
          <svg
            className={`w-4 h-4 text-[#a0a0a0] transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isOpen && (
          <div className="mt-4">
            <p className="text-[#a0a0a0] text-sm">
              Start scraping to see statistics here.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1a] rounded-xl p-6 space-y-6 lg:sticky lg:top-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between"
      >
        <h3 className="text-sm font-semibold text-white">
          Statistics <span className="text-[#2563eb]">({tweets.length})</span>
        </h3>
        <svg
          className={`w-4 h-4 text-[#a0a0a0] transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="space-y-6">
          {/* Engagement Stats */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wide text-[#a0a0a0]">
              Engagement Averages
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#a0a0a0]">Likes</span>
                <span className="text-[#2563eb] font-medium">{stats.avgLikes.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#a0a0a0]">Retweets</span>
                <span className="text-[#2563eb] font-medium">{stats.avgRetweets.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#a0a0a0]">Comments</span>
                <span className="text-[#2563eb] font-medium">{stats.avgComments.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#2a2a2a]">
                <span className="text-sm text-white font-medium">Total</span>
                <span className="text-[#2563eb] font-bold">{stats.avgTotalEngagement.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Posting Frequency */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wide text-[#a0a0a0]">
              Posting Frequency
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#a0a0a0]">Per Day</span>
                <span className="text-[#2563eb] font-medium">{postingTimes.postsPerDay}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#a0a0a0]">Per Week</span>
                <span className="text-[#2563eb] font-medium">{postingTimes.postsPerWeek}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#a0a0a0]">Best Day</span>
                <span className="text-[#2563eb] font-medium text-xs">{postingTimes.mostActiveDay}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#a0a0a0]">Best Hour</span>
                <span className="text-[#2563eb] font-medium text-xs">{postingTimes.mostActiveHour}</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wide text-[#a0a0a0]">
              Quick Metrics
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#a0a0a0]">Peak Engagement</span>
                <span className="text-[#2563eb] font-medium">{stats.maxEngagement.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#a0a0a0]">Engagement Rate</span>
                <span className="text-[#2563eb] font-medium">{Math.round(stats.engagementRate).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Top Performers */}
          {topPerformers.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wide text-[#a0a0a0]">
                Top Performers
              </h4>
              <div className="space-y-3">
                {topPerformers.map((tweet, index) => (
                  <div
                    key={index}
                    className="p-3 hover:bg-[#252525] transition-colors rounded"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs text-[#a0a0a0]">#{tweet.rank}</span>
                      <span className="text-[#2563eb] font-medium text-xs">
                        {tweet.totalEngagement.toLocaleString()} engagement
                      </span>
                    </div>
                    <p className="text-sm text-white mb-2 overflow-hidden text-ellipsis" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {extractHook(tweet.content, 10)}
                    </p>
                    <div className="flex gap-3 text-xs text-[#a0a0a0]">
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
      )}
    </div>
  );
}
