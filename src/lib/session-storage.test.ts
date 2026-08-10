import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  buildStorageKey,
  saveCode,
  loadCode,
  saveDiagram,
  loadDiagram,
  clearEntry,
} from './session-storage';

describe('session-storage', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  describe('buildStorageKey', () => {
    it('builds key with correct format', () => {
      const key = buildStorageKey('part-01', 'module-01', 'topic-01', 'code');
      expect(key).toBe('mern-platform:part-01:module-01:topic-01:code');
    });

    it('builds key for diagram type', () => {
      const key = buildStorageKey('part-07', 'module-21', 'hld-intro', 'diagram');
      expect(key).toBe('mern-platform:part-07:module-21:hld-intro:diagram');
    });
  });

  describe('saveCode / loadCode', () => {
    it('saves and loads code correctly', () => {
      const key = 'mern-platform:part-01:module-01:topic-01:code';
      const code = 'const x = 42;';

      const result = saveCode(key, code);
      expect(result).toBe(true);

      const loaded = loadCode(key);
      expect(loaded).toBe(code);
    });

    it('returns null for non-existent key', () => {
      const loaded = loadCode('non-existent-key');
      expect(loaded).toBeNull();
    });

    it('handles empty string code', () => {
      const key = 'mern-platform:part-01:module-01:topic-01:code';
      saveCode(key, '');
      const loaded = loadCode(key);
      expect(loaded).toBe('');
    });
  });

  describe('saveDiagram / loadDiagram', () => {
    it('saves and loads diagram elements correctly', () => {
      const key = 'mern-platform:part-07:module-21:hld-intro:diagram';
      const elements = [{ type: 'rectangle', x: 0, y: 0 }, { type: 'arrow', x: 10, y: 10 }];

      const result = saveDiagram(key, elements);
      expect(result).toBe(true);

      const loaded = loadDiagram(key);
      expect(loaded).toEqual(elements);
    });

    it('returns null for non-existent key', () => {
      const loaded = loadDiagram('non-existent-key');
      expect(loaded).toBeNull();
    });

    it('saves and loads empty elements array', () => {
      const key = 'mern-platform:part-07:module-21:topic:diagram';
      saveDiagram(key, []);
      const loaded = loadDiagram(key);
      expect(loaded).toEqual([]);
    });

    it('returns null and removes corrupted data (invalid JSON)', () => {
      const key = 'mern-platform:part-07:module-21:topic:diagram';
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      sessionStorage.setItem(key, 'not-valid-json{{{');
      const loaded = loadDiagram(key);
      expect(loaded).toBeNull();
      expect(sessionStorage.getItem(key)).toBeNull();
      expect(warnSpy).toHaveBeenCalled();

      warnSpy.mockRestore();
    });

    it('returns null and removes corrupted data (non-array JSON)', () => {
      const key = 'mern-platform:part-07:module-21:topic:diagram';
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      sessionStorage.setItem(key, '{"not": "an array"}');
      const loaded = loadDiagram(key);
      expect(loaded).toBeNull();
      expect(sessionStorage.getItem(key)).toBeNull();
      expect(warnSpy).toHaveBeenCalled();

      warnSpy.mockRestore();
    });
  });

  describe('clearEntry', () => {
    it('removes an existing entry', () => {
      const key = 'mern-platform:part-01:module-01:topic-01:code';
      saveCode(key, 'some code');
      expect(loadCode(key)).toBe('some code');

      clearEntry(key);
      expect(loadCode(key)).toBeNull();
    });

    it('does not throw when key does not exist', () => {
      expect(() => clearEntry('non-existent-key')).not.toThrow();
    });
  });

  describe('QuotaExceededError handling', () => {
    const originalSessionStorage = window.sessionStorage;

    afterEach(() => {
      Object.defineProperty(window, 'sessionStorage', {
        value: originalSessionStorage,
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

    it('saveCode handles QuotaExceededError gracefully', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      Object.defineProperty(window, 'sessionStorage', {
        value: createQuotaExceededStorage(),
        writable: true,
        configurable: true,
      });

      const key = 'mern-platform:part-01:module-01:topic-01:code';
      const result = saveCode(key, 'some code');
      expect(result).toBe(false);
      expect(warnSpy).toHaveBeenCalledWith(
        'Session storage quota exceeded. Code changes will not be saved.'
      );

      warnSpy.mockRestore();
    });

    it('saveDiagram handles QuotaExceededError gracefully', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      Object.defineProperty(window, 'sessionStorage', {
        value: createQuotaExceededStorage(),
        writable: true,
        configurable: true,
      });

      const key = 'mern-platform:part-07:module-21:topic:diagram';
      const result = saveDiagram(key, [{ type: 'circle' }]);
      expect(result).toBe(false);
      expect(warnSpy).toHaveBeenCalledWith(
        'Session storage quota exceeded. Diagram changes will not be saved.'
      );

      warnSpy.mockRestore();
    });

    it('saveCode returns false when sessionStorage is unavailable', () => {
      Object.defineProperty(window, 'sessionStorage', {
        get() { throw new Error('Access denied'); },
        configurable: true,
      });

      const result = saveCode('some-key', 'code');
      expect(result).toBe(false);
    });

    it('loadCode returns null when sessionStorage is unavailable', () => {
      Object.defineProperty(window, 'sessionStorage', {
        get() { throw new Error('Access denied'); },
        configurable: true,
      });

      const result = loadCode('some-key');
      expect(result).toBeNull();
    });

    it('loadDiagram returns null when sessionStorage is unavailable', () => {
      Object.defineProperty(window, 'sessionStorage', {
        get() { throw new Error('Access denied'); },
        configurable: true,
      });

      const result = loadDiagram('some-key');
      expect(result).toBeNull();
    });
  });
});
