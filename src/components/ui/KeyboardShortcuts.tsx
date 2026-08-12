'use client';

import { useState, useEffect } from 'react';

const shortcuts = [
  { keys: ['⌘', '1'], description: 'Switch to HTML tab' },
  { keys: ['⌘', '2'], description: 'Switch to CSS tab' },
  { keys: ['⌘', '3'], description: 'Switch to JS tab' },
  { keys: ['⌘', '4'], description: 'Switch to TS tab' },
  { keys: ['⌘', 'S'], description: 'Save all files' },
  { keys: ['⌘', '⇧', 'P'], description: 'Toggle preview' },
  { keys: ['⇧', 'Alt', 'F'], description: 'Format code' },
  { keys: ['?'], description: 'Show this help' },
];

export default function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // '?' key (Shift + /) opens the panel, but not in input/textarea
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      // Escape closes
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998] animate-[fade-in_0.15s_ease-out]"
        onClick={() => setOpen(false)}
      />
      {/* Panel */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-full max-w-sm animate-[toast-slide-in_0.2s_ease-out]">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Keyboard Shortcuts</h2>
            <button
              onClick={() => setOpen(false)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="px-5 py-3 space-y-2.5 max-h-80 overflow-y-auto">
            {shortcuts.map((s, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{s.description}</span>
                <div className="flex items-center gap-1">
                  {s.keys.map((key, j) => (
                    <kbd
                      key={j}
                      className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-gray-700 dark:text-gray-300 min-w-[1.5rem] text-center"
                    >
                      {key}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 text-center">
            <span className="text-xs text-gray-400">Press <kbd className="px-1 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">?</kbd> or <kbd className="px-1 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">Esc</kbd> to close</span>
          </div>
        </div>
      </div>
    </>
  );
}
