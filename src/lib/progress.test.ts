import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Polyfill localStorage for jsdom environments where it may not be mapped to window
function createLocalStoragePolyfill(): Storage {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = String(value); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (i: number) => Object.keys(store)[i] ?? null,
  };
}

if (typeof window !== 'undefined' && !window.localStorage) {
  Object.defineProperty(window, 'localStorage', {
    value: createLocalStoragePolyfill(),
    writable: true,
    configurable: true,
  });
}

import {
  isStorageAvailable,
  markTopicComplete,
  markTopicIncomplete,
  isTopicComplete,
  getModuleProgress,
  getPartProgress,
  getAllCompletedTopics,
} from './progress';

// Mock courses module to provide controlled test data
vi.mock('@/lib/courses', () => ({
  getAllParts: () => [
    {
      slug: 'part-01-web-foundations',
      partNumber: 1,
      title: 'Web Foundations',
      modules: [
        {
          slug: 'module-01-html',
          moduleId: '1',
          title: 'HTML | Basics of Web Pages',
          topicCount: 3,
          topics: [
            { slug: 'intro-to-html', title: 'Introduction to HTML', type: 'content', order: 1 },
            { slug: 'html-elements', title: 'HTML Elements', type: 'code', order: 2 },
            { slug: 'html-structure', title: 'HTML Structure', type: 'code', order: 3 },
          ],
        },
        {
          slug: 'module-02-css',
          moduleId: '2',
          title: 'CSS | Styling Web Pages',
          topicCount: 2,
          topics: [
            { slug: 'css-basics', title: 'CSS Basics', type: 'content', order: 1 },
            { slug: 'css-selectors', title: 'CSS Selectors', type: 'code', order: 2 },
          ],
        },
      ],
    },
    {
      slug: 'part-02-javascript',
      partNumber: 2,
      title: 'JavaScript',
      modules: [
        {
          slug: 'module-04-js-basics',
          moduleId: '4',
          title: 'JavaScript | Basics',
          topicCount: 2,
          topics: [
            { slug: 'js-variables', title: 'Variables', type: 'code', order: 1 },
            { slug: 'js-types', title: 'Types', type: 'content', order: 2 },
          ],
        },
      ],
    },
  ],
}));

