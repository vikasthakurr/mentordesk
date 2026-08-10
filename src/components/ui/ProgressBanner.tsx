'use client';
import { useState, useEffect } from 'react';
import { getAllCompletedTopics } from '@/lib/progress';
import { getAllParts } from '@/lib/courses';

export default function ProgressBanner() {
  const [stats, setStats] = useState({ completed: 0, total: 0 });
  
  useEffect(() => {
    const completed = getAllCompletedTopics();
    const parts = getAllParts();
    const total = parts.reduce((sum, p) => sum + p.modules.reduce((s, m) => s + m.topics.length, 0), 0);
    setStats({ completed: completed.size, total });
  }, []);

  if (stats.completed === 0) return null;

  const pct = Math.round((stats.completed / stats.total) * 100);
  
  return (
    <div className="max-w-7xl mx-auto px-6 mb-8">
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex items-center gap-4">
        <div className="flex-1">
          <p className="text-sm text-gray-300">Your Progress</p>
          <p className="text-lg font-semibold text-white">{stats.completed} / {stats.total} topics completed ({pct}%)</p>
        </div>
        <div className="w-48 h-3 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}
