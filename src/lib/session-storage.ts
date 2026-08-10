/**
 * Session storage helpers for persisting user code and diagram state.
 *
 * Key format: mern-platform:{batch}:{partSlug}:{moduleSlug}:{topicSlug}:{type}
 * where type is "code" or "diagram"
 *
 * All functions gracefully handle:
 * - sessionStorage not available (SSR or restricted environments)
 * - QuotaExceededError when storage is full
 * - Invalid/corrupted data when reading
 */

import { getCurrentBatch } from './batch';

/**
 * Builds a session storage key from topic path segments and content type.
 * Includes the current batch to isolate data per batch.
 */
export function buildStorageKey(
  partSlug: string,
  moduleSlug: string,
  topicSlug: string,
  type: 'code' | 'diagram'
): string {
  const batch = typeof window !== 'undefined' ? getCurrentBatch() : 'default';
  return `mern-platform:${batch}:${partSlug}:${moduleSlug}:${topicSlug}:${type}`;
}

/**
 * Checks if sessionStorage is available in the current environment.
 */
function isSessionStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const storage = window.sessionStorage;
    const testKey = '__session_storage_test__';
    storage.setItem(testKey, 'test');
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Saves code string to session storage.
 * Silently handles QuotaExceededError and unavailable storage.
 * Returns true if save was successful, false otherwise.
 */
export function saveCode(key: string, code: string): boolean {
  if (!isSessionStorageAvailable()) {
    return false;
  }

  try {
    sessionStorage.setItem(key, code);
    return true;
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn(
        'Session storage quota exceeded. Code changes will not be saved.'
      );
    }
    return false;
  }
}

/**
 * Loads code string from session storage.
 * Returns null if the key is not found or storage is unavailable.
 */
export function loadCode(key: string): string | null {
  if (!isSessionStorageAvailable()) {
    return null;
  }

  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Saves diagram elements array to session storage as a JSON string.
 * Silently handles QuotaExceededError and unavailable storage.
 * Returns true if save was successful, false otherwise.
 */
export function saveDiagram(key: string, elements: unknown[]): boolean {
  if (!isSessionStorageAvailable()) {
    return false;
  }

  try {
    const json = JSON.stringify(elements);
    sessionStorage.setItem(key, json);
    return true;
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn(
        'Session storage quota exceeded. Diagram changes will not be saved.'
      );
    }
    return false;
  }
}

/**
 * Loads diagram elements from session storage.
 * Returns null if the key is not found, storage is unavailable,
 * or if the stored data is invalid JSON.
 */
export function loadDiagram(key: string): unknown[] | null {
  if (!isSessionStorageAvailable()) {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(key);
    if (raw === null) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn(
        'Corrupted diagram data in session storage. Discarding invalid data.'
      );
      sessionStorage.removeItem(key);
      return null;
    }

    return parsed;
  } catch {
    // Invalid JSON — discard corrupted data
    console.warn(
      'Corrupted diagram data in session storage. Discarding invalid data.'
    );
    try {
      sessionStorage.removeItem(key);
    } catch {
      // ignore removal failure
    }
    return null;
  }
}

/**
 * Removes an entry from session storage.
 * Silently handles unavailable storage.
 */
export function clearEntry(key: string): void {
  if (!isSessionStorageAvailable()) {
    return;
  }

  try {
    sessionStorage.removeItem(key);
  } catch {
    // Silently ignore errors when clearing
  }
}
