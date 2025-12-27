import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/electric.css';
import './styles/themes.css';
import { ThemeProvider } from './contexts/ThemeContext';
import { ComparisonProvider } from './contexts/ComparisonContext';
import Navigation from './components/Navigation';
import ScraperPage from './pages/ScraperPage';
import HistoryPage from './pages/HistoryPage';
import ScrapeDetailsPage from './pages/ScrapeDetailsPage';
import SettingsPage from './pages/SettingsPage';
import BatchScrapePage from './pages/BatchScrapePage';
import ComparisonPage from './pages/ComparisonPage';

function App() {
  return (
    <ThemeProvider>
      <ComparisonProvider>
        <BrowserRouter>
          <Navigation />
          <Routes>
            <Route path="/" element={<ScraperPage />} />
            <Route path="/batch" element={<BatchScrapePage />} />
            <Route path="/compare" element={<ComparisonPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/history/:scrapeId" element={<ScrapeDetailsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </BrowserRouter>
      </ComparisonProvider>
    </ThemeProvider>
  );
}

export default App;
