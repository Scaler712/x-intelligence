/**
 * Onboarding Context
 * Manages tutorial state and progress
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const OnboardingContext = createContext(null);

const TUTORIAL_STEPS = {
  SETTINGS_API_KEYS: 'settings_api_keys',
  DASHBOARD_OVERVIEW: 'dashboard_overview',
  SCRAPING_SETUP: 'scraping_setup',
  SCRAPING_IN_PROGRESS: 'scraping_in_progress',
  POST_SCRAPE_ACTIONS: 'post_scrape_actions',
  COMPLETED: 'completed',
};

const STORAGE_KEY = 'x_intelligence_onboarding_completed';

export function OnboardingProvider({ children }) {
  const [currentStep, setCurrentStep] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  // Check if tutorial was already completed
  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY) === 'true';
    if (!completed) {
      // Start tutorial
      setIsActive(true);
      setCurrentStep(TUTORIAL_STEPS.SETTINGS_API_KEYS);
    }
  }, []);

  const completeStep = useCallback((step) => {
    setCompletedSteps((prev) => {
      const newSet = new Set(prev);
      newSet.add(step);
      return newSet;
    });
  }, []);

  const nextStep = useCallback(() => {
    const stepOrder = [
      TUTORIAL_STEPS.SETTINGS_API_KEYS,
      TUTORIAL_STEPS.DASHBOARD_OVERVIEW,
      TUTORIAL_STEPS.SCRAPING_SETUP,
      TUTORIAL_STEPS.SCRAPING_IN_PROGRESS,
      TUTORIAL_STEPS.POST_SCRAPE_ACTIONS,
    ];

    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    } else {
      completeTutorial();
    }
  }, [currentStep]);

  const skipToStep = useCallback((step) => {
    setCurrentStep(step);
    setIsActive(true);
  }, []);

  const completeTutorial = useCallback(() => {
    setIsActive(false);
    setCurrentStep(null);
    localStorage.setItem(STORAGE_KEY, 'true');
  }, []);

  const restartTutorial = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setIsActive(true);
    setCurrentStep(TUTORIAL_STEPS.SETTINGS_API_KEYS);
    setCompletedSteps(new Set());
  }, []);

  const isStepCompleted = useCallback((step) => {
    return completedSteps.has(step);
  }, [completedSteps]);

  const value = {
    currentStep,
    isActive,
    completedSteps,
    TUTORIAL_STEPS,
    completeStep,
    nextStep,
    skipToStep,
    completeTutorial,
    restartTutorial,
    isStepCompleted,
    setIsActive,
  };

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}


