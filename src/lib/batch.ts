'use client';

const BATCH_KEY = 'mern-platform:current-batch';
const BATCHES_KEY = 'mern-platform:batches';

export interface Batch {
  id: string;
  name: string;
  createdAt: number;
}

export function getCurrentBatch(): string {
  if (typeof window === 'undefined') return 'default';
  try {
    return localStorage.getItem(BATCH_KEY) || 'default';
  } catch {
    return 'default';
  }
}

export function setCurrentBatch(batchId: string): void {
  localStorage.setItem(BATCH_KEY, batchId);
}

export function getAllBatches(): Batch[] {
  try {
    const raw = localStorage.getItem(BATCHES_KEY);
    if (!raw) return [{ id: 'default', name: 'Default', createdAt: 0 }];
    const batches = JSON.parse(raw) as Batch[];
    return batches.length > 0 ? batches : [{ id: 'default', name: 'Default', createdAt: 0 }];
  } catch {
    return [{ id: 'default', name: 'Default', createdAt: 0 }];
  }
}

export function addBatch(name: string): Batch {
  const batches = getAllBatches();
  const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const batch: Batch = { id, name, createdAt: Date.now() };
  batches.push(batch);
  localStorage.setItem(BATCHES_KEY, JSON.stringify(batches));
  return batch;
}

export function deleteBatch(batchId: string): void {
  if (batchId === 'default') return;
  const batches = getAllBatches().filter(b => b.id !== batchId);
  localStorage.setItem(BATCHES_KEY, JSON.stringify(batches));
  if (getCurrentBatch() === batchId) {
    setCurrentBatch('default');
  }
}

/**
 * Generate a storage key that includes the batch prefix.
 * This ensures each batch has isolated data.
 */
export function getBatchPrefix(): string {
  return `[${getCurrentBatch()}]`;
}
