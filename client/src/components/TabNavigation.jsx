import '../styles/electric.css';

export default function TabNavigation({ activeTab, onTabChange, tweetCount }) {
  const tabs = [
    { id: 'tweets', label: 'Tweets', count: tweetCount },
    { id: 'hooks', label: 'Hooks', count: tweetCount },
    { id: 'analysis', label: 'Analysis', count: tweetCount > 0 ? 1 : 0 },
  ];

  return (
    <div className="bg-electric-muted border border-electric-border rounded-xl p-2 flex gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            flex-1 inline-flex items-center justify-center rounded-lg font-light transition-all duration-200 h-10 px-4 text-sm
            ${
              activeTab === tab.id
                ? 'bg-electric-lime text-black electric-glow'
                : 'bg-electric-dark text-electric-text hover:bg-electric-border border border-electric-border'
            }
          `}
        >
          {tab.label}
          {tab.count > 0 && (
            <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
              activeTab === tab.id ? 'bg-black/20' : 'bg-electric-muted'
            }`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

