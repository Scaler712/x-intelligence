import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from '../components/layout/PageHeader';
import FormField from '../components/ui/FormField';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Divider from '../components/ui/Divider';
import aiService from '../services/aiService';

export default function SettingsPage() {
  const { user, session } = useAuth();
  const [scraperApiKey, setScraperApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [openaiKey, setOpenaiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiKeySaved, setAiKeySaved] = useState(false);
  const [aiError, setAiError] = useState(null);

  useEffect(() => {
    const loadScraperKey = () => {
      const savedKey = localStorage.getItem('scraperApiKey') || '';
      setScraperApiKey(savedKey);
    };
    loadScraperKey();
  }, []);

  useEffect(() => {
    if (user && session?.access_token) {
      loadAIKeys();
    } else {
      setApiKeys([]);
    }
  }, [user, session?.access_token]);

  const loadAIKeys = async () => {
    setLoading(true);
    setAiError(null);
    try {
      const { apiKeys: fetchedKeys } = await aiService.getApiKeys(session.access_token);
      setApiKeys(fetchedKeys);
      const openai = fetchedKeys.find(k => k.provider === 'openai');
      const anthropic = fetchedKeys.find(k => k.provider === 'anthropic');
      if (openai) setOpenaiKey('********');
      if (anthropic) setAnthropicKey('********');
    } catch (error) {
      console.error('Error loading API keys:', error);
      setAiError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAIKey = async (provider, key) => {
    if (key === '********') return;
    setLoading(true);
    setAiError(null);
    setAiKeySaved(false);
    try {
      await aiService.saveApiKey(session.access_token, provider, key);
      setAiKeySaved(true);
      await loadAIKeys();
      if (provider === 'openai') setOpenaiKey('');
      if (provider === 'anthropic') setAnthropicKey('');
      setTimeout(() => setAiKeySaved(false), 3000);
    } catch (error) {
      console.error('Error saving API key:', error);
      setAiError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAIKey = async (keyId) => {
    if (!window.confirm('Are you sure you want to delete this API key?')) return;
    setLoading(true);
    setAiError(null);
    try {
      await aiService.deleteApiKey(session.access_token, keyId);
      await loadAIKeys();
    } catch (error) {
      console.error('Error deleting API key:', error);
      setAiError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    const trimmedKey = scraperApiKey.trim();
    if (trimmedKey) {
      localStorage.setItem('scraperApiKey', trimmedKey);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      localStorage.removeItem('scraperApiKey');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear the API key?')) {
      setScraperApiKey('');
      localStorage.removeItem('scraperApiKey');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        breadcrumbs={['Home', 'Settings']}
        title="Settings"
        subtitle="Configure API keys and preferences"
      />

      <div className="px-8 py-8">
        <div className="space-y-12">
          {/* API Configuration Section */}
          <section className="space-y-6" data-tutorial="api-keys-section">
            <h2 className="text-xl font-light text-foreground tracking-tight">API Configuration</h2>
            
            <FormField label="Scraper API Key">
              <p className="text-sm text-muted-foreground mb-4 font-light">
                Enter your API key to enable analysis. Get your API key from{' '}
                <a 
                  href="https://scraper.tech/panel/playground/twitter/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="glass-accent hover:opacity-80 underline"
                >
                  scraper.tech
                </a>
              </p>
              <Input
                type="password"
                value={scraperApiKey}
                onChange={(e) => setScraperApiKey(e.target.value)}
                placeholder="Enter your API key"
                className="font-mono"
              />
              <p className="mt-2 text-xs text-muted-foreground font-light">
                Your API key is stored locally in your browser and sent to the server only when analyzing.
              </p>
              {scraperApiKey && (
                <p className="mt-1 text-xs glass-accent font-light">
                  API key is saved ({scraperApiKey.length} characters)
                </p>
              )}
            </FormField>

            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={handleSave}
                className="h-11"
              >
                {saved ? 'Saved' : 'Save API Key'}
              </Button>
              <Button
                variant="secondary"
                onClick={handleClear}
                className="h-11"
              >
                Clear
              </Button>
            </div>
          </section>

          <Divider />

          {/* AI API Keys Section */}
          <section className="space-y-6">
            <h2 className="text-xl font-light text-foreground tracking-tight">AI API Keys</h2>
            <p className="text-sm text-muted-foreground font-light">
              Add your OpenAI or Anthropic API keys to enable AI-powered recommendations and insights. Keys are encrypted and stored securely.
            </p>

            <FormField label="OpenAI API Key">
              <div className="flex gap-2">
                <Input
                  type="password"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="sk-..."
                  className="font-mono flex-1"
                />
                <Button
                  variant="primary"
                  onClick={() => handleSaveAIKey('openai', openaiKey)}
                  disabled={loading || !openaiKey.trim() || openaiKey === '********'}
                  className="h-11 px-6"
                >
                  Save
                </Button>
              </div>
              {apiKeys.find(k => k.provider === 'openai') && (
                <p className="mt-2 text-xs glass-accent font-light">
                  OpenAI key configured
                </p>
              )}
            </FormField>

            <FormField label="Anthropic (Claude) API Key">
              <div className="flex gap-2">
                <Input
                  type="password"
                  value={anthropicKey}
                  onChange={(e) => setAnthropicKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="font-mono flex-1"
                />
                <Button
                  variant="primary"
                  onClick={() => handleSaveAIKey('anthropic', anthropicKey)}
                  disabled={loading || !anthropicKey.trim() || anthropicKey === '********'}
                  className="h-11 px-6"
                >
                  Save
                </Button>
              </div>
              {apiKeys.find(k => k.provider === 'anthropic') && (
                <p className="mt-2 text-xs glass-accent font-light">
                  Anthropic key configured
                </p>
              )}
            </FormField>

            {aiKeySaved && (
              <div className="liquid-glass p-4 border-glass-border text-foreground text-sm font-light">
                API key saved successfully
              </div>
            )}

            {aiError && (
              <div className="liquid-glass p-4 border-destructive/30 text-destructive text-sm font-light">
                {aiError}
              </div>
            )}

            {/* List configured keys */}
            {apiKeys.length > 0 && (
              <div className="mt-6 pt-6 border-t border-glass-border">
                <h3 className="text-sm font-light text-foreground mb-4">Configured Keys</h3>
                <div className="space-y-2">
                  {apiKeys.map((key) => (
                    <div key={key.id} className="liquid-glass flex items-center justify-between p-4">
                      <div>
                        <span className="text-sm text-foreground font-light capitalize">{key.provider}</span>
                        <span className="text-xs text-muted-foreground ml-3 font-light">
                          Added {new Date(key.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteAIKey(key.id)}
                        className="h-9 px-4"
                      >
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <Divider />

          {/* About Section */}
          <section className="space-y-4">
            <h2 className="text-xl font-light text-foreground tracking-tight">About</h2>
            <div className="space-y-2 text-sm text-muted-foreground font-light">
              <p>
                <strong className="text-foreground font-light">X Intelligence</strong> - Analyze and collect X/Twitter data with advanced filtering and analytics.
              </p>
              <p>
                All collected data is stored securely in the cloud. Your data is private and accessible only to you.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
