import { useState } from 'react';
import { useExport } from '../../hooks/useExport';

export default function ExportMenu({ tweets, username = 'tweets' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { exportJSON, exportCSV, exportMarkdown, exportExcel, exportPDF } = useExport();

  const handleExport = async (exportFn, format) => {
    try {
      setIsExporting(true);
      await exportFn(tweets, username);
      setIsOpen(false);
    } catch (error) {
      console.error(`Export as ${format} failed:`, error);
      alert(`Failed to export as ${format}. Please try again.`);
    } finally {
      setIsExporting(false);
    }
  };

  if (!tweets || tweets.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="bg-electric-dark border border-electric-border hover:border-electric-lime text-electric-text px-4 py-2 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
      >
        <span>📥</span>
        <span>Export</span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-electric-dark border border-electric-border rounded-lg shadow-lg z-50">
          <div className="py-2">
            <button
              onClick={() => handleExport(exportJSON, 'JSON')}
              disabled={isExporting}
              className="w-full text-left px-4 py-2 text-electric-text hover:bg-electric-muted transition-colors disabled:opacity-50 flex items-center gap-3"
            >
              <span>📄</span>
              <div>
                <div className="font-medium">Export as JSON</div>
                <div className="text-xs text-electric-text-muted">Raw data format</div>
              </div>
            </button>

            <button
              onClick={() => handleExport(exportCSV, 'CSV')}
              disabled={isExporting}
              className="w-full text-left px-4 py-2 text-electric-text hover:bg-electric-muted transition-colors disabled:opacity-50 flex items-center gap-3"
            >
              <span>📊</span>
              <div>
                <div className="font-medium">Export as CSV</div>
                <div className="text-xs text-electric-text-muted">Spreadsheet format</div>
              </div>
            </button>

            <button
              onClick={() => handleExport(exportMarkdown, 'Markdown')}
              disabled={isExporting}
              className="w-full text-left px-4 py-2 text-electric-text hover:bg-electric-muted transition-colors disabled:opacity-50 flex items-center gap-3"
            >
              <span>📝</span>
              <div>
                <div className="font-medium">Export as Markdown</div>
                <div className="text-xs text-electric-text-muted">Readable text format</div>
              </div>
            </button>

            <div className="border-t border-electric-border my-1" />

            <button
              onClick={() => handleExport(exportExcel, 'Excel')}
              disabled={isExporting}
              className="w-full text-left px-4 py-2 text-electric-text hover:bg-electric-muted transition-colors disabled:opacity-50 flex items-center gap-3"
            >
              <span>📈</span>
              <div>
                <div className="font-medium">Export as Excel</div>
                <div className="text-xs text-electric-text-muted">Professional report</div>
              </div>
            </button>

            <button
              onClick={() => handleExport(exportPDF, 'PDF')}
              disabled={isExporting}
              className="w-full text-left px-4 py-2 text-electric-text hover:bg-electric-muted transition-colors disabled:opacity-50 flex items-center gap-3"
            >
              <span>📑</span>
              <div>
                <div className="font-medium">Export as PDF</div>
                <div className="text-xs text-electric-text-muted">Printable report</div>
              </div>
            </button>
          </div>

          {isExporting && (
            <div className="px-4 py-2 border-t border-electric-border">
              <div className="text-sm text-electric-text-muted">Generating export...</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
