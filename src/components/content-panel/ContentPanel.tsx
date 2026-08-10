'use client';

import { useState, useCallback, useRef } from 'react';
import type {
  ContentPanelProps,
  CodeTopicContent,
  ContentTopicContent,
  DiagramTopicContent,
} from '@/types';
import { downloadCodeFile, downloadMarkdownFile } from '@/lib/download';
import MultiFileEditor from './MultiFileEditor';
import ContentViewer from './ContentViewer';
import DiagramEditor from './DiagramEditor';
import NodeEditor from './NodeEditor';
import ExerciseInstructions from './ExerciseInstructions';
import MarkAsCompletedButton from '@/components/ui/MarkAsCompletedButton';

interface ExtendedContentPanelProps extends ContentPanelProps {
  onCompletionChange?: (isComplete: boolean) => void;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  partTitle?: string;
  moduleTitle?: string;
  onToggleFullscreen?: () => void;
}

type ActiveTab = 'code' | 'draw' | 'notes' | 'node';

export default function ContentPanel({ topic, onCompletionChange, onNavigatePrev, onNavigateNext, hasPrev, hasNext, partTitle, moduleTitle, onToggleFullscreen }: ExtendedContentPanelProps) {
  const [currentCode, setCurrentCode] = useState<string>('');
  const codeRef = useRef<string>('');
  const [presentMode, setPresentMode] = useState(false);

  // Determine default tab based on topic type
  const getDefaultTab = (): ActiveTab => {
    if (topic.type === 'diagram') return 'draw';
    if (topic.type === 'content') return 'notes';
    return 'code';
  };

  const [activeTab, setActiveTab] = useState<ActiveTab>(getDefaultTab);

  const handleCodeChange = useCallback((code: string) => {
    setCurrentCode(code);
    codeRef.current = code;
  }, []);

  // Get language and starter code for the code editor
  const getCodeProps = () => {
    if (topic.type === 'code' || (topic.type as string) === 'mixed') {
      const content = topic.content as CodeTopicContent;
      return { starterCode: content.starterCode, language: content.language };
    }
    return { starterCode: '// Start coding here...\n', language: 'javascript' as const };
  };

  const handleDownload = useCallback(() => {
    if (activeTab === 'code') {
      const { language } = getCodeProps();
      const code = codeRef.current || getCodeProps().starterCode;
      downloadCodeFile(topic.title, code, language);
    } else if (activeTab === 'notes') {
      const content = topic.content as ContentTopicContent;
      if (content.markdown) {
        downloadMarkdownFile(topic.title, content.markdown);
      }
    }
  }, [topic, activeTab]);

  // Extract exercise instructions
  const exerciseInstructions = (() => {
    const content = topic.content as any;
    if (content?.exerciseInstructions?.trim()?.length > 0) {
      return content.exerciseInstructions;
    }
    return null;
  })();

  const referenceContent = (() => {
    const content = topic.content as any;
    if (content?.referenceContent?.trim()?.length > 0) {
      return content.referenceContent;
    }
    return null;
  })();

  const { starterCode, language } = getCodeProps();

  const togglePresentMode = () => {
    const entering = !presentMode;
    setPresentMode(entering);
    // When entering presentation mode, also hide the sidebar
    if (entering && onToggleFullscreen) {
      onToggleFullscreen();
    }
  };

  return (
    <div className={`flex flex-col h-full ${presentMode ? 'text-lg' : ''}`} data-testid="content-panel">
      {/* Compact Mentor Header */}
      <header className="flex items-center justify-between px-3 py-1.5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={onNavigatePrev}
              disabled={!hasPrev}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Previous topic"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={onNavigateNext}
              disabled={!hasNext}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Next topic"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <h2 className={`font-bold text-gray-900 dark:text-white truncate ${presentMode ? 'text-xl' : 'text-lg'}`}>
            {topic.title}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={togglePresentMode}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              presentMode
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            title={presentMode ? 'Exit Presentation Mode' : 'Enter Presentation Mode'}
          >
            🎬 {presentMode ? 'Exit' : 'Present'}
          </button>
          <MarkAsCompletedButton topicSlug={topic.slug} onToggle={onCompletionChange} />
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
            aria-label={`Download ${topic.title}`}
            data-testid="download-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      </header>

      {/* Exercise Instructions (shown above content when present) */}
      {exerciseInstructions && (
        <ExerciseInstructions
          instructions={exerciseInstructions}
          referenceContent={referenceContent ?? undefined}
        />
      )}

      {/* Main Layout: Activity Bar + Content */}
      <div className="flex flex-1 min-h-0">
        {/* Activity Bar - vertical icon strip (hidden in presentation mode) */}
        {!presentMode && (
          <div className="w-12 flex flex-col items-center py-2 gap-2 bg-gray-800 border-r border-gray-700 flex-shrink-0">
            {/* Code Editor */}
            <button
              onClick={() => setActiveTab('code')}
              className={`p-2 rounded-lg transition-colors ${
                activeTab === 'code'
                  ? 'text-blue-400 bg-gray-700'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700'
              }`}
              title="Code Editor"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </button>

            {/* Drawing Board */}
            <button
              onClick={() => setActiveTab('draw')}
              className={`p-2 rounded-lg transition-colors ${
                activeTab === 'draw'
                  ? 'text-blue-400 bg-gray-700'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700'
              }`}
              title="Drawing Board"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>

            {/* Node.js */}
            <button
              onClick={() => setActiveTab('node')}
              className={`p-2 rounded-lg transition-colors ${
                activeTab === 'node'
                  ? 'text-green-400 bg-gray-700'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700'
              }`}
              title="Node.js"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1.85c-.27 0-.55.07-.78.2l-7.44 4.3c-.48.28-.78.8-.78 1.36v8.58c0 .56.3 1.08.78 1.36l1.95 1.12c.95.46 1.27.46 1.71.46 1.4 0 2.21-.85 2.21-2.33V8.44c0-.12-.1-.22-.22-.22H8.5c-.13 0-.23.1-.23.22v8.47c0 .66-.68 1.31-1.77.76L4.45 16.5a.26.26 0 01-.12-.21V7.71c0-.09.04-.17.12-.21l7.44-4.3c.09-.04.18-.04.27 0l7.44 4.3c.08.04.12.12.12.21v8.58c0 .08-.04.17-.12.21l-7.44 4.3c-.08.04-.18.04-.27 0l-1.88-1.12c-.07-.04-.17-.05-.25-.01-.68.31-.81.35-1.44.53-.16.04-.4.12.09.35l2.45 1.45c.24.14.5.21.78.21.27 0 .54-.07.78-.2l7.44-4.3c.48-.28.78-.8.78-1.36V7.71c0-.56-.3-1.08-.78-1.36l-7.44-4.3c-.23-.13-.5-.2-.78-.2z" />
              </svg>
            </button>

            {/* Notes (shown for content topics) */}
            {topic.type === 'content' && (
              <button
                onClick={() => setActiveTab('notes')}
                className={`p-2 rounded-lg transition-colors ${
                  activeTab === 'notes'
                    ? 'text-blue-400 bg-gray-700'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700'
                }`}
                title="Notes"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Presentation Mode Toggle (bottom of activity bar) */}
            <button
              onClick={togglePresentMode}
              className="p-2 rounded-lg text-gray-500 hover:text-yellow-400 hover:bg-gray-700 transition-colors"
              title="Presentation Mode"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </button>
          </div>
        )}

        {/* Content Area */}
        <main className={`flex-1 min-h-0 overflow-hidden ${presentMode ? 'relative' : ''}`}>
          {/* Floating exit button in presentation mode */}
          {presentMode && (
            <button
              onClick={togglePresentMode}
              className="absolute top-3 right-3 z-50 px-3 py-1.5 text-xs font-medium bg-black/70 text-white rounded-full hover:bg-black/90 backdrop-blur-sm transition-colors shadow-lg"
              title="Exit Presentation Mode"
            >
              ✕ Exit Present
            </button>
          )}

          {/* Code Editor */}
          {activeTab === 'code' && (
            <MultiFileEditor
              topicSlug={topic.slug}
              partSlug={topic.partSlug}
              moduleSlug={topic.moduleSlug}
              defaultHtml={topic.type === 'code' && (topic.content as CodeTopicContent).language === 'html' ? (topic.content as CodeTopicContent).starterCode : undefined}
              defaultCss={topic.type === 'code' && (topic.content as CodeTopicContent).language === 'css' ? (topic.content as CodeTopicContent).starterCode : undefined}
              defaultJs={topic.type === 'code' && (topic.content as CodeTopicContent).language === 'javascript' ? (topic.content as CodeTopicContent).starterCode : undefined}
            />
          )}

          {/* Drawing Board */}
          {activeTab === 'draw' && (
            <DiagramEditor
              topicSlug={topic.slug}
              partSlug={topic.partSlug}
              moduleSlug={topic.moduleSlug}
            />
          )}

          {/* Notes (for content topics) */}
          {activeTab === 'notes' && (
            <ContentViewer content={(topic.content as ContentTopicContent).markdown || ''} />
          )}

          {/* Node.js - StackBlitz WebContainer */}
          {activeTab === 'node' && (
            <NodeEditor topicSlug={topic.slug} />
          )}
        </main>
      </div>
    </div>
  );
}
