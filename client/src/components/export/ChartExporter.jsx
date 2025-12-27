import { useRef } from 'react';
import { useChartExport } from '../../hooks/useChartExport';

/**
 * Export button component for charts
 * Wraps a chart component and adds export buttons
 */
export default function ChartExporter({ children, filename = 'chart' }) {
  const chartRef = useRef(null);
  const { exportToPng, exportToSvg } = useChartExport();

  return (
    <div className="relative">
      {/* Export buttons */}
      <div className="absolute top-0 right-0 z-10 flex gap-2">
        <button
          onClick={() => exportToPng(chartRef, filename)}
          className="bg-electric-dark border border-electric-border hover:border-electric-lime text-electric-text text-xs px-3 py-1.5 rounded-lg transition-all"
          title="Export as PNG"
        >
          PNG
        </button>
        <button
          onClick={() => exportToSvg(chartRef, filename)}
          className="bg-electric-dark border border-electric-border hover:border-electric-lime text-electric-text text-xs px-3 py-1.5 rounded-lg transition-all"
          title="Export as SVG"
        >
          SVG
        </button>
      </div>

      {/* Chart content */}
      <div ref={chartRef}>
        {children}
      </div>
    </div>
  );
}
