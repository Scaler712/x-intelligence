
export default function QuickFilters({ filters, onFilterChange }) {
  const toggles = [
    { key: 'excludeRetweets', label: 'Exclude Retweets', icon: '🔄' },
    { key: 'excludeReplies', label: 'Exclude Replies', icon: '💬' },
    { key: 'mediaOnly', label: 'Media Only', icon: '📷' }
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {toggles.map(toggle => (
        <button
          key={toggle.key}
          onClick={() => onFilterChange(toggle.key, !filters[toggle.key])}
          className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-light transition-all duration-200 border
            ${filters[toggle.key]
              ? 'bg-electric-lime text-black border-electric-lime electric-glow'
              : 'bg-electric-dark text-electric-text border-electric-border hover:border-electric-lime'
            }`}
        >
          <span>{toggle.icon}</span>
          <span>{toggle.label}</span>
        </button>
      ))}
    </div>
  );
}
