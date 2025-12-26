import '../../styles/electric.css';

export default function SearchBar({ searchQuery, onSearchChange, placeholder = "Search tweets...", matchCount }) {
  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-electric-dark border border-electric-border rounded-lg pl-10 pr-4 py-2.5 text-electric-text placeholder-electric-text-muted focus:outline-none focus:border-electric-lime transition-colors"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-electric-text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      {searchQuery && matchCount !== undefined && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-electric-text-muted">
          {matchCount} {matchCount === 1 ? 'result' : 'results'}
        </div>
      )}
    </div>
  );
}
