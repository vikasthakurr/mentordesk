'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  isTopicComplete,
  markTopicComplete,
  markTopicIncomplete,
} from '@/lib/progress';
import { syncProgress } from '@/lib/api-client';
import { getCurrentBatch } from '@/lib/batch';

export interface MarkAsCompletedButtonProps {
  topicSlug: string;
  onToggle?: (isComplete: boolean) => void;
}

/**
 * MarkAsCompletedButton — Toggle control for marking a topic as completed/incomplete.
 *
 * On mount, checks localStorage for the current completion state.
 * On click, toggles between completed and incomplete, persisting to localStorage.
 * Calls the optional onToggle callback so parent components can react to state changes.
 *
 * Validates: Requirements 10.1, 10.2, 10.5, 10.6
 */
export default function MarkAsCompletedButton({
  topicSlug,
  onToggle,
}: MarkAsCompletedButtonProps) {
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setCompleted(isTopicComplete(topicSlug));
  }, [topicSlug]);

  const handleToggle = useCallback(() => {
    const newState = !completed;

    if (newState) {
      const success = markTopicComplete(topicSlug);
      if (!success) {
        // Storage unavailable or quota exceeded — don't update UI state
        return;
      }
    } else {
      markTopicIncomplete(topicSlug);
    }

    setCompleted(newState);
    onToggle?.(newState);

    // Sync to MongoDB in background
    syncProgress(getCurrentBatch(), topicSlug, newState);
  }, [completed, topicSlug, onToggle]);

  return (
    <button
      onClick={handleToggle}
      aria-pressed={completed}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 hover:scale-105 active:scale-95 ${
        completed
          ? 'text-white bg-green-600 border-green-600 hover:bg-green-700'
          : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50'
      }`}
      data-testid="mark-completed-button"
    >
      {completed ? (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 animate-[icon-pop_0.35s_cubic-bezier(0.34,1.56,0.64,1)]"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          Completed
        </>
      ) : (
        'Mark as completed'
      )}
    </button>
  );
}
