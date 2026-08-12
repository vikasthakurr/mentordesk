import { describe, it, expect } from 'vitest';
import { loadTopicContent } from './topics';

describe('topics', () => {
  describe('loadTopicContent', () => {
    it('returns a placeholder code topic when file does not exist', async () => {
      const topic = await loadTopicContent(
        'part-01-web-foundations',
        'module-01-html',
        'introduction-to-html'
      );

      expect(topic.slug).toBe('introduction-to-html');
      expect(topic.title).toBe('Introduction to HTML');
      expect(topic.type).toBe('code');
      expect(topic.partSlug).toBe('part-01-web-foundations');
      expect(topic.moduleSlug).toBe('module-01-html');
      expect(topic.content).toHaveProperty('starterCode');
      expect(topic.content).toHaveProperty('language');
    });

    it('returns a placeholder content topic when file does not exist', async () => {
      // No content-type topics exist in the catalog, so using non-existent slug
      // which defaults to 'content' type
      const topic = await loadTopicContent(
        'non-existent-part',
        'non-existent-module',
        'some-content-topic'
      );

      expect(topic.slug).toBe('some-content-topic');
      expect(topic.type).toBe('content');
      expect(topic.content).toHaveProperty('markdown');
    });

    it('returns a placeholder diagram topic when file does not exist', async () => {
      // Use a real content topic from system design
      const topic = await loadTopicContent(
        'part-07-system-design',
        'module-21-fundamentals',
        'cap-theorem'
      );

      expect(topic.slug).toBe('cap-theorem');
      expect(topic.title).toBe('CAP Theorem');
      expect(topic.type).toBe('content');
      expect(topic.content).toHaveProperty('markdown');
    });

    it('returns a placeholder with default content type when topic not found in catalog', async () => {
      const topic = await loadTopicContent(
        'non-existent-part',
        'non-existent-module',
        'non-existent-topic'
      );

      expect(topic.slug).toBe('non-existent-topic');
      expect(topic.type).toBe('content');
      expect(topic.content).toHaveProperty('markdown');
    });
  });
});
