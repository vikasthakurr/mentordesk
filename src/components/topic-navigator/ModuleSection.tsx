'use client';

import { useState, useEffect } from 'react';
import { ModuleSectionProps, TopicMeta } from '@/types';
import { TopicItem } from './TopicItem';
import { getCustomTopicsForModule, addCustomTopic, removeCustomTopic } from '@/lib/custom-topics';

export interface ModuleSectionExtendedProps extends ModuleSectionProps {
  completedTopics?: Set<string>;
}

export function ModuleSection({
  module,
  partSlug,
  activeTopic,
  isExpanded,
  onToggle,
  onTopicSelect,
  completedTopics = new Set(),
}: ModuleSectionExtendedProps) {
  const [customTopics, setCustomTopics] = useState<TopicMeta[]>([]);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');

  // Load custom topics for this module
  useEffect(() => {
    setCustomTopics(getCustomTopicsForModule(partSlug, module.slug));
  }, [partSlug, module.slug]);

  const allTopics = [...module.topics, ...customTopics];
  const totalTopics = allTopics.length;
  const completedCount = allTopics.filter((t) => completedTopics.has(t.slug)).length;

  const handleAddTopic = () => {
    if (!newTopicTitle.trim()) return;
    const topic = addCustomTopic(partSlug, module.slug, newTopicTitle.trim());
    if (topic) {
      setCustomTopics(prev => [...prev, topic]);
      setNewTopicTitle('');
      setShowAddInput(false);
    }
  };

  const handleDeleteTopic = (topicSlug: string) => {
    removeCustomTopic(partSlug, module.slug, topicSlug);
    setCustomTopics(prev => prev.filter(t => t.slug !== topicSlug));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAddTopic();
    if (e.key === 'Escape') {
      setShowAddInput(false);
      setNewTopicTitle('');
    }
  };

  return (
    <div className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="w-full flex items-center justify-between px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
      >
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate block">
            Module {module.moduleId} · {module.title}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {totalTopics} {totalTopics === 1 ? 'topic' : 'topics'}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {completedCount}/{totalTopics} completed
            </span>
          </div>
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
        <div className="pl-4 pr-2 pb-2 space-y-0.5">
          {allTopics.map((topic) => (
            <div key={topic.slug} className="group/topic flex items-center">
              <div className="flex-1 min-w-0">
                <TopicItem
                  topic={topic}
                  isActive={topic.slug === activeTopic}
                  isCompleted={completedTopics.has(topic.slug)}
                  onClick={() => onTopicSelect(partSlug, module.slug, topic.slug)}
                />
              </div>
              {topic.slug.endsWith('-custom') && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteTopic(topic.slug); }}
                  className="opacity-0 group-hover/topic:opacity-100 px-1.5 py-0.5 text-xs text-gray-400 hover:text-red-500 transition-opacity"
                  title="Delete custom topic"
                >
                  ×
                </button>
              )}
            </div>
          ))}

          {/* Add Topic UI */}
          {showAddInput ? (
            <div className="flex items-center gap-1 mt-1 px-1">
              <input
                type="text"
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Topic name..."
                autoFocus
                className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-blue-400"
              />
              <button
                onClick={handleAddTopic}
                className="px-2 py-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600"
              >
                Add
              </button>
              <button
                onClick={() => { setShowAddInput(false); setNewTopicTitle(''); }}
                className="px-1.5 py-1 text-xs text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); setShowAddInput(true); }}
              className="flex items-center gap-1 mt-1 px-3 py-1 text-xs text-gray-400 hover:text-blue-500 transition-colors w-full text-left"
            >
              <span>+</span> Add topic
            </button>
          )}
        </div>
      )}
    </div>
  );
}
