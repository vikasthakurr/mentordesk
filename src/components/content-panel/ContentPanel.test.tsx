import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ContentPanel from './ContentPanel';
import type { Topic, CodeTopicContent, ContentTopicContent, DiagramTopicContent } from '@/types';

// Mock dynamic imports and heavy child components
vi.mock('./MultiFileEditor', () => ({
  default: ({ topicSlug }: any) => (
    <div data-testid="multi-file-editor" data-topic={topicSlug}>MultiFileEditor</div>
  ),
}));

vi.mock('./ContentViewer', () => ({
  default: ({ content }: any) => (
    <div data-testid="content-viewer" data-content={content}>ContentViewer</div>
  ),
}));

vi.mock('./DiagramEditor', () => ({
  default: ({ topicSlug }: any) => (
    <div data-testid="diagram-editor" data-topic={topicSlug}>DiagramEditor</div>
  ),
}));

vi.mock('./NodeEditor', () => ({
  default: ({ topicSlug }: any) => (
    <div data-testid="node-editor" data-topic={topicSlug}>NodeEditor</div>
  ),
}));

vi.mock('./ExerciseInstructions', () => ({
  default: () => <div data-testid="exercise-instructions">ExerciseInstructions</div>,
}));

vi.mock('@/components/ui/MarkAsCompletedButton', () => ({
  default: () => <button data-testid="mark-completed-button">Mark</button>,
}));

vi.mock('@/lib/download', () => ({
  downloadCodeFile: vi.fn(),
  downloadMarkdownFile: vi.fn(),
  downloadDiagramPng: vi.fn(),
}));

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
    it('renders MultiFileEditor for code type topics (default tab)', () => {
      const topic = makeCodeTopic();
      render(<ContentPanel topic={topic} />);
      expect(screen.getByTestId('multi-file-editor')).toBeInTheDocument();
    });

    it('renders ContentViewer for content type topics (notes tab default)', () => {
      const topic = makeContentTopic();
      render(<ContentPanel topic={topic} />);
      expect(screen.getByTestId('content-viewer')).toBeInTheDocument();
    });

    it('renders DiagramEditor for diagram type topics (draw tab default)', () => {
      const topic = makeDiagramTopic();
      render(<ContentPanel topic={topic} />);
      expect(screen.getByTestId('diagram-editor')).toBeInTheDocument();
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
    });

    it('displays navigation arrows', () => {
      const topic = makeCodeTopic();
      render(<ContentPanel topic={topic} />);
      expect(screen.getByTitle('Previous topic')).toBeInTheDocument();
      expect(screen.getByTitle('Next topic')).toBeInTheDocument();
    });

    it('shows the content-panel test id', () => {
      const topic = makeCodeTopic();
      render(<ContentPanel topic={topic} />);
      expect(screen.getByTestId('content-panel')).toBeInTheDocument();
    });
  });

  describe('Activity bar', () => {
    it('renders activity bar with Code Editor button for code topics', () => {
      const topic = makeCodeTopic();
      render(<ContentPanel topic={topic} />);
      expect(screen.getByTitle('Code Editor')).toBeInTheDocument();
    });

    it('renders Drawing Board button', () => {
      const topic = makeCodeTopic();
      render(<ContentPanel topic={topic} />);
      expect(screen.getByTitle('Drawing Board')).toBeInTheDocument();
    });

    it('renders Node.js button', () => {
      const topic = makeCodeTopic();
      render(<ContentPanel topic={topic} />);
      expect(screen.getByTitle('Node.js')).toBeInTheDocument();
    });

    it('renders Notes button for content topics', () => {
      const topic = makeContentTopic();
      render(<ContentPanel topic={topic} />);
      expect(screen.getByTitle('Notes')).toBeInTheDocument();
    });

    it('renders Presentation Mode button', () => {
      const topic = makeCodeTopic();
      render(<ContentPanel topic={topic} />);
      expect(screen.getByTitle('Presentation Mode')).toBeInTheDocument();
    });
  });
});
