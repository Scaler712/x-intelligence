import { useMemo } from 'react';
import '../../styles/electric.css';
import { analyzeMedia } from '../../utils/mediaAnalysis';

export default function MediaAnalysis({ tweets }) {
  const mediaData = useMemo(() => analyzeMedia(tweets), [tweets]);

  if (tweets.length === 0) {
    return null;
  }

  const mediaTypes = [
    { key: 'withImage', label: 'Images', icon: '📷', color: 'text-blue-400' },
    { key: 'withVideo', label: 'Videos', icon: '🎥', color: 'text-purple-400' },
    { key: 'withLink', label: 'Links', icon: '🔗', color: 'text-green-400' },
    { key: 'noMedia', label: 'Text Only', icon: '📝', color: 'text-electric-text-muted' }
  ];

  const maxEngagement = Math.max(
    mediaData.withImage.avgEngagement,
    mediaData.withVideo.avgEngagement,
    mediaData.withLink.avgEngagement,
    mediaData.noMedia.avgEngagement
  );

  return (
    <div className="space-y-6">
      {/* Recommendation */}
      <div className="bg-electric-lime/10 border border-electric-lime rounded-xl p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <div className="electric-body text-electric-text font-medium">
              Recommendation
            </div>
            <div className="text-sm text-electric-lime">
              {mediaData.recommendation}
            </div>
          </div>
        </div>
      </div>

      {/* Media Types */}
      <div className="bg-electric-dark border border-electric-border rounded-xl p-6">
        <h3 className="electric-heading text-xl text-electric-text mb-4">
          Media Type Performance
        </h3>
        <div className="space-y-4">
          {mediaTypes.map(({ key, label, icon, color }) => {
            const data = mediaData[key];
            const percentage = maxEngagement > 0
              ? (data.avgEngagement / maxEngagement) * 100
              : 0;

            return (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{icon}</span>
                    <span className="electric-body text-electric-text">{label}</span>
                    <span className="text-sm text-electric-text-muted">
                      ({data.count} tweets)
                    </span>
                  </div>
                  <div className={`font-medium ${color}`}>
                    {data.avgEngagement.toLocaleString()} avg
                  </div>
                </div>
                <div className="relative w-full h-2 bg-electric-border rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-electric-lime transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance Comparison */}
      <div className="bg-electric-dark border border-electric-border rounded-xl p-6">
        <h3 className="electric-heading text-xl text-electric-text mb-4">
          Performance vs Text-Only
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-electric-muted rounded-lg p-4 border border-electric-border">
            <div className="text-sm text-electric-text-muted mb-1">Images vs Text</div>
            <div className="electric-heading text-3xl text-electric-lime">
              {mediaData.performance.imageVsText}
            </div>
            <div className="text-sm text-electric-text-muted mt-1">engagement multiplier</div>
          </div>
          <div className="bg-electric-muted rounded-lg p-4 border border-electric-border">
            <div className="text-sm text-electric-text-muted mb-1">Videos vs Text</div>
            <div className="electric-heading text-3xl text-electric-lime">
              {mediaData.performance.videoVsText}
            </div>
            <div className="text-sm text-electric-text-muted mt-1">engagement multiplier</div>
          </div>
        </div>
      </div>
    </div>
  );
}
