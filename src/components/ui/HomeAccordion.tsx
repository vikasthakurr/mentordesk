'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Part } from '@/types';
import { getAllCompletedTopics } from '@/lib/progress';

const partColors: Record<number, string> = {
  1: 'border-l-orange-500',
  2: 'border-l-yellow-500',
  3: 'border-l-blue-500',
  4: 'border-l-cyan-500',
  5: 'border-l-green-500',
  6: 'border-l-emerald-500',
  7: 'border-l-purple-500',
  8: 'border-l-gray-500',
  9: 'border-l-pink-500',
  10: 'border-l-slate-600',
  11: 'border-l-violet-500',
  12: 'border-l-red-500',
};

const partIcons: Record<number, string> = {
  1: '🌐', 2: '⚡', 3: '🔷', 4: '⚛️', 5: '🟢', 6: '🍃',
  7: '🏗️', 8: '🐙', 9: '🧪', 10: '▲', 11: '🧠', 12: '🚀',
};

export default function HomeAccordion({ parts }: { parts: Part[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());

  useEffect(() => {
    setCompletedTopics(getAllCompletedTopics());
  }, []);

  const toggle = (slug: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {parts.map((part) => {
        const topicCount = part.modules.reduce((s, m) => s + m.topics.length, 0);
        const completedCount = part.modules.reduce((s, m) => s + m.topics.filter(t => completedTopics.has(t.slug)).length, 0);
        const progressPct = topicCount > 0 ? Math.round((completedCount / topicCount) * 100) : 0;
        const isExpanded = expanded.has(part.slug);
        const colorClass = partColors[part.partNumber] || 'border-l-gray-400';
        const icon = partIcons[part.partNumber] || '📚';

        return (
          <div key={part.slug} className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 border-l-4 ${colorClass} overflow-hidden shadow-sm`}>
            {/* Part Header */}
            <button
              onClick={() => toggle(part.slug)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{icon}</span>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Part {part.partNumber} - {part.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {part.modules.length} modules · {topicCount} topics
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {/* Progress */}
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-12 text-right">{completedCount}/{topicCount}</span>
                </div>
                {/* Chevron */}
                <svg className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Expanded Content - Modules */}
            {isExpanded && (
              <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-3 bg-gray-50/50 dark:bg-gray-800/30">
                <div className="space-y-2">
                  {part.modules.map((mod) => {
                    const firstTopic = mod.topics[0];
                    const href = firstTopic ? `/${part.slug}/${mod.slug}/${firstTopic.slug}` : null;
                    const modCompleted = mod.topics.filter(t => completedTopics.has(t.slug)).length;

                    return (
                      <div key={mod.slug} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded text-xs flex items-center justify-center font-medium text-gray-600 dark:text-gray-400">
                            {mod.moduleId}
                          </span>
                          {href ? (
                            <Link href={href} className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 truncate font-medium">
                              {mod.title}
                            </Link>
                          ) : (
                            <span className="text-sm text-gray-400 truncate">{mod.title}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <span className="text-xs text-gray-500">{modCompleted}/{mod.topics.length}</span>
                          {modCompleted === mod.topics.length && mod.topics.length > 0 && (
                            <span className="text-green-500 text-xs">✓</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
