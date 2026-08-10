import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import DownloadButton from './DownloadButton';
import type { Topic, CodeTopicContent, ContentTopicContent, DiagramTopicContent } from '@/types';
import * as downloadUtils from '@/lib/download';

vi.mock('@/lib/download', () => ({
  downloadCodeFile: vi.fn(),
  downloadMarkdownFile: vi.fn(),
  downloadDiagramPng: vi.fn(),
}));

describe('DownloadButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // --- Test Data Factories ---

  const makeCodeTopic = (overrides?: Partial<Topic>): Topic => ({
    slug: 'variables-js',
    title: 'Variables in JavaScript',
    type: 'code',
    partSlug: 'part-02',
    moduleSlug: 'module-04',
    content: {
      starterCode: 'let x = 1;',
      language: 'javascript',
    } as CodeTopicContent,
    ...overrides,
  });

  const makeContentTopic = (overrides?: Partial<Topic>): Topic => ({
    slug: 'intro-to-html',
    title: 'Introduction to HTML',
    type: 'content',
    partSlug: 'part-01',
    moduleSlug: 'module-01',
    content: {
      markdown: '# HTML Basics\n\nHTML is the structure of the web.',
    } as ContentTopicContent,
    ...overrides,
  });

  const makeDiagramTopic = (overrides?: Partial<Topic>): Topic => ({
    slug: 'microservices-arch',
    title: 'Microservices Architecture',
    type: 'diagram',
    partSlug: 'part-07',
    moduleSlug: 'module-22',
    content: {
      description: 'Design a microservices system.',
      initialElements: [{ id: '1', type: 'rectangle' }],
    } as DiagramTopicContent,
    ...overrides,
  });

  const makeMixedTopic = (): Topic => ({
    slug: 'mixed-topic',
    title: 'Mixed Topic Example',
    type: 'code' as any,
    partSlug: 'part-01',
    moduleSlug: 'module-01',
    content: {
      markdown: '# Instructions',
      starterCode: 'const y = 2;',
      language: 'typescript',
    } as any,
  });

  // --- Rendering Tests ---

  describe('rendering', () => {
    it('renders a download button with icon and text', () => {
      const topic = makeCodeTopic();
      render(<DownloadButton topic={topic} getCurrentCode={() => 'let x = 1;'} />);

      const button = screen.getByTestId('download-button');
      expect(button).toBeInTheDocument();
      expect(screen.getByText('Download')).toBeInTheDocument();
    });

    it('has correct aria-label with topic title', () => {
      const topic = makeCodeTopic({ title: 'My Topic' });
      render(<DownloadButton topic={topic} getCurrentCode={() => 'code'} />);

      expect(screen.getByTestId('download-button')).toHaveAttribute(
        'aria-label',
        'Download My Topic'
      );
    });
  });

  // --- Code Topics ---

  describe('code topics', () => {
    it('calls downloadCodeFile with current code on click', () => {
      const topic = makeCodeTopic();
      const getCurrentCode = vi.fn(() => 'const hello = "world";');

      render(<DownloadButton topic={topic} getCurrentCode={getCurrentCode} />);
      fireEvent.click(screen.getByTestId('download-button'));

      expect(downloadUtils.downloadCodeFile).toHaveBeenCalledWith(
        'Variables in JavaScript',
        'const hello = "world";',
        'javascript'
      );
    });

    it('is disabled when getCurrentCode returns empty string', () => {
      const topic = makeCodeTopic();
      render(<DownloadButton topic={topic} getCurrentCode={() => ''} />);

      const button = screen.getByTestId('download-button');
      expect(button).toBeDisabled();
    });

    it('is disabled when getCurrentCode returns whitespace-only string', () => {
      const topic = makeCodeTopic();
      render(<DownloadButton topic={topic} getCurrentCode={() => '   '} />);

      const button = screen.getByTestId('download-button');
      expect(button).toBeDisabled();
    });

    it('is disabled when getCurrentCode is not provided', () => {
      const topic = makeCodeTopic();
      render(<DownloadButton topic={topic} />);

      const button = screen.getByTestId('download-button');
      expect(button).toBeDisabled();
    });

    it('does not call download when button is disabled', () => {
      const topic = makeCodeTopic();
      render(<DownloadButton topic={topic} getCurrentCode={() => ''} />);

      fireEvent.click(screen.getByTestId('download-button'));
      expect(downloadUtils.downloadCodeFile).not.toHaveBeenCalled();
    });
  });

  // --- Content Topics ---

  describe('content topics', () => {
    it('calls downloadMarkdownFile with markdown content on click', () => {
      const topic = makeContentTopic();
      render(<DownloadButton topic={topic} />);

      fireEvent.click(screen.getByTestId('download-button'));

      expect(downloadUtils.downloadMarkdownFile).toHaveBeenCalledWith(
        'Introduction to HTML',
        '# HTML Basics\n\nHTML is the structure of the web.'
      );
    });

    it('is disabled when markdown content is empty', () => {
      const topic = makeContentTopic({
        content: { markdown: '' } as ContentTopicContent,
      });
      render(<DownloadButton topic={topic} />);

      expect(screen.getByTestId('download-button')).toBeDisabled();
    });

    it('is disabled when markdown content is whitespace-only', () => {
      const topic = makeContentTopic({
        content: { markdown: '   \n  ' } as ContentTopicContent,
      });
      render(<DownloadButton topic={topic} />);

      expect(screen.getByTestId('download-button')).toBeDisabled();
    });
  });

  // --- Diagram Topics ---

  describe('diagram topics', () => {
    it('calls getDiagramBlob and downloadDiagramPng on click', async () => {
      const topic = makeDiagramTopic();
      const blob = new Blob(['png data'], { type: 'image/png' });
      const getDiagramBlob = vi.fn(() => Promise.resolve(blob));

      render(<DownloadButton topic={topic} getDiagramBlob={getDiagramBlob} />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('download-button'));
      });

      expect(getDiagramBlob).toHaveBeenCalled();
      expect(downloadUtils.downloadDiagramPng).toHaveBeenCalledWith(
        'Microservices Architecture',
        blob
      );
    });

    it('is disabled when getDiagramBlob is not provided', () => {
      const topic = makeDiagramTopic();
      render(<DownloadButton topic={topic} />);

      expect(screen.getByTestId('download-button')).toBeDisabled();
    });

    it('shows loading state while exporting', async () => {
      const topic = makeDiagramTopic();
      let resolveBlob: (blob: Blob) => void;
      const blobPromise = new Promise<Blob>((resolve) => {
        resolveBlob = resolve;
      });
      const getDiagramBlob = vi.fn(() => blobPromise);

      render(<DownloadButton topic={topic} getDiagramBlob={getDiagramBlob} />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('download-button'));
      });

      expect(screen.getByText('Exporting...')).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

      await act(async () => {
        resolveBlob!(new Blob(['data'], { type: 'image/png' }));
      });

      expect(screen.getByText('Download')).toBeInTheDocument();
    });

    it('shows error notification when export fails', async () => {
      const topic = makeDiagramTopic();
      const getDiagramBlob = vi.fn(() => Promise.reject(new Error('Export failed')));

      render(<DownloadButton topic={topic} getDiagramBlob={getDiagramBlob} />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('download-button'));
      });

      expect(screen.getByTestId('download-error')).toBeInTheDocument();
      expect(screen.getByText('Failed to export diagram as PNG. Please try again.')).toBeInTheDocument();
    });

    it('auto-dismisses error notification after 3 seconds', async () => {
      const topic = makeDiagramTopic();
      const getDiagramBlob = vi.fn(() => Promise.reject(new Error('Export failed')));

      render(<DownloadButton topic={topic} getDiagramBlob={getDiagramBlob} />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('download-button'));
        // Flush microtask queue so the rejected promise settles and state updates
        await Promise.resolve();
      });

      expect(screen.getByTestId('download-error')).toBeInTheDocument();

      await act(async () => {
        vi.advanceTimersByTime(3000);
      });

      expect(screen.queryByTestId('download-error')).not.toBeInTheDocument();
    });

    it('keeps button enabled after export failure for retry', async () => {
      const topic = makeDiagramTopic();
      const getDiagramBlob = vi.fn(() => Promise.reject(new Error('Export failed')));

      render(<DownloadButton topic={topic} getDiagramBlob={getDiagramBlob} />);

      await act(async () => {
        fireEvent.click(screen.getByTestId('download-button'));
      });

      const button = screen.getByTestId('download-button');
      expect(button).not.toBeDisabled();
    });
  });

  // --- Mixed Topics ---

  describe('mixed topics', () => {
    it('treats mixed topics like code topics', () => {
      const topic = makeMixedTopic();
      (topic as any).type = 'mixed';
      const getCurrentCode = vi.fn(() => 'const y = 2;');

      render(<DownloadButton topic={topic} getCurrentCode={getCurrentCode} />);
      fireEvent.click(screen.getByTestId('download-button'));

      expect(downloadUtils.downloadCodeFile).toHaveBeenCalledWith(
        'Mixed Topic Example',
        'const y = 2;',
        'typescript'
      );
    });
  });

  // --- Disabled State ---

  describe('disabled state', () => {
    it('applies visual disabled styling', () => {
      const topic = makeCodeTopic();
      render(<DownloadButton topic={topic} getCurrentCode={() => ''} />);

      const button = screen.getByTestId('download-button');
      expect(button).toHaveClass('cursor-not-allowed');
      expect(button).toHaveClass('opacity-50');
    });

    it('prevents click when disabled', () => {
      const topic = makeCodeTopic();
      const getCurrentCode = vi.fn(() => '');
      render(<DownloadButton topic={topic} getCurrentCode={getCurrentCode} />);

      fireEvent.click(screen.getByTestId('download-button'));
      expect(downloadUtils.downloadCodeFile).not.toHaveBeenCalled();
    });
  });
});
