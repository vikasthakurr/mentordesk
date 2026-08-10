/**
 * API client for syncing data with MongoDB.
 * Uses a write-through pattern: localStorage for instant UX, API for persistence.
 */

export async function fetchProgress(batchId: string): Promise<string[]> {
  try {
    const res = await fetch(`/api/progress?batchId=${encodeURIComponent(batchId)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.topics || [];
  } catch {
    return [];
  }
}

export async function syncProgress(batchId: string, topicSlug: string, completed: boolean): Promise<void> {
  try {
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batchId, topicSlug, completed }),
    });
  } catch {
    // Silently fail - localStorage still has the data
  }
}

export async function fetchSavedCode(batchId: string, topicSlug: string): Promise<any | null> {
  try {
    const res = await fetch(`/api/code?batchId=${encodeURIComponent(batchId)}&topicSlug=${encodeURIComponent(topicSlug)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.found ? data : null;
  } catch {
    return null;
  }
}

export async function syncSavedCode(data: {
  batchId: string;
  topicSlug: string;
  partSlug: string;
  moduleSlug: string;
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  tsCode: string;
  drawingData?: string;
}): Promise<void> {
  try {
    await fetch('/api/code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch {
    // Silently fail
  }
}

export async function fetchBatches(): Promise<any[]> {
  try {
    const res = await fetch('/api/batches');
    if (!res.ok) return [];
    const data = await res.json();
    return data.batches || [];
  } catch {
    return [];
  }
}

export async function createBatch(name: string): Promise<any | null> {
  try {
    const res = await fetch('/api/batches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.batch;
  } catch {
    return null;
  }
}

export async function deleteBatchApi(batchId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/batches?batchId=${encodeURIComponent(batchId)}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Sync ALL localStorage data to MongoDB in one bulk request.
 * Gathers batches, progress, and saved code from localStorage and pushes to DB.
 */
export async function syncAllToMongo(): Promise<{ success: boolean; synced?: any }> {
  try {
    // Gather batches
    const batchesRaw = localStorage.getItem('mern-platform:batches');
    const batches = batchesRaw ? JSON.parse(batchesRaw) : [];

    // Gather progress (all keys matching mern-platform:progress:*)
    const progress: { batchId: string; topicSlug: string }[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('mern-platform:progress:')) {
        if (localStorage.getItem(key) === '1') {
          // Key format: mern-platform:progress:{batch}:{topicSlug}
          const parts = key.replace('mern-platform:progress:', '').split(':');
          if (parts.length >= 2) {
            progress.push({ batchId: parts[0], topicSlug: parts.slice(1).join(':') });
          }
        }
      }
    }

    // Gather saved code (all keys matching mern-platform:{batch}:{part}:{module}:{topic}:code:*)
    const codeMap = new Map<string, any>();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith('mern-platform:')) continue;
      if (key.includes(':progress:')) continue;
      if (key === 'mern-platform:batches' || key === 'mern-platform:current-batch' || key === 'mern-platform:theme' || key.includes(':tour-completed:') || key === 'mern-platform:custom-topics') continue;

      // Try to parse code keys: mern-platform:{batch}:{part}:{module}:{topic}:code:{file}
      const withoutPrefix = key.replace('mern-platform:', '');
      const segments = withoutPrefix.split(':');
      if (segments.length >= 5 && segments[4] === 'code') {
        const batchId = segments[0];
        const partSlug = segments[1];
        const moduleSlug = segments[2];
        const topicSlug = segments[3];
        const fileType = segments[5]; // html, css, js, ts
        const mapKey = `${batchId}:${topicSlug}`;

        if (!codeMap.has(mapKey)) {
          codeMap.set(mapKey, { batchId, topicSlug, partSlug, moduleSlug, htmlCode: '', cssCode: '', jsCode: '', tsCode: '', drawingData: '' });
        }
        const entry = codeMap.get(mapKey);
        const value = localStorage.getItem(key) || '';
        if (fileType === 'html') entry.htmlCode = value;
        else if (fileType === 'css') entry.cssCode = value;
        else if (fileType === 'js') entry.jsCode = value;
        else if (fileType === 'ts') entry.tsCode = value;
      }

      // Drawing data: mern-platform:{batch}:{part}:{module}:{topic}:diagram:canvas
      if (segments.length >= 5 && segments[4] === 'diagram') {
        const batchId = segments[0];
        const partSlug = segments[1];
        const moduleSlug = segments[2];
        const topicSlug = segments[3];
        const mapKey = `${batchId}:${topicSlug}`;

        if (!codeMap.has(mapKey)) {
          codeMap.set(mapKey, { batchId, topicSlug, partSlug, moduleSlug, htmlCode: '', cssCode: '', jsCode: '', tsCode: '', drawingData: '' });
        }
        const entry = codeMap.get(mapKey);
        entry.drawingData = localStorage.getItem(key) || '';
      }
    }

    const code = Array.from(codeMap.values());

    const res = await fetch('/api/sync-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batches, progress, code }),
    });

    if (!res.ok) return { success: false };
    const data = await res.json();
    return { success: true, synced: data.synced };
  } catch (e) {
    console.error('Sync failed:', e);
    return { success: false };
  }
}
