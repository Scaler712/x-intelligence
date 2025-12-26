/**
 * IndexedDB storage utilities for Twitter Scraper
 */
import { openDB } from 'idb';

const dbName = 'twitterScraperDB';
const dbVersion = 2;

/**
 * Initialize IndexedDB database
 */
export async function initDB() {
  return openDB(dbName, dbVersion, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // Store scrape metadata
      if (!db.objectStoreNames.contains('scrapes')) {
        db.createObjectStore('scrapes', { keyPath: 'id' });
      }

      // Store full tweet data
      if (!db.objectStoreNames.contains('tweets')) {
        const tweetStore = db.createObjectStore('tweets', { keyPath: 'id' });
        tweetStore.createIndex('scrapeId', 'scrapeId', { unique: false });
      }

      // NEW stores for version 2
      if (!db.objectStoreNames.contains('filterPresets')) {
        db.createObjectStore('filterPresets', { keyPath: 'id', autoIncrement: true });
      }

      if (!db.objectStoreNames.contains('schedules')) {
        const scheduleStore = db.createObjectStore('schedules', { keyPath: 'id', autoIncrement: true });
        scheduleStore.createIndex('username', 'username', { unique: false });
        scheduleStore.createIndex('nextRun', 'nextRun', { unique: false });
      }

      if (!db.objectStoreNames.contains('queue')) {
        const queueStore = db.createObjectStore('queue', { keyPath: 'id', autoIncrement: true });
        queueStore.createIndex('status', 'status', { unique: false });
      }

      if (!db.objectStoreNames.contains('aiInsights')) {
        const aiStore = db.createObjectStore('aiInsights', { keyPath: 'scrapeId' });
        aiStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      if (!db.objectStoreNames.contains('comparisons')) {
        const comparisonStore = db.createObjectStore('comparisons', { keyPath: 'id', autoIncrement: true });
        comparisonStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    },
  });
}

/**
 * Save a scrape to IndexedDB
 * @param {Object} scrapeData - Scrape data to save
 * @returns {Promise<number>} - The scrape ID
 */
export async function saveScrape(scrapeData) {
  const db = await initDB();
  const scrapeId = scrapeData.id || Date.now();
  
  const tx = db.transaction(['scrapes', 'tweets'], 'readwrite');
  
  // Save metadata
  await tx.objectStore('scrapes').put({
    id: scrapeId,
    username: scrapeData.username,
    date: scrapeData.date || new Date().toISOString(),
    stats: scrapeData.stats || {},
    filters: scrapeData.filters || {},
    csvFilename: scrapeData.csvFilename || null,
    tweetCount: scrapeData.tweets?.length || 0
  });
  
  // Save tweets with scrape ID
  if (scrapeData.tweets && scrapeData.tweets.length > 0) {
    const tweetStore = tx.objectStore('tweets');
    for (let i = 0; i < scrapeData.tweets.length; i++) {
      const tweet = scrapeData.tweets[i];
      await tweetStore.put({
        id: `${scrapeId}_${i}`,
        scrapeId: scrapeId,
        content: tweet.content || '',
        likes: tweet.likes || 0,
        retweets: tweet.retweets || 0,
        comments: tweet.comments || 0,
        date: tweet.date || ''
      });
    }
  }
  
  await tx.done;
  return scrapeId;
}

/**
 * Load a scrape by ID
 * @param {number} scrapeId - Scrape ID
 * @returns {Promise<Object>} - Full scrape data with tweets
 */
export async function loadScrape(scrapeId) {
  const db = await initDB();
  const tx = db.transaction(['scrapes', 'tweets'], 'readonly');
  
  // Load metadata
  const scrape = await tx.objectStore('scrapes').get(scrapeId);
  if (!scrape) {
    return null;
  }
  
  // Load tweets
  const tweetStore = tx.objectStore('tweets');
  const index = tweetStore.index('scrapeId');
  const tweets = await index.getAll(scrapeId);
  
  // Sort tweets by date if available
  const sortedTweets = tweets.sort((a, b) => {
    if (a.date && b.date) {
      return new Date(a.date) - new Date(b.date);
    }
    return 0;
  });
  
  return {
    ...scrape,
    tweets: sortedTweets.map(({ scrapeId, id, ...tweet }) => tweet)
  };
}

