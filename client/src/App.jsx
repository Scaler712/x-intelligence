import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ComparisonProvider } from './contexts/ComparisonContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
import AppShell from './components/layout/AppShell';
import Sidebar from './components/Sidebar';
import OnboardingTutorial from './components/onboarding/OnboardingTutorial';
import ScraperPage from './pages/ScraperPage';
import HistoryPage from './pages/HistoryPage';
import ScrapeDetailsPage from './pages/ScrapeDetailsPage';
import SettingsPage from './pages/SettingsPage';
import BatchScrapePage from './pages/BatchScrapePage';
import ComparisonPage from './pages/ComparisonPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// ProtectedRoute component to guard routes
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center font-light">
        Loading authentication...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppContent() {
  const { user, loading } = useAuth();

  // Wait for auth to load before rendering routes
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center font-light">
        Loading authentication...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <AppShell sidebar={<Sidebar />}>
      <OnboardingTutorial />
      <Routes>
        <Route path="/" element={<ProtectedRoute><ScraperPage /></ProtectedRoute>} />
        <Route path="/batch" element={<ProtectedRoute><BatchScrapePage /></ProtectedRoute>} />
        <Route path="/compare" element={<ProtectedRoute><ComparisonPage /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
        <Route path="/history/:scrapeId" element={<ProtectedRoute><ScrapeDetailsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

function App() {
  return (
    <AuthProvider>
      <OnboardingProvider>
        <ComparisonProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </ComparisonProvider>
      </OnboardingProvider>
    </AuthProvider>
  );
}

export default App;
