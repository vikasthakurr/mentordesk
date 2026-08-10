'use client';

import { useState, useEffect, useCallback } from 'react';

interface TourStep {
  target: string; // CSS selector
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    target: 'nav[aria-label="Topic Navigator"]',
    title: 'Topic Navigator',
    description: 'Browse all topics organized by Part and Module. Click to expand sections and select a topic to start learning.',
    position: 'right',
  },
  {
    target: '[data-testid="content-panel"] header',
    title: 'Topic Header',
    description: 'Shows the current topic name with breadcrumb. Use the arrows to navigate between topics, or toggle the sidebar.',
    position: 'bottom',
  },
  {
    target: '[data-testid="content-panel"] .flex.border-b',
    title: 'Code Editor & Drawing Board',
    description: 'Switch between Code Editor (write HTML/CSS/JS/TS), Drawing Board (sketch diagrams), and Node.js sandbox.',
    position: 'bottom',
  },
  {
    target: '.bg-gray-900.border-b.border-gray-700',
    title: 'File Tabs',
    description: 'Switch between index.html, style.css, script.js, and app.ts files. Your code is auto-saved per topic.',
    position: 'bottom',
  },
  {
    target: 'iframe[title="Live Preview"]',
    title: 'Live Preview',
    description: 'See your HTML/CSS/JS output live as you type. Console logs appear below the preview.',
    position: 'left',
  },
  {
    target: '[data-testid="mark-completed-button"]',
    title: 'Track Progress',
    description: 'Mark topics as completed to track your learning progress. Your progress is saved per batch.',
    position: 'bottom',
  },
  {
    target: '[data-testid="content-panel"]',
    title: 'Batch System',
    description: 'Switch between batches in the left sidebar. Each batch has separate progress and code.',
    position: 'bottom',
  },
];

const TOUR_KEY_PREFIX = 'mern-platform:tour-completed:';

export default function TourGuide() {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });

  // Check if tour was already completed for this batch
  useEffect(() => {
    const batch = localStorage.getItem('mern-platform:current-batch') || 'default';
    const key = TOUR_KEY_PREFIX + batch;
    if (!localStorage.getItem(key)) {
      // First time in this batch - show tour after a short delay
      const timer = setTimeout(() => setIsActive(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Position the highlight around the target element
  useEffect(() => {
    if (!isActive) return;

    const step = TOUR_STEPS[currentStep];
    const el = document.querySelector(step.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      setPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      });
    } else {
      // Element not found - skip to next step
      if (currentStep < TOUR_STEPS.length - 1) {
        setCurrentStep(s => s + 1);
      } else {
        completeTour();
      }
    }
  }, [isActive, currentStep]);

  const handleNext = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      completeTour();
    }
  }, [currentStep]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
    }
  }, [currentStep]);

  const completeTour = useCallback(() => {
    setIsActive(false);
    const batch = localStorage.getItem('mern-platform:current-batch') || 'default';
    localStorage.setItem(TOUR_KEY_PREFIX + batch, '1');
  }, []);

  const handleSkip = useCallback(() => {
    completeTour();
  }, [completeTour]);

  if (!isActive) return null;

  const step = TOUR_STEPS[currentStep];

  // Calculate tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    const padding = 12;
    switch (step.position) {
      case 'right':
        return { top: position.top + position.height / 2 - 60, left: position.left + position.width + padding };
      case 'left':
        return { top: position.top + position.height / 2 - 60, right: window.innerWidth - position.left + padding };
      case 'bottom':
        return { top: position.top + position.height + padding, left: Math.max(16, position.left) };
      case 'top':
        return { bottom: window.innerHeight - position.top + padding, left: Math.max(16, position.left) };
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[9998] pointer-events-none">
        {/* Dark backdrop with cutout */}
        <div className="absolute inset-0 bg-black/60" />
        {/* Highlight cutout */}
        <div
          className="absolute border-2 border-blue-400 rounded-lg bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]"
          style={{
            top: position.top - 4,
            left: position.left - 4,
            width: position.width + 8,
            height: position.height + 8,
          }}
        />
      </div>

      {/* Tooltip */}
      <div
        className="fixed z-[9999] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-5 max-w-sm"
        style={getTooltipStyle()}
      >
        {/* Step counter */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Step {currentStep + 1} of {TOUR_STEPS.length}
          </span>
          <button
            onClick={handleSkip}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            Skip tour
          </button>
        </div>

        {/* Content */}
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
          {step.title}
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {step.description}
        </p>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <div className="flex gap-1">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${i === currentStep ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
              />
            ))}
          </div>
          <button
            onClick={handleNext}
            className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-500"
          >
            {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </>
  );
}
