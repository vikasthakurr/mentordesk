'use client';

import { useState, useCallback, useEffect } from 'react';
import type {
  DownloadButtonProps,
  CodeTopicContent,
  ContentTopicContent,
} from '@/types';
import {
  downloadCodeFile,
  downloadMarkdownFile,
  downloadDiagramPng,
} from '@/lib/download';

/**
 * DownloadButton — Triggers file downloads based on topic type.
 *
 * - Code topics: downloads current editor content with correct language extension
 * - Content topics: downloads Markdown source as .md
 * - Diagram topics: exports diagram as PNG via Excalidraw exportToBlob API
 * - Mixed topics: treated like code topics
 *
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */
export default function DownloadButton({
  topic,
  getCurrentCode,
  getDiagramBlob,
}: DownloadButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const topicType = topic.type as string;

  const isDisabled = (() => {
    switch (topicType) {
      case 'code':
      case 'mixed': {
        if (!getCurrentCode) return true;
        const code = getCurrentCode();
        return !code || code.trim().length === 0;
      }
      case 'content': {
        const content = topic.content as ContentTopicContent;
        return !content.markdown || content.markdown.trim().length === 0;
      }
      case 'diagram': {
        return !getDiagramBlob;
      }
      default:
        return true;
    }
  })();

  const handleDownload = useCallback(async () => {
    if (isDisabled || isExporting) return;

    switch (topicType) {
      case 'code':
      case 'mixed': {
        if (!getCurrentCode) return;
        const code = getCurrentCode();
        const content = topic.content as CodeTopicContent;
        downloadCodeFile(topic.title, code, content.language);
        break;
      }
      case 'content': {
        const content = topic.content as ContentTopicContent;
        downloadMarkdownFile(topic.title, content.markdown);
        break;
      }
      case 'diagram': {
        if (!getDiagramBlob) return;
        setIsExporting(true);
        setError(null);
        try {
          const blob = await getDiagramBlob();
          downloadDiagramPng(topic.title, blob);
        } catch {
          setError('Failed to export diagram as PNG. Please try again.');
        } finally {
          setIsExporting(false);
        }
        break;
      }
      default:
        break;
    }
  }, [topic, topicType, getCurrentCode, getDiagramBlob, isDisabled, isExporting]);

  // Auto-dismiss error after 3 seconds
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 3000);
    return () => clearTimeout(timer);
  }, [error]);

  return (
    <div className="relative inline-block">
      <button
        onClick={handleDownload}
        disabled={isDisabled || isExporting}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors ${
          isDisabled || isExporting
            ? 'text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed opacity-50'
            : 'text-gray-700 bg-gray-100 border-gray-300 hover:bg-gray-200'
        }`}
        aria-label={`Download ${topic.title}`}
        data-testid="download-button"
      >
        {isExporting ? (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            data-testid="loading-spinner"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        )}
        {isExporting ? 'Exporting...' : 'Download'}
      </button>

      {/* Error notification toast */}
      {error && (
        <div
          className="absolute top-full right-0 mt-2 w-64 p-3 bg-red-50 border border-red-200 rounded-md shadow-lg text-sm text-red-700 z-50"
          role="alert"
          data-testid="download-error"
        >
          {error}
        </div>
      )}
    </div>
  );
}
