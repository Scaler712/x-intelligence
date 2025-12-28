/**
 * Storage service for cloud sync operations
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Sync local data to cloud
 * @param {string} accessToken - Access token
 * @param {Array} scrapes - Array of local scrape data
 * @returns {Promise<Object>} - Sync results
 */
export async function syncToCloud(accessToken, scrapes) {
  try {
    const response = await fetch(`${API_URL}/api/storage/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ scrapes }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Sync failed');
    }

    return data;
  } catch (error) {
    console.error('Cloud sync error:', error);
    throw error;
  }
}

/**
 * Load scrapes from cloud
 * @param {string} accessToken - Access token
 * @returns {Promise<Array>} - Array of scrapes
 */
export async function loadFromCloud(accessToken) {
  try {
    const response = await fetch(`${API_URL}/api/storage/scrapes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to load scrapes');
    }

    return data.scrapes || [];
  } catch (error) {
    console.error('Load from cloud error:', error);
    throw error;
  }
}

/**
 * Download specific scrape from cloud
 * @param {string} accessToken - Access token
 * @param {string} scrapeId - Scrape ID
 * @returns {Promise<Object>} - Scrape data
 */
export async function downloadScrapeFromCloud(accessToken, scrapeId) {
  try {
    const response = await fetch(`${API_URL}/api/storage/scrape/${scrapeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to download scrape');
    }

    return data.scrape;
  } catch (error) {
    console.error('Download scrape error:', error);
    throw error;
  }
}

/**
 * Delete scrape from cloud
 * @param {string} accessToken - Access token
 * @param {string} scrapeId - Scrape ID
 * @returns {Promise<void>}
 */
export async function deleteScrapeFromCloud(accessToken, scrapeId) {
  try {
    const response = await fetch(`${API_URL}/api/storage/scrape/${scrapeId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to delete scrape');
    }
  } catch (error) {
    console.error('Delete scrape error:', error);
    throw error;
  }
}


