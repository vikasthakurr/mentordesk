import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ContentPanel from './ContentPanel';
import type { Topic, CodeTopicContent, ContentTopicContent, DiagramTopicContent } from '@/types';

// Mock child components to isolate ContentPanel routing logic
vi.mock('./CodeEditor', () => ({
  default: ({ topicSlug, language }: any) => (
    <div data-testid="code-editor" data-topic={topicSlug} data-language={language}>
      CodeEditor
    </div>
  ),
}));

vi.mock('./ContentViewer', () => ({
  default: ({ content }: any) => (
    <div data-testid="content-viewer" data-content={content}>
      ContentViewer
    </div>
  ),
}));

vi.mock('./DiagramEditor', () => ({
  default: ({ topicSlug }: any) => (
    <div data-testid="diagram-editor" data-topic={topicSlug}>
      DiagramEditor
    </div>
  ),
}));

vi.mock('@/lib/download', () => ({
  downloadCodeFile: vi.fn(),
  downloadMarkdownFile: vi.fn(),
  downloadDiagramPng: vi.fn(),
}));

vi.mock('highlight.js/styles/github-dark.css', () => ({}));

describe('ContentPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const makeCodeTopic = (overrides?: Partial<Topic>): Topic => ({
    slug: 'test-code-topic',
    title: 'Test Code Topic',
    type: 'code',
    partSlug: 'part-01',
    moduleSlug: 'module-01',
    content: {
      starterCode: 'console.log("hello");',
      language: 'javascript',
    } as CodeTopicContent,
    ...overrides,
  });

  const makeContentTopic = (overrides?: Partial<Topic>): Topic => ({
    slug: 'test-content-topic',
    title: 'Test Content Topic',
    type: 'content',
    partSlug: 'part-01',
    moduleSlug: 'module-01',
    content: {
      markdown: '# Hello World\n\nSome content here.',
    } as ContentTopicContent,
    ...overrides,
  });

  const makeDiagramTopic = (overrides?: Partial<Topic>): Topic => ({
    slug: 'test-diagram-topic',
    title: 'Test Diagram Topic',
    type: 'diagram',
    partSlug: 'part-07',
    moduleSlug: 'module-21',
    content: {
      description: 'Design a microservices architecture.',
      initialElements: [],
    } as DiagramTopicContent,
    ...overrides,
  });

  describe('Content type routing', () => {
    it('renders CodeEditor for code type topics', () => {
      const topic = makeCodeTopic();
      render(<ContentPanel topic={topic} />);

      expect(screen.getByTestId('code-editor')).toBeInTheDocument();
      expect(screen.queryByTestId('content-viewer')).not.toBeInTheDocument();
      expect(screen.queryByTestId('diagram-editor')).not.toBeInTheDocument();
    });

    it('renders ContentViewer for content type topics', () => {
      const topic = makeContentTopic();
      render(<ContentPanel topic={topic} />);

      expect(screen.getByTestId('content-viewer')).toBeInTheDocument();
      expect(screen.queryByTestId('code-editor')).not.toBeInTheDocument();
      expect(screen.queryByTestId('diagram-editor')).not.toBeInTheDocument();
    });

    it('renders DiagramEditor for diagram type topics', () => {
      const topic = makeDiagramTopic();
      render(<ContentPanel topic={topic} />);

      expect(screen.getByTestId('diagram-editor')).toBeInTheDocument();
    });

    it('renders side-by-side layout for diagram topics with description', () => {
      const topic = makeDiagramTopic();
      render(<ContentPanel topic={topic} />);

      expect(screen.getByTestId('diagram-side-by-side')).toBeInTheDocument();
      expect(screen.getByTestId('diagram-editor')).toBeInTheDocument();
      expect(screen.getByTestId('content-viewer')).toBeInTheDocument();
    });

    it('renders DiagramEditor alone when diagram has no description', () => {
      const topic = makeDiagramTopic({
        content: {
          description: '',
          initialElements: [],
        } as DiagramTopicContent,
      });
      render(<ContentPanel topic={topic} />);

      expect(screen.getByTestId('diagram-editor')).toBeInTheDocument();
      expect(screen.queryByTestId('diagram-side-by-side')).not.toBeInTheDocument();
      expect(screen.queryByTestId('content-viewer')).not.toBeInTheDocument();
    });
  });

  describe('Mixed type rendering', () => {
    it('renders vertical split view for mixed type topics', () => {
      const topic: Topic = {
        slug: 'test-mixed-topic',
        title: 'Test Mixed Topic',
        type: 'code' as any, // We cast since TopicType doesn't include 'mixed' yet
        partSlug: 'part-01',
        moduleSlug: 'module-01',
        content: {
          markdown: '# Instructions\n\nFollow these steps.',
          starterCode: 'const x = 1;',
          language: 'javascript',
        } as any,
      };
      // Override type to 'mixed' to test the routing
      (topic as any).type = 'mixed';
      render(<ContentPanel topic={topic} />);

      expect(screen.getByTestId('mixed-split-view')).toBeInTheDocument();
      expect(screen.getByTestId('content-viewer')).toBeInTheDocument();
      expect(screen.getByTestId('code-editor')).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('shows error message for unrecognized type', () => {
      const topic: Topic = {
        slug: 'test-unknown-topic',
        title: 'Test Unknown Topic',
        type: 'unknown' as any,
        partSlug: 'part-01',
        moduleSlug: 'module-01',
        content: {} as any,
      };
      render(<ContentPanel topic={topic} />);

      expect(screen.getByTestId('content-type-error')).toBeInTheDocument();
      expect(
        screen.getByText('Content type unavailable for this topic.')
      ).toBeInTheDocument();
    });
  });

  describe('Panel header', () => {
    it('displays the topic title in the header', () => {
      const topic = makeCodeTopic({ title: 'Variables in JavaScript' });
      render(<ContentPanel topic={topic} />);

      expect(screen.getByText('Variables in JavaScript')).toBeInTheDocument();
    });

    it('includes a download button', () => {
      const topic = makeCodeTopic();
      render(<ContentPanel topic={topic} />);

      expect(screen.getByTestId('download-button')).toBeInTheDocument();
      expect(screen.getByText('Download')).toBeInTheDocument();
    });
  });

  describe('Props passing', () => {
    it('passes correct props to CodeEditor for code topics', () => {
      const topic = makeCodeTopic({
        slug: 'my-code-topic',
        content: {
          starterCode: 'let a = 1;',
          language: 'typescript',
        } as CodeTopicContent,
      });
      render(<ContentPanel topic={topic} />);

      const editor = screen.getByTestId('code-editor');
      expect(editor).toHaveAttribute('data-topic', 'my-code-topic');
      expect(editor).toHaveAttribute('data-language', 'typescript');
    });

    it('passes correct content to ContentViewer for content topics', () => {
      const topic = makeContentTopic({
        content: {
          markdown: '# My Content',
        } as ContentTopicContent,
      });
      render(<ContentPanel topic={topic} />);

      const viewer = screen.getByTestId('content-viewer');
      expect(viewer).toHaveAttribute('data-content', '# My Content');
    });

    it('passes correct props to DiagramEditor for diagram topics', () => {
      const topic = makeDiagramTopic({ slug: 'my-diagram' });
      render(<ContentPanel topic={topic} />);

      const editor = screen.getByTestId('diagram-editor');
      expect(editor).toHaveAttribute('data-topic', 'my-diagram');
    });
  });
});
