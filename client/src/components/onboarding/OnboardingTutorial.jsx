import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../contexts/OnboardingContext';
import Button from '../ui/Button';

export default function OnboardingTutorial() {
  const {
    currentStep,
    isActive,
    TUTORIAL_STEPS,
    nextStep,
    completeStep,
    completeTutorial,
    setIsActive,
  } = useOnboarding();
  const location = useLocation();
  const navigate = useNavigate();
  const [highlightedElement, setHighlightedElement] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const overlayRef = useRef(null);
  const [hasSeenApiKeys, setHasSeenApiKeys] = useState(false);

  // Check for API keys being saved
  useEffect(() => {
    if (currentStep === TUTORIAL_STEPS.SETTINGS_API_KEYS && location.pathname === '/settings') {
      const checkApiKeys = () => {
        const scraperKey = localStorage.getItem('scraperApiKey');
        const apiKeysSection = document.querySelector('[data-tutorial="api-keys-section"]');
        if (scraperKey && apiKeysSection && !hasSeenApiKeys) {
          setHasSeenApiKeys(true);
          // Auto-advance after a short delay
          setTimeout(() => {
            completeStep(TUTORIAL_STEPS.SETTINGS_API_KEYS);
            nextStep();
          }, 2000);
        }
      };
      const interval = setInterval(checkApiKeys, 500);
      return () => clearInterval(interval);
    }
  }, [currentStep, location.pathname, TUTORIAL_STEPS, hasSeenApiKeys, completeStep, nextStep]);

  // Detect when scraping starts and auto-advance to scraping step
  useEffect(() => {
    if (currentStep === TUTORIAL_STEPS.SCRAPING_SETUP && location.pathname === '/') {
      // Listen for custom event from ScraperPage when scraping starts
      const handleScrapeStart = () => {
        setTimeout(() => {
          completeStep(TUTORIAL_STEPS.SCRAPING_SETUP);
          nextStep();
        }, 1000);
      };
      window.addEventListener('tutorial:scrape-started', handleScrapeStart);
      return () => window.removeEventListener('tutorial:scrape-started', handleScrapeStart);
    }
  }, [currentStep, location.pathname, TUTORIAL_STEPS, completeStep, nextStep]);

  // Detect when tweets are collected and auto-advance to post-scrape step
  useEffect(() => {
    if (currentStep === TUTORIAL_STEPS.SCRAPING_IN_PROGRESS && location.pathname === '/') {
      const checkForTweets = () => {
        const tweetList = document.querySelector('[data-tutorial="tweet-list"]');
        const hasTweets = tweetList && tweetList.querySelectorAll('[data-tweet-index]').length > 0;
        if (hasTweets) {
          setTimeout(() => {
            completeStep(TUTORIAL_STEPS.SCRAPING_IN_PROGRESS);
            nextStep();
          }, 3000); // Give user time to see tweets coming in
        }
      };
      const interval = setInterval(checkForTweets, 1000);
      return () => clearInterval(interval);
    }
  }, [currentStep, location.pathname, TUTORIAL_STEPS, completeStep, nextStep]);

  // Step configurations
  const stepConfigs = {
    [TUTORIAL_STEPS.SETTINGS_API_KEYS]: {
      title: 'Welcome to X Intelligence! 🎉',
      description: 'Let\'s get you set up. First, configure your API keys:\n\n1. Scraper API Key - Required for scraping (get it from scraper.tech)\n2. AI API Keys (Optional) - OpenAI or Anthropic keys for AI insights\n\nOnce you save at least the Scraper API Key, we\'ll continue!',
      targetSelector: '[data-tutorial="api-keys-section"]',
      route: '/settings',
      actionText: 'Go to Settings',
      onAction: () => navigate('/settings'),
      canProceed: () => {
        const scraperKey = localStorage.getItem('scraperApiKey');
        return location.pathname === '/settings' && !!scraperKey;
      },
    },
    [TUTORIAL_STEPS.DASHBOARD_OVERVIEW]: {
      title: 'Dashboard Overview 📊',
      description: 'This is your main dashboard where you\'ll analyze X/Twitter profiles.\n\nHere you can:\n• Enter a username to analyze\n• Set engagement filters (likes, retweets, comments)\n• Start scraping and view real-time results\n• Analyze collected tweets with advanced tools',
      targetSelector: null,
      route: '/',
      actionText: 'Got it!',
      onAction: () => {},
      canProceed: () => location.pathname === '/',
    },
    [TUTORIAL_STEPS.SCRAPING_SETUP]: {
      title: 'Start Your First Scrape 🚀',
      description: 'Ready to collect tweets? Here\'s how:\n\n1. Enter a username (without @) in the field below\n2. Set filters (optional) - Minimum likes, retweets, comments, or total engagement\n3. Click "Start Analysis" to begin scraping\n\nThe system will collect tweets that match your criteria in real-time!',
      targetSelector: '[data-tutorial="username-input"]',
      route: '/',
      actionText: 'I\'m Ready!',
      onAction: () => {},
      canProceed: () => {
        const input = document.querySelector('[data-tutorial="username-input"]');
        return input && location.pathname === '/';
      },
    },
    [TUTORIAL_STEPS.SCRAPING_IN_PROGRESS]: {
      title: 'Scraping in Progress ⚡',
      description: 'Great! Your scrape is running. Watch as tweets are collected in real-time!\n\nWhile scraping:\n• Pause/Resume - Control the scraping process\n• View Statistics - See engagement metrics as they update\n• Real-time Results - Tweets appear as they\'re collected\n\nOnce you have some tweets, we\'ll show you what to do next!',
      targetSelector: '[data-tutorial="tweet-list"]',
      route: '/',
      actionText: 'Continue',
      onAction: () => {},
      canProceed: () => {
        const tweetList = document.querySelector('[data-tutorial="tweet-list"]');
        const hasTweets = tweetList && tweetList.querySelectorAll('[data-tweet-index]').length > 0;
        return hasTweets && location.pathname === '/';
      },
    },
    [TUTORIAL_STEPS.POST_SCRAPE_ACTIONS]: {
      title: 'What Can You Do Now? 🎯',
      description: 'Excellent! You\'ve collected tweets. Here\'s what you can do:\n\n📊 View & Analyze:\n• Tweets Tab - See all collected tweets with engagement metrics\n• Hooks Tab - View extracted hooks (first lines) for quick scanning\n• Analysis Tab - Get AI-powered insights (if you added AI API keys)\n\n📥 Export Your Data:\n• Export as JSON, CSV, PDF, or Excel\n• All exports include full tweet data and analytics\n\n📈 Advanced Features:\n• Compare multiple scrapes side-by-side\n• View detailed statistics and engagement trends\n• Access your scrape history anytime',
      targetSelector: '[data-tutorial="tabs"]',
      route: '/',
      actionText: 'Finish Tutorial',
      onAction: () => completeTutorial(),
      canProceed: () => location.pathname === '/',
    },
  };

  const currentConfig = stepConfigs[currentStep];

  // Navigate to required route if needed
  useEffect(() => {
    if (isActive && currentConfig && currentConfig.route && location.pathname !== currentConfig.route) {
      navigate(currentConfig.route);
    }
  }, [isActive, currentStep, location.pathname, navigate, currentConfig]);

  // Update highlight position
  useEffect(() => {
    if (!isActive || !currentStep || !currentConfig) return;

    const updateHighlight = () => {
      if (currentConfig.targetSelector) {
        const element = document.querySelector(currentConfig.targetSelector);
        if (element) {
          setHighlightedElement(element);
          const rect = element.getBoundingClientRect();
          setTooltipPosition({
            top: rect.bottom + window.scrollY + 20,
            left: rect.left + window.scrollX + rect.width / 2,
          });
        } else {
          setHighlightedElement(null);
        }
      } else {
        setHighlightedElement(null);
        // Center tooltip if no target
        setTooltipPosition({
          top: window.innerHeight / 2 + window.scrollY,
          left: window.innerWidth / 2,
        });
      }
    };

    updateHighlight();
    window.addEventListener('resize', updateHighlight);
    window.addEventListener('scroll', updateHighlight);

    // Check periodically for element
    const interval = setInterval(updateHighlight, 500);

    return () => {
      window.removeEventListener('resize', updateHighlight);
      window.removeEventListener('scroll', updateHighlight);
      clearInterval(interval);
    };
  }, [isActive, currentStep, currentConfig]);

  if (!isActive || !currentStep || !currentConfig) {
    return null;
  }

  const handleNext = () => {
    if (currentConfig.onAction) {
      currentConfig.onAction();
    }
    // Small delay to allow navigation/action to complete
    setTimeout(() => {
      if (currentStep === TUTORIAL_STEPS.POST_SCRAPE_ACTIONS) {
        completeTutorial();
      } else {
        nextStep();
      }
    }, 300);
  };

  const handleSkip = () => {
    if (window.confirm('Are you sure you want to skip the tutorial? You can restart it anytime from Settings.')) {
      completeTutorial();
    }
  };

  // Calculate highlight box position
  let highlightBox = null;
  if (highlightedElement) {
    const rect = highlightedElement.getBoundingClientRect();
    highlightBox = {
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: rect.height,
    };
  }

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[9998] pointer-events-auto"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
        }}
      >
        {/* Highlight cutout */}
        {highlightBox && (
          <div
            className="absolute border-4 border-blue-500 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.75)] pointer-events-none"
            style={{
              top: `${highlightBox.top}px`,
              left: `${highlightBox.left}px`,
              width: `${highlightBox.width}px`,
              height: `${highlightBox.height}px`,
              boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.75), 0 0 20px rgba(59, 130, 246, 0.5)`,
            }}
          />
        )}
      </div>

      {/* Tooltip */}
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            top: highlightedElement
              ? `${Math.min(tooltipPosition.top, window.innerHeight - 300)}px`
              : `${tooltipPosition.top - 150}px`,
            left: highlightedElement
              ? `${Math.max(200, Math.min(tooltipPosition.left, window.innerWidth - 200))}px`
              : `${tooltipPosition.left - 200}px`,
            transform: highlightedElement
              ? 'translateX(-50%)'
              : 'translate(-50%, -50%)',
            maxWidth: '90vw',
          }}
        >
        <div className="bg-[#1a1a1a] border-2 border-[#2563eb] rounded-lg p-6 shadow-2xl max-w-md pointer-events-auto">
          {/* Step indicator */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {Object.keys(stepConfigs).indexOf(currentStep) + 1}
              </div>
              <span className="text-xs text-gray-400">
                Step {Object.keys(stepConfigs).indexOf(currentStep) + 1} of {Object.keys(stepConfigs).length}
              </span>
            </div>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-300 text-sm"
            >
              Skip
            </button>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-100 mb-2">
            {currentConfig.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-400 mb-6 whitespace-pre-line">
            {currentConfig.description}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={handleNext}
              className="flex-1"
            >
              {currentConfig.actionText}
            </Button>
          </div>
        </div>

        {/* Arrow pointing to element */}
        {highlightedElement && (
          <div
            className="absolute w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-blue-500"
            style={{
              top: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />
        )}
      </div>
    </>
  );
}

