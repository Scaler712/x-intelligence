const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const config = require("./config");
const { scrapeTimeline } = require("./scraper");
const exportRoutes = require("./routes/export");
const authRoutes = require("./routes/auth");
const storageRoutes = require("./routes/storage");
const apiKeysRoutes = require("./routes/apiKeys");
const aiRoutes = require("./routes/ai");
const { supabaseAdmin } = require("./services/supabaseClient");
const storageService = require("./services/storageService");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173", // Vite dev server
      "http://localhost:3000",
      process.env.FRONTEND_URL,
      // Allow all origins in development, restrict in production
      ...(process.env.NODE_ENV === 'development' ? ["*"] : [])
    ].filter(Boolean),
    methods: ["GET", "POST"],
    credentials: true
  }
});

// CORS configuration - allow all origins for now, with credentials
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type']
}));

// Handle OPTIONS preflight requests explicitly
app.options('*', cors());

app.use(express.json({ limit: '50mb' })); // Increase limit for export requests
app.use(express.urlencoded({ extended: true })); // Support URL-encoded bodies

// Mount API routes FIRST (before static file serving)
app.use("/api/auth", authRoutes);
app.use("/api/storage", storageRoutes);
app.use("/api/api-keys", apiKeysRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/export", exportRoutes);

// Serve static files from downloads directory (after API routes)
app.use("/api/download", express.static(path.join(__dirname, "../downloads")));

// Serve static files from downloads directory (after API routes)
app.use("/api/download", express.static(path.join(__dirname, "../downloads")));

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

// Store pause state and user association per socket
const pauseStates = new Map();
const socketUsers = new Map(); // socket.id -> userId

// Socket.io authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
    
    if (!token) {
      // Allow connection but mark as unauthenticated
      // Authentication will be required for scrape:start
      socket.userId = null;
      return next();
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      // Allow connection but mark as unauthenticated
      socket.userId = null;
      return next();
    }

    // Attach user ID to socket
    socket.userId = user.id;
    socketUsers.set(socket.id, user.id);
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    // Allow connection but mark as unauthenticated
    socket.userId = null;
    next();
  }
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  pauseStates.set(socket.id, false);

  socket.on("scrape:start", async (data) => {
    const { username, filters = {}, apiKey } = data;
    
    // Require authentication for scraping
    const userId = socket.userId || socketUsers.get(socket.id);
    if (!userId) {
      socket.emit("scrape:error", { 
        message: "Authentication required. Please log in to start scraping." 
      });
      return;
    }
    
    // Debug logging (remove in production)
    console.log('Scrape request received:', {
      username,
      userId,
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey ? apiKey.length : 0,
      apiKeyPreview: apiKey ? `${apiKey.substring(0, 10)}...` : 'none',
      hasConfigKey: !!config.SCRAPER_KEY,
      configKeyLength: config.SCRAPER_KEY ? config.SCRAPER_KEY.length : 0
    });
    
    if (!username) {
      socket.emit("scrape:error", { message: "Username is required" });
      return;
    }

    // Use API key from request, or fall back to config/env
    // Handle empty strings as null/undefined
    const providedKey = apiKey && apiKey.trim() !== '' ? apiKey.trim() : null;
    const scraperKey = providedKey || (config.SCRAPER_KEY && config.SCRAPER_KEY.trim() !== '' ? config.SCRAPER_KEY.trim() : null);
    
    // Validate scraper key
    if (!scraperKey) {
      console.error('No API key found - client provided:', !!providedKey, 'config has:', !!config.SCRAPER_KEY);
      socket.emit("scrape:error", { 
        message: "Scraper API key is required. Please configure it in Settings or set SCRAPER_KEY in your .env file. Get your API key from https://scraper.tech/panel/playground/twitter/" 
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
        scraperKey: scraperKey,
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

      // Save to database and cloud storage
      try {
        // Calculate stats
        const stats = {
          total: result.total,
          filtered: result.filtered,
          totalLikes: result.tweets.reduce((sum, t) => sum + (t.likes || 0), 0),
          totalRetweets: result.tweets.reduce((sum, t) => sum + (t.retweets || 0), 0),
          totalComments: result.tweets.reduce((sum, t) => sum + (t.comments || 0), 0),
          totalEngagement: result.tweets.reduce((sum, t) => 
            sum + (t.likes || 0) + (t.retweets || 0) + (t.comments || 0), 0
          ),
          avgEngagement: result.total > 0 
            ? Math.round(result.tweets.reduce((sum, t) => 
                sum + (t.likes || 0) + (t.retweets || 0) + (t.comments || 0), 0
              ) / result.total)
            : 0
        };

        // Create scrape record in database
        const { data: scrape, error: scrapeError } = await supabaseAdmin
          .from('scrapes')
          .insert({
            user_id: userId,
            username: username,
            stats: stats,
            filters: filterConfig,
            csv_filename: result.filename
          })
          .select()
          .single();

        if (scrapeError) {
          console.error('Error creating scrape record:', scrapeError);
          throw scrapeError;
        }

        const scrapeId = scrape.id;

        // Save tweets to database in batches
        if (result.tweets && result.tweets.length > 0) {
          // Deduplicate tweets before inserting (content + date as unique key)
          const uniqueTweets = new Map();
          result.tweets.forEach(tweet => {
            const key = `${tweet.content}|${tweet.date || ''}`;
            if (!uniqueTweets.has(key)) {
              uniqueTweets.set(key, tweet);
            } else {
              // Keep the one with higher engagement if duplicate
              const existing = uniqueTweets.get(key);
              const existingEng = (existing.likes || 0) + (existing.retweets || 0) + (existing.comments || 0);
              const newEng = (tweet.likes || 0) + (tweet.retweets || 0) + (tweet.comments || 0);
              if (newEng > existingEng) {
                uniqueTweets.set(key, tweet);
              }
            }
          });
          
          const deduplicatedTweets = Array.from(uniqueTweets.values());
          
          const tweetInserts = deduplicatedTweets.map(tweet => ({
            scrape_id: scrapeId,
            content: tweet.content,
            likes: tweet.likes || 0,
            retweets: tweet.retweets || 0,
            comments: tweet.comments || 0,
            date: tweet.date ? new Date(tweet.date).toISOString() : null
          }));

          // Insert in batches of 1000 to avoid payload limits
          const batchSize = 1000;
          for (let i = 0; i < tweetInserts.length; i += batchSize) {
            const batch = tweetInserts.slice(i, i + batchSize);
            const { error: tweetsError } = await supabaseAdmin
              .from('tweets')
              .insert(batch);

            if (tweetsError) {
              console.error(`Error inserting tweets batch ${i}-${i + batch.length}:`, tweetsError);
              // Continue with other batches even if one fails
            }
          }
          
          // Update stats with deduplicated count
          stats.total = deduplicatedTweets.length;
        }

        // Upload to cloud storage
        try {
          const scrapeData = {
            id: scrapeId,
            username: username,
            date: new Date().toISOString(),
            stats: stats,
            filters: filterConfig,
            csvFilename: result.filename,
            tweets: result.tweets
          };

          const cloudPath = await storageService.uploadScrape(userId, scrapeId, scrapeData);

          // Update scrape with cloud storage path
          await supabaseAdmin
            .from('scrapes')
            .update({ cloud_storage_path: cloudPath })
            .eq('id', scrapeId);

          console.log(`Scrape ${scrapeId} saved to database and cloud storage`);
        } catch (storageError) {
          console.error('Error uploading to cloud storage:', storageError);
          // Don't fail the request if cloud storage fails
        }

        socket.emit("scrape:complete", {
          filename: result.filename,
          total: result.total,
          filtered: result.filtered,
          scrapeId: scrapeId
        });
      } catch (dbError) {
        console.error('Error saving scrape to database:', dbError);
        // Still emit complete event with data, but log the error
        socket.emit("scrape:complete", {
          filename: result.filename,
          total: result.total,
          filtered: result.filtered,
          error: 'Failed to save to database, but scrape completed successfully'
        });
      }

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
    socketUsers.delete(socket.id);
  });
});

const PORT = config.PORT || process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`API routes available at http://0.0.0.0:${PORT}/api`);
});

