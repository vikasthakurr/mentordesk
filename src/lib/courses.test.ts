import { describe, it, expect } from 'vitest';
import { getAllParts, getPartBySlug, getModuleBySlug, getTopicBySlug } from './courses';

describe('courses', () => {
  describe('getAllParts', () => {
    it('returns an array of all parts', () => {
      const parts = getAllParts();
      expect(Array.isArray(parts)).toBe(true);
      expect(parts.length).toBeGreaterThan(0);
    });

    it('each part has required fields', () => {
      const parts = getAllParts();
      for (const part of parts) {
        expect(part).toHaveProperty('slug');
        expect(part).toHaveProperty('partNumber');
        expect(part).toHaveProperty('title');
        expect(part).toHaveProperty('modules');
      }
    });
  });

  describe('getPartBySlug', () => {
    it('returns a part when slug matches', () => {
      const part = getPartBySlug('part-01-web-foundations');
      expect(part).toBeDefined();
      expect(part!.title).toBe('Web Foundations');
      expect(part!.partNumber).toBe(1);
    });

    it('returns undefined for non-existent slug', () => {
      const part = getPartBySlug('non-existent-part');
      expect(part).toBeUndefined();
    });
  });

  describe('getModuleBySlug', () => {
    it('returns a module when both slugs match', () => {
      const mod = getModuleBySlug('part-01-web-foundations', 'module-01-html');
      expect(mod).toBeDefined();
      expect(mod!.title).toBe('HTML | Basics of Web Pages');
    });

    it('returns undefined for non-existent module slug', () => {
      const mod = getModuleBySlug('part-01-web-foundations', 'non-existent-module');
      expect(mod).toBeUndefined();
    });

    it('returns undefined for non-existent part slug', () => {
      const mod = getModuleBySlug('non-existent-part', 'module-01-html');
      expect(mod).toBeUndefined();
    });
  });

  describe('getTopicBySlug', () => {
    it('returns topic metadata when all slugs match', () => {
      const topic = getTopicBySlug('part-01-web-foundations', 'module-01-html', 'intro-to-html');
      expect(topic).toBeDefined();
      expect(topic!.title).toBe('Introduction to HTML');
      expect(topic!.type).toBe('content');
    });

    it('returns undefined for non-existent topic slug', () => {
      const topic = getTopicBySlug('part-01-web-foundations', 'module-01-html', 'non-existent');
      expect(topic).toBeUndefined();
    });

    it('returns undefined for non-existent module slug', () => {
      const topic = getTopicBySlug('part-01-web-foundations', 'non-existent', 'intro-to-html');
      expect(topic).toBeUndefined();
    });

    it('returns undefined for non-existent part slug', () => {
      const topic = getTopicBySlug('non-existent', 'module-01-html', 'intro-to-html');
      expect(topic).toBeUndefined();
    });
  });
});
