export default function TabNavigation({ activeTab, onTabChange, tweetCount }) {
  const tabs = [
    { id: 'tweets', label: 'Tweets', count: tweetCount },
    { id: 'hooks', label: 'Hooks', count: tweetCount },
    { id: 'analysis', label: 'Analysis', count: tweetCount > 0 ? 1 : 0 },
  ];

  return (
    <div className="inline-flex items-center gap-1 p-1 bg-glass-background backdrop-blur-md border border-glass-border rounded-full mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full text-sm font-light transition-none
            ${activeTab === tab.id 
              ? 'bg-foreground/10 text-foreground' 
              : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
            }
          `}
        >
          {tab.label}
          {tab.count > 0 && (
            <span className={`
              px-2 py-0.5 text-xs rounded-md font-light
              ${activeTab === tab.id 
                ? 'bg-foreground/10 text-foreground' 
                : 'bg-glass-background text-muted-foreground'
              }
            `}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
