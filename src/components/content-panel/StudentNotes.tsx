'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface StudentNotesProps {
  topicSlug: string;
  partSlug: string;
  moduleSlug: string;
}

export default function StudentNotes({ topicSlug, partSlug, moduleSlug }: StudentNotesProps) {
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load note on mount
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/notes?topicSlug=${encodeURIComponent(topicSlug)}`);
        if (res.ok) {
          const data = await res.json();
          setContent(data.content || '');
        }
      } catch {
        // Silently fail — user can still write, it just won't load old notes
      }
    };
    load();
  }, [topicSlug]);

  // Auto-save with debounce
  const saveNote = useCallback(async (text: string) => {
    setSaving(true);
    try {
      await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicSlug, partSlug, moduleSlug, content: text }),
      });
      setLastSaved(new Date());
    } catch {
      // Silent fail
    }
    setSaving(false);
  }, [topicSlug, partSlug, moduleSlug]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setContent(text);

    // Debounced save (2 seconds)
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => saveNote(text), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">My Notes</span>
        </div>
        <div className="flex items-center gap-2">
          {saving && (
            <span className="text-xs text-gray-400">Saving...</span>
          )}
          {!saving && lastSaved && (
            <span className="text-xs text-gray-400">
              Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      {/* Editor */}
      <textarea
        value={content}
        onChange={handleChange}
        placeholder="Write your notes here... (auto-saves)"
        className="flex-1 w-full p-4 text-sm text-gray-800 dark:text-gray-200 bg-transparent resize-none focus:outline-none placeholder-gray-400 dark:placeholder-gray-600 font-mono leading-relaxed"
        spellCheck={false}
      />
    </div>
  );
}
