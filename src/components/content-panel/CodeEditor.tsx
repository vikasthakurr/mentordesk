'use client';

import { useState, useEffect, useRef, useCallback, Component, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import type { SupportedLanguage } from '@/types';
import { buildStorageKey, loadCode, saveCode, clearEntry } from '@/lib/session-storage';
import { configureMonaco } from '@/lib/monaco-config';

// Configure Monaco to load from local files (not CDN)
configureMonaco();

// Error boundary to catch Monaco load/render failures
interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
  onError?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class MonacoErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onError?.();
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Dynamically import Monaco Editor with SSR disabled
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full bg-gray-900 text-gray-400 gap-3">
        <svg className="animate-spin h-6 w-6 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-sm">Loading code editor...</span>
      </div>
    ),
  }
);

export interface CodeEditorProps {
  topicSlug: string;
  partSlug: string;
  moduleSlug: string;
  starterCode: string;
  language: SupportedLanguage;
  onCodeChange: (code: string) => void;
}

const DEBOUNCE_DELAY = 1000;

export default function CodeEditor({
  topicSlug,
  partSlug,
  moduleSlug,
  starterCode,
  language,
  onCodeChange,
}: CodeEditorProps) {
  const [code, setCode] = useState<string>('');
  const [monacoFailed, setMonacoFailed] = useState(false);
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const storageKeyRef = useRef<string>('');

  // Build storage key
  useEffect(() => {
    storageKeyRef.current = buildStorageKey(partSlug, moduleSlug, topicSlug, 'code');
  }, [partSlug, moduleSlug, topicSlug]);

  // Initialize code from session storage or starter code
  useEffect(() => {
    const key = buildStorageKey(partSlug, moduleSlug, topicSlug, 'code');
    storageKeyRef.current = key;

    const savedCode = loadCode(key);
    if (savedCode !== null) {
      setCode(savedCode);
      onCodeChange(savedCode);
    } else {
      setCode(starterCode);
      onCodeChange(starterCode);
    }
    // Reset storage availability notice on topic change
    setStorageUnavailable(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partSlug, moduleSlug, topicSlug, starterCode]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const debouncedSave = useCallback(
    (value: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        const success = saveCode(storageKeyRef.current, value);
        if (!success) {
          setStorageUnavailable(true);
        }
      }, DEBOUNCE_DELAY);
    },
    []
  );

  const handleCodeChange = useCallback(
    (value: string | undefined) => {
      const newCode = value ?? '';
      setCode(newCode);
      onCodeChange(newCode);
      debouncedSave(newCode);
    },
    [onCodeChange, debouncedSave]
  );

  const handleReset = useCallback(() => {
    // Cancel any pending debounced save
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    clearEntry(storageKeyRef.current);
    setCode(starterCode);
    onCodeChange(starterCode);
    setStorageUnavailable(false);
  }, [starterCode, onCodeChange]);

  const handleMonacoError = useCallback(() => {
    setMonacoFailed(true);
  }, []);

  // Render fallback textarea when Monaco fails
  if (monacoFailed) {
    return (
      <div className="flex flex-col w-full min-h-[400px]">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-sm text-yellow-400">
              ⚠ Advanced editor features are unavailable. Using basic text editor.
            </span>
          </div>
          <button
            onClick={handleReset}
            className="px-3 py-1 text-sm text-white bg-gray-600 rounded hover:bg-gray-500 transition-colors"
          >
            Reset
          </button>
        </div>
        {storageUnavailable && (
          <div className="px-4 py-1 text-xs text-amber-400 bg-amber-900/30">
            Changes will not be saved (storage unavailable)
          </div>
        )}
        <textarea
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          className="flex-1 w-full min-h-[400px] p-4 bg-gray-900 text-gray-100 font-mono text-sm resize-none focus:outline-none"
          spellCheck={false}
        />
      </div>
    );
  }

  return (
    <MonacoErrorBoundary
      fallback={
        <div className="flex flex-col w-full min-h-[400px]">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-sm text-yellow-400">
                ⚠ Advanced editor features are unavailable. Using basic text editor.
              </span>
            </div>
            <button
              onClick={handleReset}
              className="px-3 py-1 text-sm text-white bg-gray-600 rounded hover:bg-gray-500 transition-colors"
            >
              Reset
            </button>
          </div>
          {storageUnavailable && (
            <div className="px-4 py-1 text-xs text-amber-400 bg-amber-900/30">
              Changes will not be saved (storage unavailable)
            </div>
          )}
          <textarea
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            className="flex-1 w-full min-h-[400px] p-4 bg-gray-900 text-gray-100 font-mono text-sm resize-none focus:outline-none"
            spellCheck={false}
          />
        </div>
      }
      onError={handleMonacoError}
    >
      <div className="flex flex-col w-full h-full" style={{ minHeight: '300px' }}>
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
          <span className="text-sm text-gray-300 capitalize">{language}</span>
          <button
            onClick={handleReset}
            className="px-3 py-1 text-sm text-white bg-gray-600 rounded hover:bg-gray-500 transition-colors"
          >
            Reset
          </button>
        </div>
        {storageUnavailable && (
          <div className="px-4 py-1 text-xs text-amber-400 bg-amber-900/30">
            Changes will not be saved (storage unavailable)
          </div>
        )}
        <div className="flex-1 relative" style={{ minHeight: '300px' }}>
          <MonacoEditor
            height="100%"
            language={language}
            value={code}
            onChange={handleCodeChange}
            onValidate={undefined}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              scrollBeyondLastLine: true,
              automaticLayout: true,
              tabSize: 2,
              scrollbar: {
                vertical: 'visible',
                horizontal: 'visible',
                verticalScrollbarSize: 12,
                horizontalScrollbarSize: 12,
              },
              // Auto-closing and matching
              autoClosingBrackets: 'always',
              autoClosingQuotes: 'always',
              autoIndent: 'full',
              formatOnPaste: true,
              formatOnType: true,
              // Suggestions and IntelliSense
              suggestOnTriggerCharacters: true,
              acceptSuggestionOnEnter: 'on',
              quickSuggestions: {
                other: true,
                comments: true,
                strings: true,
              },
              parameterHints: { enabled: true },
              suggest: {
                showKeywords: true,
                showSnippets: true,
                showClasses: true,
                showFunctions: true,
                showVariables: true,
                showModules: true,
                insertMode: 'insert',
              },
              // Bracket matching
              bracketPairColorization: { enabled: true },
              matchBrackets: 'always',
              // Linked editing for HTML tags (rename matching tag)
              linkedEditing: true,
            }}
            onMount={(editor, monaco) => {
              // Enable Emmet-like tag completion for HTML
              if (language === 'html') {
                // Register auto-closing tag provider
                monaco.languages.registerCompletionItemProvider('html', {
                  triggerCharacters: ['>'],
                  provideCompletionItems: (model: any, position: any) => {
                    const textUntilPosition = model.getValueInRange({
                      startLineNumber: position.lineNumber,
                      startColumn: 1,
                      endLineNumber: position.lineNumber,
                      endColumn: position.column,
                    });

                    // Match opening tag that was just closed with >
                    const match = textUntilPosition.match(/<(\w[\w-]*)(?:\s[^>]*)?>$/);
                    if (!match) return { suggestions: [] };

                    const tag = match[1];
                    // Self-closing tags that don't need a closing tag
                    const voidTags = ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'];
                    if (voidTags.includes(tag.toLowerCase())) return { suggestions: [] };

                    return {
                      suggestions: [{
                        label: `</${tag}>`,
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: `$0</${tag}>`,
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        range: {
                          startLineNumber: position.lineNumber,
                          startColumn: position.column,
                          endLineNumber: position.lineNumber,
                          endColumn: position.column,
                        },
                        detail: 'Auto close tag',
                      }],
                    };
                  },
                });
              }
            }}
            loading={
              <div className="flex items-center justify-center min-h-[400px] w-full bg-gray-900 text-gray-400">
                Loading editor...
              </div>
            }
          />
        </div>
      </div>
    </MonacoErrorBoundary>
  );
}
