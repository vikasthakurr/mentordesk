import { describe, it, expect } from 'vitest';
import { loadTopicContent } from './topics';

describe('topics', () => {
  describe('loadTopicContent', () => {
    it('returns a placeholder code topic when file does not exist', async () => {
      const topic = await loadTopicContent(
        'part-01-web-foundations',
        'module-01-html',
        'html-elements'
      );

      expect(topic.slug).toBe('html-elements');
      expect(topic.title).toBe('HTML Elements');
      expect(topic.type).toBe('code');
      expect(topic.partSlug).toBe('part-01-web-foundations');
      expect(topic.moduleSlug).toBe('module-01-html');
      expect(topic.content).toHaveProperty('starterCode');
      expect(topic.content).toHaveProperty('language');
    });

    it('returns a placeholder content topic when file does not exist', async () => {
      const topic = await loadTopicContent(
        'part-01-web-foundations',
        'module-01-html',
        'intro-to-html'
      );

      expect(topic.slug).toBe('intro-to-html');
      expect(topic.title).toBe('Introduction to HTML');
      expect(topic.type).toBe('content');
      expect(topic.content).toHaveProperty('markdown');
    });

    it('returns a placeholder diagram topic when file does not exist', async () => {
      const topic = await loadTopicContent(
        'part-01-web-foundations',
        'module-01-html',
        'page-layout-diagram'
      );

      expect(topic.slug).toBe('page-layout-diagram');
      expect(topic.title).toBe('Page Layout Diagram');
      expect(topic.type).toBe('diagram');
      expect(topic.content).toHaveProperty('description');
      expect(topic.content).toHaveProperty('initialElements');
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
