import { useMemo } from 'react';
import '../styles/electric.css';
import { analyzePostingSchedule } from '../utils/analytics';

export default function ScheduleHeatmap({ tweets }) {
  const schedule = useMemo(() => analyzePostingSchedule(tweets), [tweets]);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Normalize values for color intensity (0-100)
  const getIntensity = (value, maxValue) => {
    if (maxValue === 0) return 0;
    return Math.round((value / maxValue) * 100);
  };

  const maxFrequency = Math.max(...schedule.frequencyMatrix.flat());

  return (
    <div className="bg-electric-dark border border-electric-border rounded-xl p-6">
      <div className="mb-4">
        <h3 className="electric-heading text-xl text-electric-text mb-2">
          Posting Schedule Heatmap
        </h3>
        <p className="electric-body text-sm text-electric-text-muted">
          Frequency of posts by day and hour
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Header with hours */}
          <div className="grid grid-cols-[60px_repeat(24,minmax(20px,1fr))] gap-1 mb-2">
            <div></div>
            {hours.map(hour => (
              <div key={hour} className="text-xs text-electric-text-muted text-center">
                {hour}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          {schedule.frequencyMatrix.map((row, dayIndex) => (
            <div
              key={dayIndex}
              className="grid grid-cols-[60px_repeat(24,minmax(20px,1fr))] gap-1 mb-1"
            >
              {/* Day label */}
              <div className="text-sm text-electric-text-muted flex items-center">
                {dayNames[dayIndex]}
              </div>

              {/* Hour cells */}
              {row.map((count, hourIndex) => {
                const intensity = getIntensity(count, maxFrequency);
                const bgOpacity = Math.max(0.1, intensity / 100);
                const isActive = count > 0;

                return (
                  <div
                    key={hourIndex}
                    className={`
                      aspect-square rounded border border-electric-border
                      ${isActive ? 'cursor-pointer hover:border-electric-lime transition-all' : ''}
                    `}
                    style={{
                      backgroundColor: isActive
                        ? `rgba(212, 255, 74, ${bgOpacity})`
                        : 'transparent'
                    }}
                    title={`${dayNames[dayIndex]} ${hourIndex}:00 - ${count} posts`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-between text-sm text-electric-text-muted">
        <span>Less</span>
        <div className="flex gap-1 flex-1 mx-4">
          {[0, 25, 50, 75, 100].map(val => (
            <div
              key={val}
              className="flex-1 h-4 rounded border border-electric-border"
              style={{
                backgroundColor: `rgba(212, 255, 74, ${val / 100})`
              }}
            />
          ))}
        </div>
        <span>More</span>
      </div>

      {/* Best Times Info */}
      <div className="mt-4 pt-4 border-t border-electric-border">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-electric-text-muted">Most Active: </span>
            <span className="electric-accent">
              {schedule.bestDay} {schedule.bestHour}:00
            </span>
          </div>
          <div>
            <span className="text-electric-text-muted">Best Engagement: </span>
            <span className="electric-accent">
              {schedule.bestEngagementDay} {schedule.bestEngagementHour}:00
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

