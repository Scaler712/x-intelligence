import { useMemo } from 'react';
import '../styles/electric.css';
import { extractThemes } from '../utils/analytics';

export default function ThemeExtractor({ tweets }) {
  const themes = useMemo(() => extractThemes(tweets, 10), [tweets]);

  if (tweets.length === 0) {
    return (
      <div className="bg-electric-dark border border-electric-border rounded-xl p-6">
        <h3 className="electric-heading text-xl text-electric-text mb-2">
          Top Themes
        </h3>
        <p className="electric-body text-electric-text-muted">
          No themes available yet. Start scraping to extract themes.
        </p>
      </div>
    );
  }

  const maxFrequency = themes.length > 0 ? Math.max(...themes.map(t => t.frequency)) : 1;

  return (
    <div className="bg-electric-dark border border-electric-border rounded-xl p-6">
      <div className="mb-4">
        <h3 className="electric-heading text-xl text-electric-text mb-2">
          Top Themes
        </h3>
        <p className="electric-body text-sm text-electric-text-muted">
          Most common topics and words
        </p>
      </div>

      <div className="space-y-3">
        {themes.map((theme, index) => {
          const widthPercentage = (theme.frequency / maxFrequency) * 100;

          return (
            <div key={theme.id} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="electric-body text-electric-text font-medium capitalize">
                  {theme.theme}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-electric-text-muted">
                    {theme.percentage}% of tweets
                  </span>
                  <span className="electric-accent font-medium text-sm">
                    {theme.frequency} times
                  </span>
                </div>
              </div>
              <div className="h-2 bg-electric-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-electric-lime transition-all duration-300"
                  style={{ width: `${widthPercentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

