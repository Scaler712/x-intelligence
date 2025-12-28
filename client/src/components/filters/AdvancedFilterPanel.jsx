import Button from '../ui/Button';

export default function AdvancedFilterPanel({ filters, onFilterChange, onDateRangeChange, onReset }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-100">Advanced Filters</h4>
        <Button
          variant="secondary"
          onClick={onReset}
          className="text-xs h-8 px-3"
        >
          Reset
        </Button>
      </div>

      {/* Add advanced filter inputs here if needed */}
    </div>
  );
}
