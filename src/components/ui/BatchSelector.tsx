'use client';

import { useState, useEffect } from 'react';
import { getAllBatches, getCurrentBatch, setCurrentBatch, addBatch, deleteBatch, Batch } from '@/lib/batch';

export default function BatchSelector() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [currentBatchId, setCurrentBatchId] = useState('default');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    setBatches(getAllBatches());
    setCurrentBatchId(getCurrentBatch());
  }, []);

  const handleSwitch = (batchId: string) => {
    setCurrentBatch(batchId);
    setCurrentBatchId(batchId);
    // Reload to apply new batch context
    window.location.reload();
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    const batch = addBatch(newName.trim());
    setBatches(getAllBatches());
    setNewName('');
    setShowAdd(false);
    handleSwitch(batch.id);
  };

  const handleDelete = (batchId: string) => {
    if (!confirm(`Delete batch "${batches.find(b => b.id === batchId)?.name}"? This won't delete saved code.`)) return;
    deleteBatch(batchId);
    setBatches(getAllBatches());
    if (currentBatchId === batchId) {
      handleSwitch('default');
    }
  };

  return (
    <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2">
        <select
          value={currentBatchId}
          onChange={(e) => handleSwitch(e.target.value)}
          className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
        >
          {batches.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        <button
          onClick={() => setShowAdd(true)}
          className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
          title="Add new batch"
        >
          +
        </button>
        {currentBatchId !== 'default' && (
          <button
            onClick={() => handleDelete(currentBatchId)}
            className="px-1.5 py-1 text-xs text-red-500 hover:text-red-700"
            title="Delete current batch"
          >
            🗑️
          </button>
        )}
      </div>
      {showAdd && (
        <div className="flex items-center gap-1 mt-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setShowAdd(false); }}
            placeholder="Batch name (e.g., FSRNL-71)"
            autoFocus
            className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-blue-400 dark:bg-gray-800 dark:text-gray-200"
          />
          <button onClick={handleAdd} className="px-2 py-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600">Create</button>
          <button onClick={() => setShowAdd(false)} className="px-1 py-1 text-xs text-gray-500">✕</button>
        </div>
      )}
    </div>
  );
}
