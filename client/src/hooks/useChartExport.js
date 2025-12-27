import { useCallback } from 'react';
import { toPng, toSvg } from 'html-to-image';

/**
 * Hook for exporting charts as images
 */
export function useChartExport() {
  const exportToPng = useCallback(async (elementRef, filename = 'chart') => {
    if (!elementRef.current) {
      console.error('Element reference is null');
      return;
    }

    try {
      const dataUrl = await toPng(elementRef.current, {
        backgroundColor: '#0a0a0a',
        quality: 1.0,
        pixelRatio: 2,
      });

      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error exporting to PNG:', error);
    }
  }, []);

  const exportToSvg = useCallback(async (elementRef, filename = 'chart') => {
    if (!elementRef.current) {
      console.error('Element reference is null');
      return;
    }

    try {
      const dataUrl = await toSvg(elementRef.current, {
        backgroundColor: '#0a0a0a',
      });

      const link = document.createElement('a');
      link.download = `${filename}.svg`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error exporting to SVG:', error);
    }
  }, []);

  return {
    exportToPng,
    exportToSvg,
  };
}