describe('progress', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('isStorageAvailable', () => {
    it('returns true when localStorage is available', () => {
      expect(isStorageAvailable()).toBe(true);
    });
  });

  describe('markTopicComplete', () => {
    it('marks a topic as completed and returns true', () => {
      const result = markTopicComplete('intro-to-html');
      expect(result).toBe(true);
      expect(localStorage.getItem('mern-platform:progress:intro-to-html')).toBe('1');
    });

    it('overwrites previous value with "1"', () => {
      localStorage.setItem('mern-platform:progress:intro-to-html', 'old');
      markTopicComplete('intro-to-html');
      expect(localStorage.getItem('mern-platform:progress:intro-to-html')).toBe('1');
    });
  });

  describe('markTopicIncomplete', () => {
    it('removes the topic key from local storage', () => {
      markTopicComplete('intro-to-html');
      expect(isTopicComplete('intro-to-html')).toBe(true);

      markTopicIncomplete('intro-to-html');
      expect(isTopicComplete('intro-to-html')).toBe(false);
      expect(localStorage.getItem('mern-platform:progress:intro-to-html')).toBeNull();
    });

    it('does not throw when topic was never marked', () => {
      expect(() => markTopicIncomplete('nonexistent')).not.toThrow();
    });
  });

  describe('isTopicComplete', () => {
    it('returns true when topic is marked complete', () => {
      markTopicComplete('html-elements');
      expect(isTopicComplete('html-elements')).toBe(true);
    });

    it('returns false when topic is not marked', () => {
      expect(isTopicComplete('html-elements')).toBe(false);
    });

    it('returns false when key exists but value is not "1"', () => {
      localStorage.setItem('mern-platform:progress:html-elements', 'wrong');
      expect(isTopicComplete('html-elements')).toBe(false);
    });
  });

  describe('getModuleProgress', () => {
    it('returns 0/total when no topics are completed', () => {
      const progress = getModuleProgress('module-01-html', 'part-01-web-foundations');
      expect(progress).toEqual({ completed: 0, total: 3 });
    });

    it('counts completed topics correctly', () => {
      markTopicComplete('intro-to-html');
      markTopicComplete('html-elements');
      const progress = getModuleProgress('module-01-html', 'part-01-web-foundations');
      expect(progress).toEqual({ completed: 2, total: 3 });
    });

    it('returns all completed when all topics are done', () => {
      markTopicComplete('intro-to-html');
      markTopicComplete('html-elements');
      markTopicComplete('html-structure');
      const progress = getModuleProgress('module-01-html', 'part-01-web-foundations');
      expect(progress).toEqual({ completed: 3, total: 3 });
    });

    it('returns 0/0 for non-existent module', () => {
      const progress = getModuleProgress('nonexistent', 'part-01-web-foundations');
      expect(progress).toEqual({ completed: 0, total: 0 });
    });

    it('returns 0/0 for non-existent part', () => {
      const progress = getModuleProgress('module-01-html', 'nonexistent');
      expect(progress).toEqual({ completed: 0, total: 0 });
    });
  });

  describe('getPartProgress', () => {
    it('returns 0/total when no modules are fully completed', () => {
      const progress = getPartProgress('part-01-web-foundations');
      expect(progress).toEqual({ completedModules: 0, totalModules: 2 });
    });

    it('counts a module as complete only when all its topics are done', () => {
      // Complete all topics in module-01-html
      markTopicComplete('intro-to-html');
      markTopicComplete('html-elements');
      markTopicComplete('html-structure');

      const progress = getPartProgress('part-01-web-foundations');
      expect(progress).toEqual({ completedModules: 1, totalModules: 2 });
    });

    it('counts all modules complete when all topics in all modules are done', () => {
      // Complete all topics in module-01-html
      markTopicComplete('intro-to-html');
      markTopicComplete('html-elements');
      markTopicComplete('html-structure');
      // Complete all topics in module-02-css
      markTopicComplete('css-basics');
      markTopicComplete('css-selectors');

      const progress = getPartProgress('part-01-web-foundations');
      expect(progress).toEqual({ completedModules: 2, totalModules: 2 });
    });

    it('does not count partially completed modules', () => {
      markTopicComplete('intro-to-html');
      // Only 1 of 3 topics in module-01-html

      const progress = getPartProgress('part-01-web-foundations');
      expect(progress).toEqual({ completedModules: 0, totalModules: 2 });
    });

    it('returns 0/0 for non-existent part', () => {
      const progress = getPartProgress('nonexistent');
      expect(progress).toEqual({ completedModules: 0, totalModules: 0 });
    });
  });

  describe('getAllCompletedTopics', () => {
    it('returns empty set when no topics are completed', () => {
      const completed = getAllCompletedTopics();
      expect(completed.size).toBe(0);
    });

    it('returns all completed topic slugs', () => {
      markTopicComplete('intro-to-html');
      markTopicComplete('css-basics');

      const completed = getAllCompletedTopics();
      expect(completed.size).toBe(2);
      expect(completed.has('intro-to-html')).toBe(true);
      expect(completed.has('css-basics')).toBe(true);
    });

    it('does not include non-progress keys', () => {
      localStorage.setItem('mern-platform:something-else', '1');
      markTopicComplete('intro-to-html');

      const completed = getAllCompletedTopics();
      expect(completed.size).toBe(1);
      expect(completed.has('intro-to-html')).toBe(true);
    });

    it('does not include keys with value other than "1"', () => {
      localStorage.setItem('mern-platform:progress:bad-topic', 'not-1');
      markTopicComplete('intro-to-html');

      const completed = getAllCompletedTopics();
      expect(completed.size).toBe(1);
      expect(completed.has('intro-to-html')).toBe(true);
      expect(completed.has('bad-topic')).toBe(false);
    });
  });

  describe('QuotaExceededError handling', () => {
    const originalLocalStorage = window.localStorage;

    afterEach(() => {
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
        configurable: true,
      });
    });

    function createQuotaExceededStorage(): Storage {
      const store: Record<string, string> = {};
      let callCount = 0;
      return {
        getItem: (k: string) => store[k] ?? null,
        setItem: (_k: string, _v: string) => {
          callCount++;
          // Let the first call (availability check) pass
          if (callCount <= 1) {
            store[_k] = _v;
            return;
          }
          throw new DOMException('Storage quota exceeded', 'QuotaExceededError');
        },
        removeItem: (k: string) => { delete store[k]; },
        clear: () => { Object.keys(store).forEach(k => delete store[k]); },
        get length() { return Object.keys(store).length; },
        key: (i: number) => Object.keys(store)[i] ?? null,
      } as Storage;
    }

    it('markTopicComplete returns false on QuotaExceededError', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      Object.defineProperty(window, 'localStorage', {
        value: createQuotaExceededStorage(),
        writable: true,
        configurable: true,
      });

      const result = markTopicComplete('intro-to-html');
      expect(result).toBe(false);
      expect(warnSpy).toHaveBeenCalledWith(
        'Local storage quota exceeded. Progress will not be saved.'
      );

      warnSpy.mockRestore();
    });

    it('markTopicComplete returns false when localStorage is unavailable', () => {
      Object.defineProperty(window, 'localStorage', {
        get() { throw new Error('Access denied'); },
        configurable: true,
      });

      const result = markTopicComplete('intro-to-html');
      expect(result).toBe(false);
    });

    it('isTopicComplete returns false when localStorage is unavailable', () => {
      Object.defineProperty(window, 'localStorage', {
        get() { throw new Error('Access denied'); },
        configurable: true,
      });

      const result = isTopicComplete('intro-to-html');
      expect(result).toBe(false);
    });

    it('getAllCompletedTopics returns empty set when localStorage is unavailable', () => {
      Object.defineProperty(window, 'localStorage', {
        get() { throw new Error('Access denied'); },
        configurable: true,
      });

      const result = getAllCompletedTopics();
      expect(result.size).toBe(0);
    });
  });
});
