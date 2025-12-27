const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const config = require("./config");
const { scrapeTimeline } = require("./scraper");
const exportRoutes = require("./routes/export");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for export requests

// Serve static files from downloads directory
app.use("/api/download", express.static(path.join(__dirname, "../downloads")));

// Mount export routes
app.use("/api/export", exportRoutes);

// Download endpoint
app.get("/api/download/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "../downloads", filename);
  
  if (fs.existsSync(filePath)) {
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error("Download error:", err);
        res.status(500).json({ error: "Failed to download file" });
      }
    });
  } else {
    res.status(404).json({ error: "File not found" });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Store pause state per socket
const pauseStates = new Map();

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  pauseStates.set(socket.id, false);

  socket.on("scrape:start", async (data) => {
    const { username, filters = {} } = data;
    
    if (!username) {
      socket.emit("scrape:error", { message: "Username is required" });
      return;
    }

    // Validate scraper key
    if (!config.SCRAPER_KEY || config.SCRAPER_KEY.trim() === '') {
      socket.emit("scrape:error", { 
        message: "Scraper API key is not configured. Please set SCRAPER_KEY in your .env file or environment variables. Get your API key from https://scraper.tech/panel/playground/twitter/" 
      });
      return;
    }

    // Ensure downloads directory exists
    const downloadsDir = path.join(__dirname, "../downloads");
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${username}_${timestamp}.csv`;
    const outputPath = path.join(downloadsDir, filename);

    // Default filter values (0 means no filter)
    const filterConfig = {
      MIN_LIKES: filters.MIN_LIKES || 0,
      MIN_RETWEETS: filters.MIN_RETWEETS || 0,
      MIN_COMMENTS: filters.MIN_COMMENTS || 0,
      MIN_TOTAL_ENGAGEMENT: filters.MIN_TOTAL_ENGAGEMENT || 0,
      dateRange: filters.dateRange || null,
      excludeRetweets: filters.excludeRetweets || false,
      excludeReplies: filters.excludeReplies || false,
      mediaOnly: filters.mediaOnly || false,
      language: filters.language || 'all',
      maxTweets: filters.maxTweets || 0,
    };

    try {
      const scrapeConfig = {
        screenName: username,
        scraperKey: config.SCRAPER_KEY,
        baseUrl: config.BASE_URL,
        timeout: config.TIMEOUT_MS,
        pageDelay: config.PAGE_DELAY_MS,
        maxPages: config.MAX_PAGES,
        retries: config.RETRIES,
        retryBackoff: config.RETRY_BACKOFF_MS,
        maxSameCursor: config.MAX_SAME_CURSOR,
        outputPath: outputPath
      };

      // Progress callback
      const onProgress = (progress) => {
        socket.emit("scrape:progress", progress);
      };

      // Pause check function
      const pauseCheck = () => {
        return pauseStates.get(socket.id) || false;
      };

      // Start scraping
      socket.emit("scrape:started", { username, filename });

      const result = await scrapeTimeline(scrapeConfig, filterConfig, onProgress, pauseCheck);

      socket.emit("scrape:complete", {
        filename: result.filename,
        total: result.total,
        filtered: result.filtered
      });

    } catch (error) {
      console.error("Scraping error:", error);
      socket.emit("scrape:error", {
        message: error.message || "An error occurred during scraping"
      });
    }
  });

  // Pause scraping
  socket.on("scrape:pause", () => {
    pauseStates.set(socket.id, true);
    socket.emit("scrape:paused");
    console.log(`Scraping paused for client ${socket.id}`);
  });

  // Resume scraping
  socket.on("scrape:resume", () => {
    pauseStates.set(socket.id, false);
    socket.emit("scrape:resumed");
    console.log(`Scraping resumed for client ${socket.id}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    pauseStates.delete(socket.id);
  });
});

const PORT = config.PORT;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

