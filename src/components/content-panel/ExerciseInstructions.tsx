'use client';

import { useState } from 'react';
import ContentViewer from './ContentViewer';

export interface ExerciseInstructionsProps {
  instructions: string; // Markdown content for instructions
  referenceContent?: string; // Optional reference materials/expected output (also Markdown)
}

/**
 * ExerciseInstructions — A collapsible panel displaying exercise instructions
 * and optional reference materials above the main content area.
 *
 * Expanded by default on initial load.
 */
export default function ExerciseInstructions({
  instructions,
  referenceContent,
}: ExerciseInstructionsProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div
      className="border-b border-blue-200 bg-blue-50"
      data-testid="exercise-instructions"
    >
      {/* Collapsible header */}
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex items-center justify-between w-full px-4 py-2.5 text-left text-sm font-semibold text-blue-800 hover:bg-blue-100 transition-colors"
        aria-expanded={isExpanded}
        aria-controls="exercise-instructions-body"
        data-testid="exercise-instructions-toggle"
      >
        <span>📋 Exercise Instructions</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Collapsible body */}
      {isExpanded && (
        <div
          id="exercise-instructions-body"
          className="px-4 pb-4"
          data-testid="exercise-instructions-body"
        >
          {/* Instructions section */}
          <div className="max-h-64 overflow-y-auto" data-testid="exercise-instructions-content">
            <ContentViewer content={instructions} />
          </div>

          {/* Reference materials section */}
          {referenceContent && referenceContent.trim().length > 0 && (
            <div className="mt-3 pt-3 border-t border-blue-200" data-testid="exercise-reference-content">
              <h4 className="text-sm font-semibold text-blue-700 mb-2">
                📎 Reference / Expected Output
              </h4>
              <div className="max-h-48 overflow-y-auto">
                <ContentViewer content={referenceContent} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
