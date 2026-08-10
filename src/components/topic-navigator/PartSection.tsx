'use client';

import { useState, useMemo } from 'react';
import { Part, PartSectionProps } from '@/types';
import { ModuleSection } from './ModuleSection';

export interface PartSectionExtendedProps extends PartSectionProps {
  completedTopics?: Set<string>;
}

export function PartSection({
  part,
  activeTopic,
  isExpanded,
  onToggle,
  onTopicSelect,
  completedTopics = new Set(),
}: PartSectionExtendedProps) {
  // Track which modules are expanded locally
  const [expandedModules, setExpandedModules] = useState<Set<string>>(() => {
    // Auto-expand module containing the active topic
    if (activeTopic) {
      for (const mod of part.modules) {
        if (mod.topics.some((t) => t.slug === activeTopic)) {
          return new Set([mod.slug]);
        }
      }
    }
    return new Set();
  });

  // Calculate part-level progress: completed modules / total modules
  const { completedModules, totalModules } = useMemo(() => {
    const total = part.modules.length;
    let completed = 0;
    for (const mod of part.modules) {
      if (mod.topics.length > 0 && mod.topics.every((t) => completedTopics.has(t.slug))) {
        completed++;
      }
    }
    return { completedModules: completed, totalModules: total };
  }, [part.modules, completedTopics]);

  const handleModuleToggle = (moduleSlug: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleSlug)) {
        next.delete(moduleSlug);
      } else {
        next.add(moduleSlug);
      }
      return next;
    });
  };

  const isModuleExpanded = (moduleSlug: string): boolean => {
    // Auto-expand if it contains the active topic
    const mod = part.modules.find((m) => m.slug === moduleSlug);
    if (mod && activeTopic && mod.topics.some((t) => t.slug === activeTopic)) {
      return true;
    }
    return expandedModules.has(moduleSlug);
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
      >
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate block">
            Part {part.partNumber} - {part.title}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 block">
            {completedModules} / {totalModules} modules completed
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 transition-transform ${
            isExpanded ? 'rotate-90' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="pl-2">
          {part.modules.map((mod) => (
            <ModuleSection
              key={mod.slug}
              module={mod}
              partSlug={part.slug}
              activeTopic={activeTopic}
              isExpanded={isModuleExpanded(mod.slug)}
              onToggle={() => handleModuleToggle(mod.slug)}
              onTopicSelect={onTopicSelect}
              completedTopics={completedTopics}
            />
          ))}
        </div>
      )}
    </div>
  );
}
