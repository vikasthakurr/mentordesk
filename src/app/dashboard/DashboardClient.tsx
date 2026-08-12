'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import RoleManager from '@/components/ui/RoleManager';

interface Student {
  name: string;
  email: string;
  image?: string;
  completedTopics: number;
}

export default function DashboardClient() {
  const { data: session } = useSession();
  const [batchId, setBatchId] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'students' | 'roles'>('students');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadStudents = useCallback(async (batch: string) => {
    if (!batch) return;
    setLoading(true);
    const res = await fetch(`/api/dashboard?batchId=${encodeURIComponent(batch)}`);
    const data = await res.json();
    setStudents(data.students || []);
    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  // Auto-refresh polling every 10 seconds when enabled
  useEffect(() => {
    if (!autoRefresh || !batchId) return;
    const interval = setInterval(() => {
      loadStudents(batchId);
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, batchId, loadStudents]);

  if ((session?.user as any)?.role !== 'mentor') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <p className="text-gray-500">Only mentors can access the dashboard.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mentor Dashboard</h1>
          <Link href="/" className="text-sm text-blue-600 hover:underline">← Back</Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'students'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Students
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'roles'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            User Roles
          </button>
        </div>

        {/* Students Tab */}
        {activeTab === 'students' && (
          <>
            <div className="mb-6">
              <label className="text-sm text-gray-500 mb-2 block">Enter Batch ID to view students:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  placeholder="e.g., fsrnl-71"
                  className="flex-1 px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
                <button
                  onClick={() => loadStudents(batchId)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500"
                >
                  Load
                </button>
                {students.length > 0 && (
                  <a
                    href={`/api/dashboard/export?batchId=${encodeURIComponent(batchId)}`}
                    download
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 inline-flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    CSV
                  </a>
                )}
              </div>
            </div>

            {loading && <p className="text-gray-500">Loading...</p>}

            {/* Auto-refresh toggle + last updated */}
            {students.length > 0 && (
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Live refresh (10s)
                  </label>
                  {autoRefresh && (
                    <span className="inline-flex items-center gap-1 text-xs text-green-600">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      Live
                    </span>
                  )}
                </div>
                {lastUpdated && (
                  <span className="text-xs text-gray-400">
                    Updated: {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </div>
            )}

            {students.length > 0 && (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400">Student</th>
                      <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400">Email</th>
                      <th className="text-right px-4 py-3 text-gray-600 dark:text-gray-400">Topics Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.email} className="border-t border-gray-100 dark:border-gray-800">
                        <td className="px-4 py-3 flex items-center gap-2">
                          {s.image && <img src={s.image} alt="" className="w-6 h-6 rounded-full" />}
                          <span className="text-gray-900 dark:text-white">{s.name}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{s.email}</td>
                        <td className="px-4 py-3 text-right font-medium text-green-600">{s.completedTopics}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && students.length === 0 && batchId && (
              <p className="text-gray-500 text-sm">No students found in this batch. Share the invite link with students first.</p>
            )}
          </>
        )}

        {/* Roles Tab */}
        {activeTab === 'roles' && <RoleManager />}
      </div>
    </div>
  );
}