/**
 * Get all scrapes (metadata only)
 * @returns {Promise<Array>} - Array of scrape metadata sorted by date (newest first)
 */
export async function getAllScrapes() {
  const db = await initDB();
  const tx = db.transaction('scrapes', 'readonly');
  const scrapes = await tx.objectStore('scrapes').getAll();
  
  // Sort by date (newest first)
  return scrapes.sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * Delete a scrape and all associated tweets
 * @param {number} scrapeId - Scrape ID to delete
 * @returns {Promise<void>}
 */
export async function deleteScrape(scrapeId) {
  const db = await initDB();
  const tx = db.transaction(['scrapes', 'tweets'], 'readwrite');
  
  // Delete metadata
  await tx.objectStore('scrapes').delete(scrapeId);
  
  // Delete all associated tweets
  const tweetStore = tx.objectStore('tweets');
  const index = tweetStore.index('scrapeId');
  const tweets = await index.getAll(scrapeId);
  
  for (const tweet of tweets) {
    await tweetStore.delete(tweet.id);
  }
  
  await tx.done;
}

/**
 * Search scrapes by username or date range
 * @param {Object} query - Search query
 * @param {string} query.username - Username to search for (optional)
 * @param {Date} query.startDate - Start date (optional)
 * @param {Date} query.endDate - End date (optional)
 * @returns {Promise<Array>} - Filtered scrapes
 */
export async function searchScrapes(query = {}) {
  const allScrapes = await getAllScrapes();

  return allScrapes.filter(scrape => {
    // Filter by username
    if (query.username) {
      const usernameMatch = scrape.username
        .toLowerCase()
        .includes(query.username.toLowerCase());
      if (!usernameMatch) return false;
    }

    // Filter by date range
    if (query.startDate || query.endDate) {
      const scrapeDate = new Date(scrape.date);
      if (query.startDate && scrapeDate < query.startDate) return false;
      if (query.endDate && scrapeDate > query.endDate) return false;
    }

    return true;
  });
}

// ============ Settings Functions ============

/**
 * Save a setting to IndexedDB
 * @param {string} key - Setting key
 * @param {any} value - Setting value
 */
export async function saveSetting(key, value) {
  const db = await initDB();
  await db.put('settings', { key, value });
}

/**
 * Get a setting from IndexedDB
 * @param {string} key - Setting key
 * @param {any} defaultValue - Default value if setting doesn't exist
 * @returns {Promise<any>} - Setting value
 */
export async function getSetting(key, defaultValue = null) {
  const db = await initDB();
  const setting = await db.get('settings', key);
  return setting ? setting.value : defaultValue;
}

// ============ Filter Preset Functions ============

/**
 * Save a filter preset
 * @param {Object} preset - Filter preset to save
 * @returns {Promise<number>} - Preset ID
 */
export async function saveFilterPreset(preset) {
  const db = await initDB();
  const id = await db.add('filterPresets', {
    ...preset,
    createdAt: preset.createdAt || new Date().toISOString()
  });
  return id;
}

/**
 * Get all filter presets
 * @returns {Promise<Array>} - All filter presets
 */
export async function getFilterPresets() {
  const db = await initDB();
  return await db.getAll('filterPresets');
}

/**
 * Delete a filter preset
 * @param {number} id - Preset ID
 */
export async function deleteFilterPreset(id) {
  const db = await initDB();
  await db.delete('filterPresets', id);
}

// ============ Schedule Functions ============

/**
 * Save a schedule
 * @param {Object} schedule - Schedule to save
 * @returns {Promise<number>} - Schedule ID
 */
export async function saveSchedule(schedule) {
  const db = await initDB();
  const id = await db.add('schedules', {
    ...schedule,
    createdAt: schedule.createdAt || new Date().toISOString()
  });
  return id;
}

/**
 * Get all schedules
 * @returns {Promise<Array>} - All schedules
 */
export async function getSchedules() {
  const db = await initDB();
  return await db.getAll('schedules');
}

/**
 * Update a schedule
 * @param {number} id - Schedule ID
 * @param {Object} updates - Schedule updates
 */
export async function updateSchedule(id, updates) {
  const db = await initDB();
  const schedule = await db.get('schedules', id);
  if (schedule) {
    await db.put('schedules', { ...schedule, ...updates, id });
  }
}

/**
 * Delete a schedule
 * @param {number} id - Schedule ID
 */
export async function deleteSchedule(id) {
  const db = await initDB();
  await db.delete('schedules', id);
}

// ============ Queue Functions ============

/**
 * Add item to queue
 * @param {Object} item - Queue item
 * @returns {Promise<number>} - Queue item ID
 */
export async function addToQueue(item) {
  const db = await initDB();
  const id = await db.add('queue', {
    ...item,
    status: item.status || 'pending',
    addedAt: item.addedAt || new Date().toISOString()
  });
  return id;
}

/**
 * Get all queue items
 * @returns {Promise<Array>} - All queue items
 */
export async function getQueue() {
  const db = await initDB();
  return await db.getAll('queue');
}

/**
 * Update queue item status
 * @param {number} id - Queue item ID
 * @param {string} status - New status
 * @param {Object} additionalData - Additional data to update
 */
export async function updateQueueItem(id, status, additionalData = {}) {
  const db = await initDB();
  const item = await db.get('queue', id);
  if (item) {
    await db.put('queue', { ...item, status, ...additionalData, id });
  }
}

/**
 * Delete queue item
 * @param {number} id - Queue item ID
 */
export async function deleteQueueItem(id) {
  const db = await initDB();
  await db.delete('queue', id);
}

/**
 * Clear completed queue items
 */
export async function clearCompletedQueue() {
  const db = await initDB();
  const items = await db.getAll('queue');
  const completedIds = items.filter(item => item.status === 'completed').map(item => item.id);

  for (const id of completedIds) {
    await db.delete('queue', id);
  }
}

// ============ AI Insights Functions ============

/**
 * Cache AI insights
 * @param {number} scrapeId - Scrape ID
 * @param {Object} insights - AI insights data
 */
export async function cacheAIInsights(scrapeId, insights) {
  const db = await initDB();
  await db.put('aiInsights', {
    scrapeId,
    ...insights,
    timestamp: new Date().toISOString()
  });
}

/**
 * Get cached AI insights
 * @param {number} scrapeId - Scrape ID
 * @returns {Promise<Object|null>} - Cached insights or null
 */
export async function getCachedAIInsights(scrapeId) {
  const db = await initDB();
  const cached = await db.get('aiInsights', scrapeId);

  if (!cached) return null;

  // Check if cache is expired (7 days TTL)
  const cacheAge = Date.now() - new Date(cached.timestamp).getTime();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  if (cacheAge > sevenDays) {
    await db.delete('aiInsights', scrapeId);
    return null;
  }

  return cached;
}

// ============ Comparison Functions ============

/**
 * Save a comparison
 * @param {Object} comparison - Comparison data
 * @returns {Promise<number>} - Comparison ID
 */
export async function saveComparison(comparison) {
  const db = await initDB();
  const id = await db.add('comparisons', {
    ...comparison,
    createdAt: comparison.createdAt || new Date().toISOString()
  });
  return id;
}

/**
 * Get all comparisons
 * @returns {Promise<Array>} - All comparisons
 */
export async function getComparisons() {
  const db = await initDB();
  const comparisons = await db.getAll('comparisons');
  return comparisons.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Delete a comparison
 * @param {number} id - Comparison ID
 */
export async function deleteComparison(id) {
  const db = await initDB();
  await db.delete('comparisons', id);
}

