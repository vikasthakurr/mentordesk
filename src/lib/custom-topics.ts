/**
 * Custom Topics — Allows users to create their own subtopics within any module.
 * Stored in localStorage so they persist across sessions.
 */

import type { TopicMeta } from '@/types';

const CUSTOM_TOPICS_KEY = 'mern-platform:custom-topics';

export interface CustomTopicEntry {
  partSlug: string;
  moduleSlug: string;
  topic: TopicMeta;
}

/**
 * Get all custom topics from localStorage.
 */
export function getAllCustomTopics(): CustomTopicEntry[] {
  try {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(CUSTOM_TOPICS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Get custom topics for a specific module.
 */
export function getCustomTopicsForModule(partSlug: string, moduleSlug: string): TopicMeta[] {
  const all = getAllCustomTopics();
  return all
    .filter(entry => entry.partSlug === partSlug && entry.moduleSlug === moduleSlug)
    .map(entry => entry.topic);
}

/**
 * Add a custom topic to a module.
 */
export function addCustomTopic(partSlug: string, moduleSlug: string, title: string): TopicMeta | null {
  try {
    const slug = title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-{2,}/g, '-')
      .replace(/^-+|-+$/g, '') + '-custom';

    const existing = getAllCustomTopics();

    // Check if slug already exists in this module
    if (existing.some(e => e.partSlug === partSlug && e.moduleSlug === moduleSlug && e.topic.slug === slug)) {
      return null;
    }

    const topic: TopicMeta = {
      slug,
      title,
      type: 'code',
      order: 999 + existing.filter(e => e.partSlug === partSlug && e.moduleSlug === moduleSlug).length,
    };

    const entry: CustomTopicEntry = { partSlug, moduleSlug, topic };
    existing.push(entry);
    localStorage.setItem(CUSTOM_TOPICS_KEY, JSON.stringify(existing));

    return topic;
  } catch {
    return null;
  }
}

/**
 * Remove a custom topic.
 */
export function removeCustomTopic(partSlug: string, moduleSlug: string, topicSlug: string): boolean {
  try {
    const existing = getAllCustomTopics();
    const filtered = existing.filter(
      e => !(e.partSlug === partSlug && e.moduleSlug === moduleSlug && e.topic.slug === topicSlug)
    );
    localStorage.setItem(CUSTOM_TOPICS_KEY, JSON.stringify(filtered));
    return true;
  } catch {
    return false;
  }
}
