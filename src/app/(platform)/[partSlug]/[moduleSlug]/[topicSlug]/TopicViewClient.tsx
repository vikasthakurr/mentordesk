'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { TopicNavigator } from '@/components/topic-navigator/TopicNavigator';
import ContentPanel from '@/components/content-panel/ContentPanel';
import { getAllCompletedTopics, markTopicComplete, markTopicIncomplete } from '@/lib/progress';
import { fetchProgress } from '@/lib/api-client';
import { getCurrentBatch } from '@/lib/batch';
import TourGuide from '@/components/ui/TourGuide';
import ResizeHandle from '@/components/ui/ResizeHandle';
import KeyboardShortcuts from '@/components/ui/KeyboardShortcuts';
import CommandPalette from '@/components/ui/CommandPalette';
import type { Part, Topic } from '@/types';

interface TopicViewClientProps {
  parts: Part[];
  topic: Topic;
  activeTopic: string;
}

export default function TopicViewClient({
  parts,
  topic,
  activeTopic,
}: TopicViewClientProps) {
  const router = useRouter();
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());
  const [navOpen, setNavOpen] = useState(false);
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(320); // 320px = w-80

  // Track last visited topic
  useEffect(() => {
    fetch('/api/last-visited', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topicPath: `/${topic.partSlug}/${topic.moduleSlug}/${topic.slug}` }),
    }).catch(() => {});
  }, [topic.slug, topic.partSlug, topic.moduleSlug]);

  // Load completed topics from localStorage on mount
  useEffect(() => {
    setCompletedTopics(getAllCompletedTopics());
    // Then sync from MongoDB
    fetchProgress(getCurrentBatch()).then(dbTopics => {
      if (dbTopics.length > 0) {
        setCompletedTopics(prev => {
          const merged = new Set(prev);
          for (const slug of dbTopics) merged.add(slug);
          return merged;
        });
      }
    });
  }, []);

  // Build flat list of all topics for prev/next navigation
  const flatTopics = useMemo(() => {
    const list: { partSlug: string; moduleSlug: string; topicSlug: string }[] = [];
    for (const part of parts) {
      for (const mod of part.modules) {
        for (const t of mod.topics) {
          list.push({ partSlug: part.slug, moduleSlug: mod.slug, topicSlug: t.slug });
        }
      }
    }
    return list;
  }, [parts]);

  // Build command palette entries
  const paletteTopics = useMemo(() => {
    const entries: { slug: string; title: string; partSlug: string; partTitle: string; moduleSlug: string; moduleTitle: string; type: string }[] = [];
    for (const part of parts) {
      for (const mod of part.modules) {
        for (const t of mod.topics) {
          entries.push({
            slug: t.slug,
            title: t.title,
            partSlug: part.slug,
            partTitle: part.title,
            moduleSlug: mod.slug,
            moduleTitle: mod.title,
            type: t.type,
          });
        }
      }
    }
    return entries;
  }, [parts]);

  const currentIndex = useMemo(() => {
    return flatTopics.findIndex((t) => t.topicSlug === activeTopic);
  }, [flatTopics, activeTopic]);

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < flatTopics.length - 1;

  const handleNavigatePrev = useCallback(() => {
    if (hasPrev) {
      const prev = flatTopics[currentIndex - 1];
      router.push(`/${prev.partSlug}/${prev.moduleSlug}/${prev.topicSlug}`);
    }
  }, [hasPrev, flatTopics, currentIndex, router]);

  const handleNavigateNext = useCallback(() => {
    if (hasNext) {
      const next = flatTopics[currentIndex + 1];
      router.push(`/${next.partSlug}/${next.moduleSlug}/${next.topicSlug}`);
    }
  }, [hasNext, flatTopics, currentIndex, router]);

  const handleTopicSelect = useCallback(
    (partSlug: string, moduleSlug: string, topicSlug: string) => {
      // Close navigator on mobile when a topic is selected
      setNavOpen(false);
      router.push(`/${partSlug}/${moduleSlug}/${topicSlug}`);
    },
    [router]
  );

  const handleCompletionChange = useCallback((isComplete: boolean) => {
    if (isComplete) {
      markTopicComplete(topic.slug);
    } else {
      markTopicIncomplete(topic.slug);
    }
    // Refresh completed topics set
    setCompletedTopics(getAllCompletedTopics());
  }, [topic.slug]);

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Mobile toggle button - only visible below 1024px */}
      <div className="lg:hidden flex items-center px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
        <button
          onClick={() => setNavOpen(true)}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 transition-colors hamburger-icon"
          aria-label="Open topic navigator"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          Topics
        </button>
      </div>

      {/* Mobile overlay backdrop - visible when nav is open on small screens */}
      {navOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Left Panel - Topic Navigator */}
      <aside
        className={`
          ${navOpen ? 'fixed inset-y-0 left-0 z-50' : 'hidden'}
          ${sidebarHidden ? '' : 'lg:relative lg:z-auto lg:block'}
          flex-shrink-0 overflow-y-auto border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900
        `}
        style={{ width: navOpen ? '320px' : `${sidebarWidth}px` }}
      >
        {/* Mobile close button */}
        <div className="lg:hidden flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Topics</span>
          <button
            onClick={() => setNavOpen(false)}
            className="p-1.5 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:rotate-90"
            aria-label="Close topic navigator"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <TopicNavigator
          parts={parts}
          activeTopic={activeTopic}
          onTopicSelect={handleTopicSelect}
          completedTopics={completedTopics}
        />
      </aside>

      {/* Sidebar Resize Handle */}
      {!sidebarHidden && (
        <div className="hidden lg:block">
          <ResizeHandle
            direction="horizontal"
            onResize={(delta) => setSidebarWidth(w => Math.max(200, Math.min(600, w + delta)))}
          />
        </div>
      )}

      {/* Right Panel - Content */}
      <main className="flex-1 overflow-hidden min-h-0">
        <ContentPanel
          key={topic.slug}
          topic={topic}
          onCompletionChange={handleCompletionChange}
          onNavigatePrev={handleNavigatePrev}
          onNavigateNext={handleNavigateNext}
          hasPrev={hasPrev}
          hasNext={hasNext}
          partTitle={parts.find(p => p.slug === topic.partSlug)?.title}
          moduleTitle={parts.find(p => p.slug === topic.partSlug)?.modules.find(m => m.slug === topic.moduleSlug)?.title}
          onToggleFullscreen={() => setSidebarHidden(s => !s)}
        />
      </main>
      <TourGuide />
      <KeyboardShortcuts />
      <CommandPalette topics={paletteTopics} />
    </div>
  );
}
