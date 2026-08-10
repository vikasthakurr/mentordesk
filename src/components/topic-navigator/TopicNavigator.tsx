'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { TopicNavigatorProps, Part } from '@/types';
import { PartSection } from './PartSection';
import { useTheme } from '@/lib/theme';
import BatchSelector from '@/components/ui/BatchSelector';

export interface TopicNavigatorExtendedProps extends TopicNavigatorProps {
  completedTopics?: Set<string>;
}

/**
 * Finds the part slug that contains a given topic slug.
 */
function findPartContainingTopic(parts: Part[], topicSlug: string): string | null {
  for (const part of parts) {
    for (const mod of part.modules) {
      if (mod.topics.some((t) => t.slug === topicSlug)) {
        return part.slug;
      }
    }
  }
  return null;
}

export function TopicNavigator({
  parts,
  activeTopic,
  onTopicSelect,
  completedTopics = new Set(),
}: TopicNavigatorExtendedProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, toggle } = useTheme();

  const [expandedParts, setExpandedParts] = useState<Set<string>>(() => {
    // Auto-expand the part containing the active topic on mount
    if (activeTopic) {
      const partSlug = findPartContainingTopic(parts, activeTopic);
      if (partSlug) {
        return new Set([partSlug]);
      }
    }
    return new Set();
  });

  // Auto-expand the part containing the active topic when activeTopic changes
  useEffect(() => {
    if (activeTopic) {
      const partSlug = findPartContainingTopic(parts, activeTopic);
      if (partSlug && !expandedParts.has(partSlug)) {
        setExpandedParts((prev) => {
          const next = new Set(prev);
          next.add(partSlug);
          return next;
        });
      }
    }
  }, [activeTopic, parts]);

  const handlePartToggle = useCallback((partSlug: string) => {
    setExpandedParts((prev) => {
      const next = new Set(prev);
      if (next.has(partSlug)) {
        next.delete(partSlug);
      } else {
        next.add(partSlug);
      }
      return next;
    });
  }, []);

  // Filter parts/modules/topics based on search query
  const filteredParts = useMemo(() => {
    if (!searchQuery.trim()) return parts;

    const query = searchQuery.toLowerCase();
    return parts
      .map((part) => {
        const filteredModules = part.modules
          .map((mod) => {
            const filteredTopics = mod.topics.filter((t) =>
              t.title.toLowerCase().includes(query)
            );
            if (filteredTopics.length === 0) return null;
            return { ...mod, topics: filteredTopics };
          })
          .filter(Boolean) as typeof part.modules;

        if (filteredModules.length === 0) return null;
        return { ...part, modules: filteredModules };
      })
      .filter(Boolean) as Part[];
  }, [parts, searchQuery]);

  // When search is active, auto-expand all matched parts
  const effectiveExpandedParts = useMemo(() => {
    if (searchQuery.trim()) {
      return new Set(filteredParts.map((p) => p.slug));
    }
    return expandedParts;
  }, [searchQuery, filteredParts, expandedParts]);

  return (
    <nav
      role="navigation"
      aria-label="Topic Navigator"
      className="h-full overflow-y-auto bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700"
    >
      {/* Home Button */}
      <a
        href="/"
        className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        MentorDesk
      </a>

      {/* Search Input */}
      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search topics..."
          className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-500"
        />
      </div>

      {/* Batch Selector */}
      <BatchSelector />

      {/* Theme Toggle */}
      <div className="px-3 py-1.5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-end">
        <button onClick={toggle} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700" title="Toggle theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="py-2">
        {filteredParts.map((part) => (
          <PartSection
            key={part.slug}
            part={part}
            activeTopic={activeTopic}
            isExpanded={effectiveExpandedParts.has(part.slug)}
            onToggle={() => handlePartToggle(part.slug)}
            onTopicSelect={onTopicSelect}
            completedTopics={completedTopics}
          />
        ))}
      </div>
    </nav>
  );
}
