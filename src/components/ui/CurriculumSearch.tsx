'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Part } from '@/types';

interface CurriculumSearchProps {
  parts: Part[];
}

export default function CurriculumSearch({ parts }: CurriculumSearchProps) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const matches: { slug: string; title: string; partSlug: string; moduleSlug: string; partTitle: string; type: string }[] = [];

    for (const part of parts) {
      for (const mod of part.modules) {
        for (const t of mod.topics) {
          if (t.title.toLowerCase().includes(q) || mod.title.toLowerCase().includes(q)) {
            matches.push({
              slug: t.slug,
              title: t.title,
              partSlug: part.slug,
              moduleSlug: mod.slug,
              partTitle: `${part.title} › ${mod.title}`,
              type: t.type,
            });
          }
        }
      }
    }
    return matches.slice(0, 8);
  }, [query, parts]);

  return (
    <div className="relative mb-4">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search topics..."
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown results */}
      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-20">
          {results.map((r) => (
            <Link
              key={`${r.partSlug}-${r.moduleSlug}-${r.slug}`}
              href={`/${r.partSlug}/${r.moduleSlug}/${r.slug}`}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setQuery('')}
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                r.type === 'code' ? 'bg-blue-400' : r.type === 'diagram' ? 'bg-purple-400' : 'bg-green-400'
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 dark:text-gray-200 truncate">{r.title}</p>
                <p className="text-xs text-gray-400 truncate">{r.partTitle}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {query.trim() && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4 text-center z-20">
          <p className="text-sm text-gray-500">No topics found for &quot;{query}&quot;</p>
        </div>
      )}
    </div>
  );
}
