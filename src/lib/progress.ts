/**
 * Progress tracking helpers for persisting topic completion state.
 *
 * Key format: mern-platform:progress:{batch}:{topicSlug}
 * Value: "1" for completed, key absent for incomplete
 *
 * All functions gracefully handle:
 * - localStorage not available (SSR or restricted environments)
 * - QuotaExceededError when storage is full
 */

import { getAllParts } from '@/lib/courses';
import { getCurrentBatch } from './batch';
import type { Part } from '@/types';

function getProgressPrefix(): string {
  const batch = typeof window !== 'undefined' ? getCurrentBatch() : 'default';
  return `mern-platform:progress:${batch}:`;
}

/**
 * Checks if localStorage is available in the current environment.
 */
export function isStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const storage = window.localStorage;
    const testKey = '__local_storage_test__';
    storage.setItem(testKey, 'test');
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Marks a topic as completed in local storage.
 * Returns true if successful, false if storage is unavailable or quota exceeded.
 */
export function markTopicComplete(topicSlug: string): boolean {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    localStorage.setItem(`${getProgressPrefix()}${topicSlug}`, '1');
    return true;
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn(
        'Local storage quota exceeded. Progress will not be saved.'
      );
    }
    return false;
  }
}

/**
 * Marks a topic as incomplete by removing the key from local storage.
 */
export function markTopicIncomplete(topicSlug: string): void {
  if (!isStorageAvailable()) {
    return;
  }

  try {
    localStorage.removeItem(`${getProgressPrefix()}${topicSlug}`);
  } catch {
    // Silently ignore errors when clearing
  }
}

/**
 * Checks if a topic is marked as completed.
 */
export function isTopicComplete(topicSlug: string): boolean {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    return localStorage.getItem(`${getProgressPrefix()}${topicSlug}`) === '1';
  } catch {
    return false;
  }
}

/**
 * Returns module-level progress: how many topics are completed out of total.
 * Requires partSlug to locate the module in the course data.
 */
export function getModuleProgress(
  moduleSlug: string,
  partSlug: string
): { completed: number; total: number } {
  const parts = getAllParts();
  const part = parts.find((p: Part) => p.slug === partSlug);
  if (!part) return { completed: 0, total: 0 };

  const mod = part.modules.find((m) => m.slug === moduleSlug);
  if (!mod) return { completed: 0, total: 0 };

  const total = mod.topics.length;
  let completed = 0;

  for (const topic of mod.topics) {
    if (isTopicComplete(topic.slug)) {
      completed++;
    }
  }

  return { completed, total };
}

/**
 * Returns part-level progress: how many modules are fully completed out of total.
 * A module is considered complete when all of its topics are marked as completed.
 */
export function getPartProgress(
  partSlug: string
): { completedModules: number; totalModules: number } {
  const parts = getAllParts();
  const part = parts.find((p: Part) => p.slug === partSlug);
  if (!part) return { completedModules: 0, totalModules: 0 };

  const totalModules = part.modules.length;
  let completedModules = 0;

  for (const mod of part.modules) {
    if (mod.topics.length === 0) continue;

    const allComplete = mod.topics.every((topic) => isTopicComplete(topic.slug));
    if (allComplete) {
      completedModules++;
    }
  }

  return { completedModules, totalModules };
}

/**
 * Returns a Set of all topic slugs that are marked as completed.
 * Scans localStorage for all keys matching the progress prefix.
 */
export function getAllCompletedTopics(): Set<string> {
  const completed = new Set<string>();

  if (!isStorageAvailable()) {
    return completed;
  }

  try {
    const prefix = getProgressPrefix();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        if (localStorage.getItem(key) === '1') {
          completed.add(key.slice(prefix.length));
        }
      }
    }
  } catch {
    // Return whatever we collected so far
  }

  return completed;
}
