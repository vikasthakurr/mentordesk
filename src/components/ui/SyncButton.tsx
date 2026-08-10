'use client';

import { useState } from 'react';
import { syncAllToMongo } from '@/lib/api-client';

export default function SyncButton() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setResult(null);
    const res = await syncAllToMongo();
    setSyncing(false);
    if (res.success) {
      setResult(`Synced: ${res.synced?.batches || 0} batches, ${res.synced?.progress || 0} progress, ${res.synced?.code || 0} code entries`);
    } else {
      setResult('Sync failed. Check console.');
    }
    setTimeout(() => setResult(null), 5000);
  };

  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={handleSync}
        disabled={syncing}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 disabled:opacity-50 transition-colors"
      >
        {syncing ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Syncing...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Sync to Cloud
          </>
        )}
      </button>
      {result && (
        <span className="text-xs text-emerald-400">{result}</span>
      )}
    </div>
  );
}
