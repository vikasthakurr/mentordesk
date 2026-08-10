'use client';

import { useState, useEffect } from 'react';
import { getAllBatches, getCurrentBatch, setCurrentBatch, addBatch, deleteBatch, Batch } from '@/lib/batch';
import { fetchBatches, createBatch as createBatchApi, deleteBatchApi } from '@/lib/api-client';

export default function HomeBatchManager() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [currentBatchId, setCurrentBatchId] = useState('default');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    setBatches(getAllBatches());
    setCurrentBatchId(getCurrentBatch());
    // Also sync from API
    fetchBatches().then(apiBatches => {
      if (apiBatches.length > 0) {
        // Merge API batches with local
        const localBatches = getAllBatches();
        const merged = [...localBatches];
        for (const ab of apiBatches) {
          if (!merged.find(b => b.id === ab.batchId)) {
            merged.push({ id: ab.batchId, name: ab.name, createdAt: new Date(ab.createdAt).getTime() });
          }
        }
        setBatches(merged);
      }
    });
  }, []);

  const handleSwitch = (batchId: string) => {
    setCurrentBatch(batchId);
    setCurrentBatchId(batchId);
    window.location.reload();
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    const batch = addBatch(newName.trim());
    setBatches(getAllBatches());
    setNewName('');
    setShowAdd(false);
    // Sync to MongoDB
    createBatchApi(newName.trim());
    handleSwitch(batch.id);
  };

  const handleDelete = (batchId: string) => {
    if (!confirm(`Delete batch "${batches.find(b => b.id === batchId)?.name}"?`)) return;
    deleteBatch(batchId);
    deleteBatchApi(batchId); // Sync to MongoDB
    setBatches(getAllBatches());
    if (currentBatchId === batchId) {
      handleSwitch('default');
    }
  };

  const currentBatch = batches.find(b => b.id === currentBatchId);

  return (
    <div className="flex items-center gap-2">
      {/* Current batch display */}
      <div className="flex items-center gap-2">
        <select
          value={currentBatchId}
          onChange={(e) => handleSwitch(e.target.value)}
          className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:border-blue-400"
        >
          {batches.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        {/* Add batch button */}
        <button
          onClick={() => setShowAdd(true)}
          className="px-3 py-1.5 text-sm font-medium text-blue-400 bg-blue-500/10 border border-blue-500/30 rounded-lg hover:bg-blue-500/20 transition-colors"
          title="Create new batch"
        >
          + New Batch
        </button>

        {/* Delete current batch */}
        {currentBatchId !== 'default' && (
          <button
            onClick={() => handleDelete(currentBatchId)}
            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Delete current batch"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}

        {/* Invite students */}
        {currentBatchId !== 'default' && (
          <button
            onClick={async () => {
              const res = await fetch('/api/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ batchId: currentBatchId }),
              });
              const data = await res.json();
              if (data.joinUrl) {
                const fullUrl = window.location.origin + data.joinUrl;
                navigator.clipboard.writeText(fullUrl);
                alert(`Invite link copied!\n${fullUrl}`);
              }
            }}
            className="px-3 py-1.5 text-sm font-medium text-green-400 bg-green-500/10 border border-green-500/30 rounded-lg hover:bg-green-500/20 transition-colors"
            title="Copy invite link"
          >
            📨 Invite
          </button>
        )}
      </div>

      {/* Add batch modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowAdd(false)}>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-96 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">Create New Batch</h3>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setShowAdd(false); }}
              placeholder="Enter batch name (e.g., FSRNL-71)"
              autoFocus
              className="w-full px-4 py-2.5 text-sm bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => { setShowAdd(false); setNewName(''); }}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!newName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create Batch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
