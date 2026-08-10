'use client';

import { TopicMeta, ExerciseType } from '@/types';

export interface TopicItemProps {
  topic: TopicMeta;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
}

const exerciseEmojiMap: Record<ExerciseType, string> = {
  art: '🎨',
  build: '🛠️',
  challenge: '🧩',
};

export function TopicItem({ topic, isActive, isCompleted, onClick }: TopicItemProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  const emoji = topic.exerciseType ? exerciseEmojiMap[topic.exerciseType] : null;

  return (
    <button
      type="button"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`w-full text-left px-3 py-1.5 rounded text-sm flex items-center gap-1.5 transition-colors cursor-pointer ${
        isActive
          ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-200 font-medium'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
      }`}
      aria-current={isActive ? 'true' : undefined}
    >
      {emoji && <span className="flex-shrink-0" aria-label={`${topic.exerciseType} exercise`}>{emoji}</span>}
      <span className="truncate flex-1">{topic.title}</span>
      {isCompleted && (
        <span className="flex-shrink-0 text-green-600" aria-label="Completed">✓</span>
      )}
    </button>
  );
}
