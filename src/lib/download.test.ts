import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  toKebabCase,
  getFileExtension,
  downloadCodeFile,
  downloadMarkdownFile,
  downloadDiagramPng,
} from './download';

describe('download utilities', () => {
  describe('toKebabCase', () => {
    it('converts a simple title to kebab-case', () => {
      expect(toKebabCase('useState Hook')).toBe('usestate-hook');
    });

    it('converts multi-word title with mixed case', () => {
      expect(toKebabCase('REST API Design')).toBe('rest-api-design');
    });

    it('converts long title', () => {
      expect(toKebabCase('Microservices Architecture')).toBe('microservices-architecture');
    });

    it('removes special characters', () => {
      expect(toKebabCase('Hello, World! (Test)')).toBe('hello-world-test');
    });

    it('collapses multiple hyphens', () => {
      expect(toKebabCase('foo---bar')).toBe('foo-bar');
    });

    it('trims leading and trailing hyphens', () => {
      expect(toKebabCase('--hello--')).toBe('hello');
    });

    it('handles single word', () => {
      expect(toKebabCase('JavaScript')).toBe('javascript');
    });

    it('handles empty string', () => {
      expect(toKebabCase('')).toBe('');
    });

    it('handles string with only special characters', () => {
      expect(toKebabCase('!@#$%')).toBe('');
    });

    it('handles numbers in title', () => {
      expect(toKebabCase('Module 1 HTML')).toBe('module-1-html');
    });

    it('handles title with ampersand', () => {
      expect(toKebabCase('Node.js & Express')).toBe('nodejs-express');
    });
  });

  describe('getFileExtension', () => {
    it('returns .js for code type with javascript language', () => {
      expect(getFileExtension('code', 'javascript')).toBe('.js');
    });

    it('returns .ts for code type with typescript language', () => {
      expect(getFileExtension('code', 'typescript')).toBe('.ts');
    });

    it('returns .html for code type with html language', () => {
      expect(getFileExtension('code', 'html')).toBe('.html');
    });

    it('returns .css for code type with css language', () => {
      expect(getFileExtension('code', 'css')).toBe('.css');
    });

    it('returns .json for code type with json language', () => {
      expect(getFileExtension('code', 'json')).toBe('.json');
    });

    it('returns .jsx for code type with jsx language', () => {
      expect(getFileExtension('code', 'jsx')).toBe('.jsx');
    });

    it('returns .tsx for code type with tsx language', () => {
      expect(getFileExtension('code', 'tsx')).toBe('.tsx');
    });

    it('returns .js for code type with no language specified', () => {
      expect(getFileExtension('code')).toBe('.js');
    });

    it('returns .md for content type', () => {
      expect(getFileExtension('content')).toBe('.md');
    });

    it('returns .md for content type regardless of language', () => {
      expect(getFileExtension('content', 'typescript')).toBe('.md');
    });

    it('returns .png for diagram type', () => {
      expect(getFileExtension('diagram')).toBe('.png');
    });

    it('returns .png for diagram type regardless of language', () => {
      expect(getFileExtension('diagram', 'javascript')).toBe('.png');
    });

    it('returns correct extension for mixed type with language', () => {
      expect(getFileExtension('mixed', 'typescript')).toBe('.ts');
    });

    it('returns .js for mixed type with no language', () => {
      expect(getFileExtension('mixed')).toBe('.js');
    });
  });

  describe('download functions', () => {
    let createObjectURLMock: ReturnType<typeof vi.fn>;
    let revokeObjectURLMock: ReturnType<typeof vi.fn>;
    let appendChildSpy: ReturnType<typeof vi.spyOn>;
    let removeChildSpy: ReturnType<typeof vi.spyOn>;
    let clickMock: ReturnType<typeof vi.fn>;
    let createdAnchor: HTMLAnchorElement;

    beforeEach(() => {
      createObjectURLMock = vi.fn().mockReturnValue('blob:http://localhost/fake-url');
      revokeObjectURLMock = vi.fn();

      global.URL.createObjectURL = createObjectURLMock;
      global.URL.revokeObjectURL = revokeObjectURLMock;

      clickMock = vi.fn();
      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        if (tag === 'a') {
          createdAnchor = originalCreateElement('a') as HTMLAnchorElement;
          createdAnchor.click = clickMock;
          return createdAnchor;
        }
        return originalCreateElement(tag);
      });

      appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node as any);
      removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node as any);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    describe('downloadCodeFile', () => {
      it('creates a blob with the code content and correct MIME type', () => {
        const code = 'const x = 42;\nconsole.log(x);';
        downloadCodeFile('useState Hook', code, 'javascript');

        expect(createObjectURLMock).toHaveBeenCalledTimes(1);
        const blob = createObjectURLMock.mock.calls[0][0] as Blob;
        expect(blob).toBeInstanceOf(Blob);
        expect(blob.type).toBe('text/javascript');
      });

      it('sets the correct filename with .js extension', () => {
        downloadCodeFile('useState Hook', 'code', 'javascript');
        expect(createdAnchor.download).toBe('usestate-hook.js');
      });

      it('sets the correct filename with .ts extension', () => {
        downloadCodeFile('Generic Types', 'code', 'typescript');
        expect(createdAnchor.download).toBe('generic-types.ts');
      });

      it('sets href to the created object URL', () => {
        downloadCodeFile('Test', 'code', 'javascript');
        expect(createdAnchor.href).toContain('blob:http://localhost/fake-url');
      });

      it('triggers click on the anchor element', () => {
        downloadCodeFile('Test', 'code', 'javascript');
        expect(clickMock).toHaveBeenCalledTimes(1);
      });

      it('appends and removes anchor from the body', () => {
        downloadCodeFile('Test', 'code', 'javascript');
        expect(appendChildSpy).toHaveBeenCalledWith(createdAnchor);
        expect(removeChildSpy).toHaveBeenCalledWith(createdAnchor);
      });

      it('revokes the object URL after download', () => {
        downloadCodeFile('Test', 'code', 'javascript');
        expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:http://localhost/fake-url');
      });

      it('uses correct MIME type for HTML', () => {
        downloadCodeFile('Index Page', '<html></html>', 'html');
        const blob = createObjectURLMock.mock.calls[0][0] as Blob;
        expect(blob.type).toBe('text/html');
        expect(createdAnchor.download).toBe('index-page.html');
      });

      it('uses correct MIME type for CSS', () => {
        downloadCodeFile('Styles', 'body {}', 'css');
        const blob = createObjectURLMock.mock.calls[0][0] as Blob;
        expect(blob.type).toBe('text/css');
        expect(createdAnchor.download).toBe('styles.css');
      });

      it('uses correct MIME type for JSON', () => {
        downloadCodeFile('Config', '{}', 'json');
        const blob = createObjectURLMock.mock.calls[0][0] as Blob;
        expect(blob.type).toBe('application/json');
        expect(createdAnchor.download).toBe('config.json');
      });

      it('uses correct MIME type for JSX', () => {
        downloadCodeFile('App Component', 'export default () => <div />', 'jsx');
        const blob = createObjectURLMock.mock.calls[0][0] as Blob;
        expect(blob.type).toBe('text/javascript');
        expect(createdAnchor.download).toBe('app-component.jsx');
      });

      it('uses correct MIME type for TSX', () => {
        downloadCodeFile('Button Component', 'export const Button: FC = () => <button />', 'tsx');
        const blob = createObjectURLMock.mock.calls[0][0] as Blob;
        expect(blob.type).toBe('text/typescript');
        expect(createdAnchor.download).toBe('button-component.tsx');
      });
    });

    describe('downloadMarkdownFile', () => {
      it('creates a blob with markdown content', () => {
        const md = '# Hello\n\nThis is content.';
        downloadMarkdownFile('REST API Design', md);

        const blob = createObjectURLMock.mock.calls[0][0] as Blob;
        expect(blob).toBeInstanceOf(Blob);
        expect(blob.type).toBe('text/markdown');
      });

      it('sets the correct filename with .md extension', () => {
        downloadMarkdownFile('REST API Design', '# Content');
        expect(createdAnchor.download).toBe('rest-api-design.md');
      });

      it('triggers the download flow', () => {
        downloadMarkdownFile('Notes', '# Notes');
        expect(clickMock).toHaveBeenCalledTimes(1);
        expect(revokeObjectURLMock).toHaveBeenCalledTimes(1);
      });
    });

    describe('downloadDiagramPng', () => {
      it('uses the provided blob directly', () => {
        const pngBlob = new Blob(['fake-png-data'], { type: 'image/png' });
        downloadDiagramPng('Microservices Architecture', pngBlob);

        expect(createObjectURLMock).toHaveBeenCalledWith(pngBlob);
      });

      it('sets the correct filename with .png extension', () => {
        const pngBlob = new Blob(['data'], { type: 'image/png' });
        downloadDiagramPng('Microservices Architecture', pngBlob);
        expect(createdAnchor.download).toBe('microservices-architecture.png');
      });

      it('triggers the download flow', () => {
        const pngBlob = new Blob(['data'], { type: 'image/png' });
        downloadDiagramPng('HLD Diagram', pngBlob);
        expect(clickMock).toHaveBeenCalledTimes(1);
        expect(appendChildSpy).toHaveBeenCalled();
        expect(removeChildSpy).toHaveBeenCalled();
        expect(revokeObjectURLMock).toHaveBeenCalledTimes(1);
      });
    });
  });
});
