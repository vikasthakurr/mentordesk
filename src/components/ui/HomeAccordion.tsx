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

/** SVG icon components for each curriculum part */
function PartIcon({ partNumber, className = '' }: { partNumber: number; className?: string }) {
  const base = `w-7 h-7 ${className}`;

  switch (partNumber) {
    // Part 1: Web Foundations — HTML5 shield
    case 1:
      return (
        <svg className={base} viewBox="0 0 24 24" fill="none">
          <path d="M4 3l1.5 17L12 22l6.5-2L20 3H4z" fill="#e44d26" />
          <path d="M12 4.5v16l5-1.5L18.5 4.5H12z" fill="#f16529" />
          <path d="M8 7h8l-.3 3H9l.2 2h7l-.5 5.5L12 19l-3.7-1.5L8 14h2l.2 2 1.8.7 1.8-.7.2-2.5H8.2L8 7z" fill="white" />
        </svg>
      );
    // Part 2: JavaScript — JS logo
    case 2:
      return (
        <svg className={base} viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="2" fill="#f7df1e" />
          <path d="M8 17.5c.3.8 1 1.5 2 1.5s1.5-.5 1.5-1.2c0-.9-1-1.2-2-1.6C8 15.7 7 15 7 13.5 7 11.8 8.3 11 9.8 11c1.3 0 2.2.6 2.7 1.5l-1.3.8c-.3-.5-.7-.8-1.3-.8-.6 0-1 .3-1 .8 0 .7.7 1 1.7 1.4 1.5.6 2.5 1.2 2.5 2.8 0 1.8-1.4 2.8-3.2 2.8-1.6 0-2.8-.8-3.3-2L8 17.5z" fill="#323330" />
          <path d="M14.5 17.3c.3.9 1 1.6 2.1 1.6 1 0 1.6-.5 1.6-1.2 0-1-.8-1.3-2-1.7-1.4-.5-2.5-1.1-2.5-2.8 0-1.6 1.2-2.7 2.8-2.7 1.3 0 2.3.6 2.8 1.6l-1.3.8c-.3-.6-.8-.9-1.4-.9-.6 0-1 .3-1 .9 0 .6.6.9 1.7 1.3 1.5.5 2.6 1.2 2.6 3 0 1.7-1.3 2.8-3.2 2.8-1.7 0-3-.9-3.5-2.2l1.3-.5z" fill="#323330" />
        </svg>
      );
    // Part 3: TypeScript — TS logo
    case 3:
      return (
        <svg className={base} viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="2" fill="#3178c6" />
          <path d="M7 11h6v1.5H11.5V19H10v-6.5H7V11z" fill="white" />
          <path d="M13.5 17.2c.3.7.9 1.3 2 1.3.9 0 1.4-.5 1.4-1 0-.8-.7-1-1.7-1.4-1.3-.5-2.3-1-2.3-2.5 0-1.4 1.1-2.4 2.6-2.4 1.2 0 2 .5 2.5 1.4l-1.2.7c-.2-.5-.6-.8-1.2-.8-.6 0-.9.3-.9.7 0 .6.5.8 1.5 1.2 1.4.5 2.4 1.1 2.4 2.7 0 1.5-1.2 2.5-2.9 2.5-1.5 0-2.6-.7-3.1-1.8l1-.6z" fill="white" />
        </svg>
      );
    // Part 4: ReactJS — Atom logo
    case 4:
      return (
        <svg className={base} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="2" fill="#61dafb" />
          <ellipse cx="12" cy="12" rx="9" ry="3.5" stroke="#61dafb" strokeWidth="1" fill="none" />
          <ellipse cx="12" cy="12" rx="9" ry="3.5" stroke="#61dafb" strokeWidth="1" fill="none" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="9" ry="3.5" stroke="#61dafb" strokeWidth="1" fill="none" transform="rotate(120 12 12)" />
        </svg>
      );
    // Part 5: Node.js — Node logo
    case 5:
      return (
        <svg className={base} viewBox="0 0 24 24" fill="none">
          <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" fill="#339933" />
          <path d="M12 2v20l9-5V7l-9-5z" fill="#2d8b2d" />
          <text x="7.5" y="15" fontSize="7" fill="white" fontWeight="bold" fontFamily="sans-serif">N</text>
        </svg>
      );
    // Part 6: MongoDB — Leaf
    case 6:
      return (
        <svg className={base} viewBox="0 0 24 24" fill="none">
          <path d="M12 2C9 6 6 9 6 14c0 4 3 7 6 8 3-1 6-4 6-8 0-5-3-8-6-12z" fill="#47a248" />
          <path d="M12 2c0 0 0 4-1 8s-1 8 1 12c0-4 2-8 1-12s-1-8-1-8z" fill="#3a9142" />
          <path d="M11.5 14h1v8h-1z" fill="#2d6b30" />
        </svg>
      );
    // Part 7: System Design — Architecture blocks
    case 7:
      return (
        <svg className={base} viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="7" height="5" rx="1" fill="#8b5cf6" />
          <rect x="14" y="3" width="7" height="5" rx="1" fill="#8b5cf6" />
          <rect x="8.5" y="16" width="7" height="5" rx="1" fill="#8b5cf6" />
          <path d="M6.5 8v3h11V8" stroke="#8b5cf6" strokeWidth="1.5" fill="none" />
          <path d="M12 11v5" stroke="#8b5cf6" strokeWidth="1.5" />
        </svg>
      );
    // Part 8: Git & GitHub — Branch icon
    case 8:
      return (
        <svg className={base} viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="5" r="2.5" fill="#f97316" stroke="#f97316" />
          <circle cx="6" cy="19" r="2.5" fill="#6b7280" stroke="#6b7280" />
          <circle cx="18" cy="19" r="2.5" fill="#6b7280" stroke="#6b7280" />
          <path d="M6 16.5V12c0-2 2-3 4-3h4c2 0 4 1 4 3v4.5" stroke="#6b7280" strokeWidth="1.5" />
          <path d="M12 7.5v1.5" stroke="#6b7280" strokeWidth="1.5" />
        </svg>
      );
    // Part 9: Testing — Flask/beaker
    case 9:
      return (
        <svg className={base} viewBox="0 0 24 24" fill="none">
          <path d="M9 3h6v4l5 11a2 2 0 01-1.8 2.8H5.8A2 2 0 014 18L9 7V3z" fill="#ec4899" fillOpacity="0.15" stroke="#ec4899" strokeWidth="1.5" />
          <path d="M9 3h6" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" />
          <path d="M7 15h10" stroke="#ec4899" strokeWidth="1" strokeDasharray="2 1" />
          <circle cx="10" cy="17" r="1" fill="#ec4899" />
          <circle cx="14" cy="16" r="0.8" fill="#ec4899" />
        </svg>
      );
    // Part 10: Next.js — N logo
    case 10:
      return (
        <svg className={base} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9.5" fill="#000" stroke="#333" strokeWidth="0.5" />
          <path d="M9 8v8l7-8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 8v8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
        </svg>
      );
    // Part 11: DSA — Tree/graph structure
    case 11:
      return (
        <svg className={base} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="4" r="2.5" fill="#7c3aed" />
          <circle cx="6" cy="13" r="2.5" fill="#7c3aed" />
          <circle cx="18" cy="13" r="2.5" fill="#7c3aed" />
          <circle cx="4" cy="20" r="2" fill="#a78bfa" />
          <circle cx="9" cy="20" r="2" fill="#a78bfa" />
          <circle cx="16" cy="20" r="2" fill="#a78bfa" />
          <circle cx="21" cy="20" r="2" fill="#a78bfa" />
          <path d="M12 6.5L6 10.5M12 6.5l6 4M6 15.5l-2 2.5M6 15.5l3 2.5M18 15.5l-2 2.5M18 15.5l3 2.5" stroke="#7c3aed" strokeWidth="1" />
        </svg>
      );
    // Part 12: Deployment — Rocket
    case 12:
      return (
        <svg className={base} viewBox="0 0 24 24" fill="none">
          <path d="M12 2c-3 3-5 7-5 12l2 3h6l2-3c0-5-2-9-5-12z" fill="#ef4444" />
          <path d="M12 2c0 0 2 4 2 9s-1 6-2 7c-1-1-2-2-2-7s2-9 2-9z" fill="#dc2626" />
          <circle cx="12" cy="11" r="2" fill="white" />
          <path d="M9 17l-1 4h2l1-2" fill="#f97316" />
          <path d="M15 17l1 4h-2l-1-2" fill="#f97316" />
          <path d="M10.5 17h3v2h-3z" fill="#fbbf24" />
        </svg>
      );
    default:
      return (
        <svg className={base} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
        </svg>
      );
  }
}

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

        return (
          <div key={part.slug} className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 border-l-4 ${colorClass} overflow-hidden shadow-sm`}>
            {/* Part Header */}
            <button
              onClick={() => toggle(part.slug)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className="transition-transform group-hover:scale-110 group-hover:rotate-3">
                  <PartIcon partNumber={part.partNumber} />
                </span>
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
                <svg className={`w-5 h-5 text-gray-400 chevron-animated ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
