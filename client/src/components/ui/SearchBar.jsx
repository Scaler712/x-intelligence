import Input from './Input';

export default function SearchBar({ searchQuery, onSearchChange, placeholder = "Search...", matchCount }) {
  return (
    <div className="relative">
      <Input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10"
      />
      <svg
        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      {matchCount !== undefined && searchQuery && (
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
          {matchCount} results
        </span>
      )}
    </div>
  );
}
