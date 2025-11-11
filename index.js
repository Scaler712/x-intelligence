// scrape_x_timeline_to_csv.js
// Usage: node scrape_x_timeline_to_csv.js
// Requires: npm i axios

const fs = require("fs");
const axios = require("axios");

// -------------------- CONFIG (constants in-file) --------------------
const CONFIG = {
  SCREEN_NAME: "USER YOU WANT TO SCRAPE HERE",
  SCRAPER_KEY: "HEY HERE",
  OUT_CSV: "name_of_file.csv",
  BASE_URL: "https://api.scraper.tech/timeline.php",
  REST_ID: "",            // keep empty unless you have one
  TIMEOUT_MS: 30_000,     // 30s per request
  PAGE_DELAY_MS: 400,     // polite delay between pages
  MAX_PAGES: 0,           // 0 = no limit
  RETRIES: 3,             // simple retry for transient errors
  RETRY_BACKOFF_MS: 1200, // backoff between retries
  MAX_SAME_CURSOR: 10,    // stop if next_cursor repeats this many times in a row
};
// -------------------------------------------------------------------

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function toISO(created_at) {
  const d = new Date(created_at);
  return isNaN(d) ? created_at : d.toISOString();
}

function csvEscape(s) {
  const str = (s ?? "").toString();
  return `"${str.replace(/"/g, '""')}"`;
}

function rowToCsv(tweet) {
  const content  = tweet.text ?? "";
  const comments = tweet.replies ?? 0;
  const likes    = tweet.favorites ?? 0;
  const retweets = tweet.retweets ?? 0;
  const dateIso  = toISO(tweet.created_at);

  return [
    csvEscape(content),
    comments,
    likes,
    retweets,
    csvEscape(dateIso),
  ].join(",") + "\n";
}

async function fetchPage(cursor) {
  const url = new URL(CONFIG.BASE_URL);
  url.searchParams.set("screenname", CONFIG.SCREEN_NAME);
  url.searchParams.set("rest_id", CONFIG.REST_ID);
  url.searchParams.set("cursor", cursor || "");

  let attempt = 0;
  while (true) {
    attempt++;
    try {
      const res = await axios.get(url.toString(), {
        headers: { "scraper-key": CONFIG.SCRAPER_KEY },
        timeout: CONFIG.TIMEOUT_MS,
      });
      return res.data;
    } catch (err) {
      if (attempt >= CONFIG.RETRIES) throw err;
      const wait = CONFIG.RETRY_BACKOFF_MS * attempt;
      console.warn(`Request failed (attempt ${attempt}/${CONFIG.RETRIES}). Retrying in ${wait}ms...`);
      await sleep(wait);
    }
  }
}

(async () => {
  const exists = fs.existsSync(CONFIG.OUT_CSV);
  const stream = fs.createWriteStream(CONFIG.OUT_CSV, { flags: "a" });
  if (!exists) {
    stream.write("tweet_content,amount_of_comments,amount_of_likes,amount_of_retweets,date_time\n");
  }

  let cursor = "";
  let page = 0;
  let total = 0;

  let sameCursorCount = 0;
  let lastCursor = "";

  while (true) {
    if (CONFIG.MAX_PAGES && page >= CONFIG.MAX_PAGES) {
      console.log(`Reached MAX_PAGES=${CONFIG.MAX_PAGES}. Stopping.`);
      break;
    }

    page += 1;
    console.log(`Fetching page ${page} (cursor="${cursor}")...`);
    const data = await fetchPage(cursor);

    const timeline = Array.isArray(data?.timeline) ? data.timeline : [];
    for (const t of timeline) {
      stream.write(rowToCsv(t));
      total += 1;
    }

    const next = (data && typeof data.next_cursor === "string") ? data.next_cursor : "";
    console.log(`  Wrote ${timeline.length} tweets from page ${page}. next_cursor="${next}"`);

    if (!next) {
      console.log(`Done (no next_cursor). Total tweets written: ${total}.`);
      break;
    }

    // ---- NEW STOP CONDITION: same cursor repeated too many times ----
    if (next === lastCursor) {
      sameCursorCount++;
      if (sameCursorCount >= CONFIG.MAX_SAME_CURSOR) {
        console.log(
          `Cursor repeated ${sameCursorCount} times in a row — stopping. Total tweets written: ${total}.`
        );
        break;
      }
    } else {
      sameCursorCount = 0;
    }

    lastCursor = next;
    cursor = next;

    if (CONFIG.PAGE_DELAY_MS > 0) {
      await sleep(CONFIG.PAGE_DELAY_MS);
    }
  }

  stream.end();
})();
