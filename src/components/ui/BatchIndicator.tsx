'use client';

import { useState, useEffect } from 'react';
import { getCurrentBatch, getAllBatches } from '@/lib/batch';

export default function BatchIndicator() {
  const [batchName, setBatchName] = useState('');

  useEffect(() => {
    const id = getCurrentBatch();
    const batches = getAllBatches();
    const batch = batches.find(b => b.id === id);
    setBatchName(batch?.name || 'Default');
  }, []);

  if (!batchName || batchName === 'Default') return null;

  return (
    <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">
      {batchName}
    </span>
  );
}
