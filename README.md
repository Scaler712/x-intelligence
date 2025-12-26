# Twitter/X Scraper Dashboard

A powerful Twitter/X scraper with real-time dashboard, analytics, content analysis, and batch processing capabilities.

## Features

- 🔄 **Real-time scraping** - Watch tweets come in live with WebSocket updates
- 📊 **Advanced analytics** - Engagement metrics, posting schedules, theme extraction
- 🎣 **Hook extraction** - Extract and analyze the first lines of high-performing tweets
- 💾 **Export capabilities** - Download as CSV or export hooks as TXT files
- 📈 **Batch processing** - Scrape multiple accounts simultaneously
- 🔍 **Smart filtering** - Filter by engagement metrics, dates, and keywords
- 📚 **History** - Persist scrapes locally with IndexedDB
- 🎨 **Modern UI** - Beautiful Electric Design System with dark mode
- 🚫 **Duplicate prevention** - Automatic deduplication of tweets

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A scraper API key from [scraper.tech](https://scraper.tech/panel/playground/twitter/)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   cd x-destroyer
   ```

2. **Install server dependencies**
   ```bash
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Configure environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your scraper API key:
   ```
   SCRAPER_KEY=your_actual_api_key_here
   PORT=3001
   ```

   **Get your API key:** Visit [scraper.tech/panel/playground/twitter/](https://scraper.tech/panel/playground/twitter/) and sign up for a free API key.

## Usage

### Development Mode

1. **Start the server** (Terminal 1)
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:3001`

2. **Start the client** (Terminal 2)
   ```bash
   npm run client
   ```
   Client will run on `http://localhost:5173` (or similar)

3. **Open your browser**
   Navigate to `http://localhost:5173`

### Production Build

1. **Build the client**
   ```bash
   npm run build
   ```

2. **Start the server**
   ```bash
   npm start
   ```

## How to Use

1. **Enter a Twitter username** in the search box
2. **Set filters** (optional) - Minimum likes, retweets, comments, or total engagement
3. **Click "Start Scraping"** to begin
4. **Watch tweets** appear in real-time
5. **Switch tabs** to view:
   - **Tweets** - Full tweet list with toggle between hook/full view
   - **Hooks** - Extracted hooks sorted by engagement
   - **Analysis** - Analytics dashboard with charts and insights
6. **Export data** - Download CSV or export individual hooks as TXT files

## Features in Detail

### View Modes
- **Hook View** - See just the first 15 words + engagement metrics
- **Full View** - Complete tweet content
- Toggle between views with a single click

### Export Options
- **CSV Export** - Download all scraped tweets as CSV
- **TXT Export** - Export individual hooks with full content and metadata
- **Copy to Clipboard** - Quick copy buttons for hooks and full tweets

### Analytics
- Engagement timeline charts
- Posting schedule heatmap
- Theme extraction
- Top-performing tweets
- Hashtag analysis

### Batch Scraping
- Add multiple usernames to queue
- Process them sequentially
- Track progress for each scrape

## Configuration

Edit `server/config.js` or use environment variables:

```javascript
SCRAPER_KEY        // Your API key (REQUIRED)
PORT              // Server port (default: 3001)
TIMEOUT_MS        // Request timeout (default: 30000)
PAGE_DELAY_MS     // Delay between pages (default: 400)
MAX_PAGES         // Maximum pages to scrape (0 = unlimited)
```

## Project Structure

```
x-destroyer/
├── server/           # Backend Express server
│   ├── index.js      # Server entry point
│   ├── scraper.js    # Scraping logic
│   └── config.js     # Configuration
├── client/           # Frontend React app
│   ├── src/
│   │   ├── pages/    # Page components
│   │   ├── components/  # Reusable components
│   │   ├── utils/    # Utility functions
│   │   └── hooks/    # Custom React hooks
│   └── package.json
├── downloads/        # Scraped CSV files (gitignored)
└── .env             # Environment variables (gitignored)
```

## Troubleshooting

### "Scraper API key is not configured"
- Make sure you've created a `.env` file
- Add `SCRAPER_KEY=your_key_here` to the `.env` file
- Restart the server

### Server won't start
- Check if port 3001 is already in use
- Verify all dependencies are installed: `npm install`
- Check Node.js version: `node --version` (should be v14+)

### Client won't connect
- Make sure the server is running first
- Check the server URL in client code matches your server port
- Check browser console for WebSocket errors

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

## Credits

Built with:
- [React](https://reactjs.org/)
- [Express.js](https://expressjs.com/)
- [Socket.io](https://socket.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
