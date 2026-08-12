'use client';

import { useState, useEffect } from 'react';
import { isBookmarked, toggleBookmark } from '@/lib/bookmarks';
import { useToast } from '@/components/ui/Toast';

interface BookmarkButtonProps {
  topicSlug: string;
  topicTitle?: string;
}

export default function BookmarkButton({ topicSlug, topicTitle }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setBookmarked(isBookmarked(topicSlug));
  }, [topicSlug]);

  const handleToggle = () => {
    const newState = toggleBookmark(topicSlug);
    setBookmarked(newState);
    toast(
      newState ? `Bookmarked "${topicTitle || topicSlug}"` : 'Bookmark removed',
      newState ? 'success' : 'info'
    );
  };

  return (
    <button
      onClick={handleToggle}
      className={`p-1.5 rounded-md transition-all hover:scale-110 active:scale-95 ${
        bookmarked
          ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
          : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
      title={bookmarked ? 'Remove bookmark' : 'Bookmark this topic'}
      aria-pressed={bookmarked}
    >
      <svg
        className="w-4 h-4"
        fill={bookmarked ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
    </button>
  );
}
