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
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-500 transition-colors"
    >
      ▶ Resume where you left off
    </Link>
  );
}
