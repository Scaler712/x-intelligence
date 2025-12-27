import { useCallback } from 'react';
import { calculateEngagementStats } from '../utils/analytics';

const API_BASE_URL = 'http://localhost:3001';

/**
 * Hook for exporting data in various formats
 */
export function useExport() {
  // Helper function to trigger download
  const downloadBlob = useCallback((blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  // Helper function to download file
  const downloadFile = useCallback((content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    downloadBlob(blob, filename);
  }, [downloadBlob]);

  // Export as JSON
  const exportJSON = useCallback((tweets, username = 'tweets') => {
    const json = JSON.stringify(tweets, null, 2);
    downloadFile(json, `${username}_${Date.now()}.json`, 'application/json');
  }, [downloadFile]);

  // Export as CSV
  const exportCSV = useCallback((tweets, username = 'tweets') => {
    // CSV header
    let csv = 'Content,Likes,Retweets,Comments,Total Engagement,Date\n';

    // CSV rows
    tweets.forEach(tweet => {
      const content = (tweet.content || '').replace(/"/g, '""'); // Escape quotes
      const likes = tweet.likes || 0;
      const retweets = tweet.retweets || 0;
      const comments = tweet.comments || 0;
      const totalEngagement = likes + retweets + comments;
      const date = new Date(tweet.date).toLocaleString();

      csv += `"${content}",${likes},${retweets},${comments},${totalEngagement},"${date}"\n`;
    });

    downloadFile(csv, `${username}_${Date.now()}.csv`, 'text/csv');
  }, [downloadFile]);

  // Export as Markdown
  const exportMarkdown = useCallback((tweets, username = 'tweets') => {
    let md = `# Twitter Analytics Report for @${username}\n\n`;
    md += `Generated: ${new Date().toLocaleString()}\n\n`;
    md += `Total Tweets: ${tweets.length}\n\n`;
    md += `---\n\n`;

    // Stats
    const stats = calculateEngagementStats(tweets);
    md += `## Summary Statistics\n\n`;
    md += `- Total Likes: ${stats.totalLikes.toLocaleString()}\n`;
    md += `- Total Retweets: ${stats.totalRetweets.toLocaleString()}\n`;
    md += `- Total Comments: ${stats.totalComments.toLocaleString()}\n`;
    md += `- Total Engagement: ${stats.totalEngagement.toLocaleString()}\n`;
    md += `- Average Engagement: ${stats.avgEngagement.toLocaleString()}\n\n`;
    md += `---\n\n`;

    // Tweets
    md += `## Tweets\n\n`;
    tweets.forEach((tweet, index) => {
      const engagement = (tweet.likes || 0) + (tweet.retweets || 0) + (tweet.comments || 0);
      md += `### ${index + 1}. ${engagement.toLocaleString()} engagement\n\n`;
      md += `${tweet.content}\n\n`;
      md += `- ❤️ Likes: ${tweet.likes || 0}\n`;
      md += `- 🔄 Retweets: ${tweet.retweets || 0}\n`;
      md += `- 💬 Comments: ${tweet.comments || 0}\n`;
      md += `- 📅 Date: ${new Date(tweet.date).toLocaleString()}\n\n`;
      md += `---\n\n`;
    });

    downloadFile(md, `${username}_${Date.now()}.md`, 'text/markdown');
  }, [downloadFile]);

  // Export as Excel (calls backend API)
  const exportExcel = useCallback(async (tweets, username = 'tweets') => {
    try {
      const analytics = calculateEngagementStats(tweets);

      const response = await fetch(`${API_BASE_URL}/api/export/excel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tweets, analytics, username }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate Excel file');
      }

      const blob = await response.blob();
      downloadBlob(blob, `${username}_${Date.now()}.xlsx`);
    } catch (error) {
      console.error('Excel export error:', error);
      throw error;
    }
  }, [downloadBlob]);

  // Export as PDF (calls backend API)
  const exportPDF = useCallback(async (tweets, username = 'tweets') => {
    try {
      const analytics = calculateEngagementStats(tweets);

      const response = await fetch(`${API_BASE_URL}/api/export/pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tweets, analytics, username }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF file');
      }

      const blob = await response.blob();
      downloadBlob(blob, `${username}_${Date.now()}.pdf`);
    } catch (error) {
      console.error('PDF export error:', error);
      throw error;
    }
  }, [downloadBlob]);

  return {
    exportJSON,
    exportCSV,
    exportMarkdown,
    exportExcel,
    exportPDF,
  };
}
