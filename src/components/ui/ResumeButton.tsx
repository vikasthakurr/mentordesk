'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ResumeButton() {
  const [lastPath, setLastPath] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/last-visited')
      .then(r => r.json())
      .then(d => setLastPath(d.topic))
      .catch(() => {});
  }, []);

  if (!lastPath) return null;

  return (
    <Link
      href={lastPath}
      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-all hover:scale-105 active:scale-95"
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
      </svg>
      Resume where you left off
    </Link>
  );
}
