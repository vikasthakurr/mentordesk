'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface TopicEntry {
  slug: string;
  title: string;
  partSlug: string;
  partTitle: string;
  moduleSlug: string;
  moduleTitle: string;
  type: string;
}

interface CommandPaletteProps {
  topics: TopicEntry[];
}

export default function CommandPalette({ topics }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Cmd+K to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Filter topics
  const filtered = useMemo(() => {
    if (!query.trim()) return topics.slice(0, 20);
    const q = query.toLowerCase();
    return topics
      .filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.partTitle.toLowerCase().includes(q) ||
          t.moduleTitle.toLowerCase().includes(q)
      )
      .slice(0, 15);
  }, [query, topics]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filtered]);

  // Scroll selected item into view
  useEffect(() => {
    const el = listRef.current?.children[selectedIndex] as HTMLElement;
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const navigate = (topic: TopicEntry) => {
    setOpen(false);
    router.push(`/${topic.partSlug}/${topic.moduleSlug}/${topic.slug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      navigate(filtered[selectedIndex]);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
        onClick={() => setOpen(false)}
      />
      {/* Panel */}
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 z-[9999] w-full max-w-lg px-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search topics... (type to filter)"
              className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
            />
            <kbd className="px-1.5 py-0.5 text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
              Esc
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-72 overflow-y-auto py-2">
            {filtered.length === 0 && (
              <p className="px-4 py-6 text-sm text-gray-500 text-center">No topics found</p>
            )}
            {filtered.map((topic, i) => (
              <button
                key={`${topic.partSlug}-${topic.moduleSlug}-${topic.slug}`}
                onClick={() => navigate(topic)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  i === selectedIndex
                    ? 'bg-blue-50 dark:bg-blue-900/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  topic.type === 'code' ? 'bg-blue-400' : topic.type === 'diagram' ? 'bg-purple-400' : 'bg-green-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${
                    i === selectedIndex
                      ? 'text-blue-700 dark:text-blue-300 font-medium'
                      : 'text-gray-800 dark:text-gray-200'
                  }`}>
                    {topic.title}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {topic.partTitle} › {topic.moduleTitle}
                  </p>
                </div>
                {i === selectedIndex && (
                  <kbd className="px-1.5 py-0.5 text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded flex-shrink-0">
                    ↵
                  </kbd>
                )}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-400">{topics.length} topics</span>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>↑↓ navigate</span>
              <span>↵ open</span>
              <span>esc close</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
