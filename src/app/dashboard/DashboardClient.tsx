'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

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

  const loadStudents = async (batch: string) => {
    if (!batch) return;
    setLoading(true);
    const res = await fetch(`/api/dashboard?batchId=${encodeURIComponent(batch)}`);
    const data = await res.json();
    setStudents(data.students || []);
    setLoading(false);
  };

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
          </div>
        </div>

        {loading && <p className="text-gray-500">Loading...</p>}

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
      </div>
    </div>
  );
}
