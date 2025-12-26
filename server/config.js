// Server configuration
require('dotenv').config();

const config = {
  SCRAPER_KEY: process.env.SCRAPER_KEY || "",
  BASE_URL: "https://api.scraper.tech/timeline.php",
  TIMEOUT_MS: 30_000,
  PAGE_DELAY_MS: 400,
  MAX_PAGES: 0,
  RETRIES: 3,
  RETRY_BACKOFF_MS: 1200,
  MAX_SAME_CURSOR: 10,
  PORT: process.env.PORT || 3001,
};

module.exports = config;

