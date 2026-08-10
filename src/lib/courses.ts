import type { Part, Module, TopicMeta, CourseCatalog } from '@/types';
import coursesData from '@/data/courses.json';

const catalog: CourseCatalog = coursesData as CourseCatalog;

/**
 * Returns all parts from the course catalog.
 */
export function getAllParts(): Part[] {
  return catalog.parts;
}

/**
 * Finds and returns a part by its slug.
 * Returns undefined if no matching part is found.
 */
export function getPartBySlug(slug: string): Part | undefined {
  return catalog.parts.find((part) => part.slug === slug);
}

/**
 * Finds a module within a specific part by their slugs.
 * Returns undefined if either the part or module is not found.
 */
export function getModuleBySlug(
  partSlug: string,
  moduleSlug: string
): Module | undefined {
  const part = getPartBySlug(partSlug);
  if (!part) return undefined;
  return part.modules.find((mod) => mod.slug === moduleSlug);
}

/**
 * Finds topic metadata within a specific module by slugs.
 * Returns undefined if the part, module, or topic is not found.
 */
export function getTopicBySlug(
  partSlug: string,
  moduleSlug: string,
  topicSlug: string
): TopicMeta | undefined {
  const mod = getModuleBySlug(partSlug, moduleSlug);
  if (!mod) return undefined;
  return mod.topics.find((topic) => topic.slug === topicSlug);
}
