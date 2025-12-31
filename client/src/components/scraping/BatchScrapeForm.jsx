import { useState } from 'react';
import FormField from '../ui/FormField';
import Textarea from '../ui/Textarea';
import Input from '../ui/Input';
import Button from '../ui/Button';
import QuickFilters from '../filters/QuickFilters';

export default function BatchScrapeForm({ onBatchStart, isProcessing }) {
  const [usernames, setUsernames] = useState('');
  const [filters, setFilters] = useState({
    MIN_LIKES: 0,
    MIN_RETWEETS: 0,
    MIN_COMMENTS: 0,
    MIN_TOTAL_ENGAGEMENT: 0,
    excludeRetweets: false,
    excludeReplies: false,
    mediaOnly: false,
    dateRange: { start: null, end: null }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const usernameList = usernames
      .split('\n')
      .map(u => u.trim())
      .filter(u => u.length > 0);

    if (usernameList.length === 0) {
      alert('Please enter at least one username');
      return;
    }

    onBatchStart(usernameList, filters);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleDateRangeChange = (start, end) => {
    setFilters(prev => ({ 
      ...prev, 
      dateRange: { start, end } 
    }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white">
        Batch <span className="text-[#2563eb]">Analysis</span>
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Usernames (one per line)">
          <Textarea
            rows={6}
            value={usernames}
            onChange={(e) => setUsernames(e.target.value)}
            placeholder="elonmusk&#10;naval&#10;pmarca"
            className="font-mono text-sm resize-none"
            disabled={isProcessing}
          />
        </FormField>

        {/* Quick Filters */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Quick Filters
          </label>
          <QuickFilters 
            filters={filters} 
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Engagement Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Min Likes">
            <Input
              type="number"
              min="0"
              value={filters.MIN_LIKES}
              onChange={(e) => handleFilterChange('MIN_LIKES', parseInt(e.target.value) || 0)}
              disabled={isProcessing}
            />
          </FormField>
          <FormField label="Min Retweets">
            <Input
              type="number"
              min="0"
              value={filters.MIN_RETWEETS}
              onChange={(e) => handleFilterChange('MIN_RETWEETS', parseInt(e.target.value) || 0)}
              disabled={isProcessing}
            />
          </FormField>
          <FormField label="Min Comments">
            <Input
              type="number"
              min="0"
              value={filters.MIN_COMMENTS}
              onChange={(e) => handleFilterChange('MIN_COMMENTS', parseInt(e.target.value) || 0)}
              disabled={isProcessing}
            />
          </FormField>
          <FormField label="Min Total Engagement">
            <Input
              type="number"
              min="0"
              value={filters.MIN_TOTAL_ENGAGEMENT}
              onChange={(e) => handleFilterChange('MIN_TOTAL_ENGAGEMENT', parseInt(e.target.value) || 0)}
              disabled={isProcessing}
            />
          </FormField>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Start Date (optional)">
            <Input
              type="date"
              value={filters.dateRange.start || ''}
              onChange={(e) => handleDateRangeChange(e.target.value || null, filters.dateRange.end)}
              disabled={isProcessing}
            />
          </FormField>
          <FormField label="End Date (optional)">
            <Input
              type="date"
              value={filters.dateRange.end || ''}
              onChange={(e) => handleDateRangeChange(filters.dateRange.start, e.target.value || null)}
              disabled={isProcessing}
            />
          </FormField>
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={isProcessing}
          className="w-full h-12"
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            '🚀 Start Batch Analysis'
          )}
        </Button>
      </form>
    </div>
  );
}
