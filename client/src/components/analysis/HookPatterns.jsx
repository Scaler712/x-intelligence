import { useMemo } from 'react';
import '../../styles/electric.css';
import { categorizeHooks } from '../../utils/contentAnalysis';

export default function HookPatterns({ tweets }) {
  const hookData = useMemo(() => categorizeHooks(tweets), [tweets]);

  if (tweets.length === 0) {
    return null;
  }

  const maxEngagement = Math.max(...hookData.map(h => h.avgEngagement), 0);
  const bestHook = hookData.reduce((best, current) =>
    current.avgEngagement > best.avgEngagement ? current : best
  , hookData[0] || { label: 'None', avgEngagement: 0 });

  const hookIcons = {
    question: '❓',
    number: '🔢',
    urgency: '⚡',
    curiosity: '🔍'
  };

  const hookColors = {
    question: 'text-blue-400',
    number: 'text-purple-400',
    urgency: 'text-orange-400',
    curiosity: 'text-pink-400'
  };

  return (
    <div className="space-y-6">
      {/* Recommendation */}
      <div className="bg-electric-lime/10 border border-electric-lime rounded-xl p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <div className="electric-body text-electric-text font-medium">
              Hook Pattern Recommendation
            </div>
            <div className="text-sm text-electric-lime">
              {bestHook.avgEngagement > 0
                ? `${bestHook.label} perform best (${bestHook.avgEngagement.toLocaleString()} avg engagement)`
                : 'No hook patterns detected - try starting tweets with questions or numbers'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Hook Pattern Performance */}
      <div className="bg-electric-dark border border-electric-border rounded-xl p-6">
        <h3 className="electric-heading text-xl text-electric-text mb-4">
          Hook Pattern Performance
        </h3>
        <div className="space-y-4">
          {hookData.map((hook) => {
            const percentage = maxEngagement > 0 ? (hook.avgEngagement / maxEngagement) * 100 : 0;
            const icon = hookIcons[hook.type] || '📝';
            const color = hookColors[hook.type] || 'text-electric-text-muted';

            return (
              <div key={hook.type} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{icon}</span>
                    <span className="electric-body text-electric-text">{hook.label}</span>
                    <span className="text-sm text-electric-text-muted">
                      ({hook.count} tweets, {hook.percentage}%)
                    </span>
                  </div>
                  <div className={`font-medium ${color}`}>
                    {hook.avgEngagement.toLocaleString()} avg
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

      {/* Hook Pattern Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hookData.filter(h => h.count > 0).map((hook) => {
          const icon = hookIcons[hook.type] || '📝';
          const color = hookColors[hook.type] || 'text-electric-text-muted';

          return (
            <div
              key={hook.type}
              className="bg-electric-dark border border-electric-border rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{icon}</span>
                <div>
                  <h4 className="electric-heading text-lg text-electric-text">
                    {hook.label}
                  </h4>
                  <p className="text-sm text-electric-text-muted">
                    {hook.count} tweet{hook.count !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-electric-text-muted">Usage</span>
                  <span className={`font-medium ${color}`}>{hook.percentage}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-electric-text-muted">Avg Engagement</span>
                  <span className="electric-accent font-medium">
                    {hook.avgEngagement.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hook Examples */}
      <div className="bg-electric-dark border border-electric-border rounded-xl p-6">
        <h3 className="electric-heading text-xl text-electric-text mb-4">
          Hook Pattern Examples
        </h3>
        <div className="space-y-3">
          <div className="bg-electric-muted rounded-lg p-3 border border-electric-border">
            <div className="flex items-center gap-2 mb-1">
              <span>❓</span>
              <span className="electric-body text-electric-text font-medium">Question Hooks</span>
            </div>
            <p className="text-sm text-electric-text-muted ml-6">
              What, Why, How, When, Where, Who, Which, Can, Do, Is, Are...
            </p>
          </div>

          <div className="bg-electric-muted rounded-lg p-3 border border-electric-border">
            <div className="flex items-center gap-2 mb-1">
              <span>🔢</span>
              <span className="electric-body text-electric-text font-medium">Number Hooks</span>
            </div>
            <p className="text-sm text-electric-text-muted ml-6">
              5 ways, 10 reasons, 3 tips, 7 steps...
            </p>
          </div>

          <div className="bg-electric-muted rounded-lg p-3 border border-electric-border">
            <div className="flex items-center gap-2 mb-1">
              <span>⚡</span>
              <span className="electric-body text-electric-text font-medium">Urgency Hooks</span>
            </div>
            <p className="text-sm text-electric-text-muted ml-6">
              Now, Today, Urgent, Breaking, Just, New, Alert...
            </p>
          </div>

          <div className="bg-electric-muted rounded-lg p-3 border border-electric-border">
            <div className="flex items-center gap-2 mb-1">
              <span>🔍</span>
              <span className="electric-body text-electric-text font-medium">Curiosity Hooks</span>
            </div>
            <p className="text-sm text-electric-text-muted ml-6">
              Secret, Hidden, Unknown, Revealed, Discovered, Nobody, Never...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
