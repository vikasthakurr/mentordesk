import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContentViewer from './ContentViewer';

// Mock highlight.js CSS import (not needed in test)
vi.mock('highlight.js/styles/github-dark.css', () => ({}));

describe('ContentViewer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Placeholder behavior', () => {
    it('shows placeholder message when content is empty string', () => {
      render(<ContentViewer content="" />);
      expect(screen.getByTestId('content-placeholder')).toBeInTheDocument();
      expect(screen.getByText('No content available for this topic.')).toBeInTheDocument();
    });

    it('shows placeholder message when content is only whitespace', () => {
      render(<ContentViewer content="     " />);
      expect(screen.getByTestId('content-placeholder')).toBeInTheDocument();
    });
  });

  describe('Heading rendering', () => {
    it('renders h1 heading correctly', () => {
      render(<ContentViewer content="# Hello World" />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Hello World');
    });

    it('renders h2 heading correctly', () => {
      render(<ContentViewer content="## Section Title" />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Section Title');
    });

    it('renders h3 heading correctly', () => {
      render(<ContentViewer content="### Subsection" />);
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Subsection');
    });

    it('renders multiple heading levels', () => {
      const markdown = `# Title\n## Subtitle\n### Sub-subsection\n#### Level 4\n##### Level 5\n###### Level 6`;
      render(<ContentViewer content={markdown} />);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Title');
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Subtitle');
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Sub-subsection');
      expect(screen.getByRole('heading', { level: 4 })).toHaveTextContent('Level 4');
      expect(screen.getByRole('heading', { level: 5 })).toHaveTextContent('Level 5');
      expect(screen.getByRole('heading', { level: 6 })).toHaveTextContent('Level 6');
    });
  });

  describe('Code block rendering', () => {
    it('renders fenced code blocks', () => {
      const markdown = '```javascript\nconst x = 1;\n```';
      render(<ContentViewer content={markdown} />);
      // rehype-highlight splits code into spans, so we look for a code element with the language class
      const codeElement = screen.getByTestId('content-viewer').querySelector('code.hljs');
      expect(codeElement).toBeInTheDocument();
      expect(codeElement?.textContent).toContain('const x = 1;');
    });

    it('renders a copy button on code blocks', () => {
      const markdown = '```\nsome code\n```';
      render(<ContentViewer content={markdown} />);
      expect(screen.getByRole('button', { name: /copy code to clipboard/i })).toBeInTheDocument();
    });

    it('shows "Copied!" after clicking the copy button', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: { writeText },
      });

      const markdown = '```\nhello world\n```';
      render(<ContentViewer content={markdown} />);

      const copyButton = screen.getByRole('button', { name: /copy code to clipboard/i });
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });
      expect(writeText).toHaveBeenCalledWith('hello world\n');
    });

    it('renders inline code', () => {
      render(<ContentViewer content="Use `console.log` for debugging" />);
      const code = screen.getByText('console.log');
      expect(code.tagName).toBe('CODE');
    });
  });

  describe('List rendering', () => {
    it('renders unordered lists', () => {
      const markdown = '- Item 1\n- Item 2\n- Item 3';
      render(<ContentViewer content={markdown} />);
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('renders ordered lists', () => {
      const markdown = '1. First\n2. Second\n3. Third';
      render(<ContentViewer content={markdown} />);
      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
      expect(screen.getByText('Third')).toBeInTheDocument();
    });
  });

  describe('Link rendering', () => {
    it('renders links with correct href', () => {
      render(<ContentViewer content="Visit [React](https://react.dev) docs" />);
      const link = screen.getByRole('link', { name: 'React' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'https://react.dev');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Text formatting', () => {
    it('renders bold text', () => {
      render(<ContentViewer content="This is **bold** text" />);
      const bold = screen.getByText('bold');
      expect(bold.tagName).toBe('STRONG');
    });

    it('renders italic text', () => {
      render(<ContentViewer content="This is *italic* text" />);
      const italic = screen.getByText('italic');
      expect(italic.tagName).toBe('EM');
    });
  });

  describe('Image rendering', () => {
    it('renders images with max-width styling', () => {
      render(<ContentViewer content="![Alt text](https://example.com/image.png)" />);
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('alt', 'Alt text');
      expect(img).toHaveAttribute('src', 'https://example.com/image.png');
      expect(img).toHaveClass('max-w-full');
      expect(img).toHaveStyle({ maxWidth: '100%', height: 'auto' });
    });
  });

  describe('Scrollable container', () => {
    it('has overflow-y-auto class for scrolling', () => {
      render(<ContentViewer content="# Content" />);
      const container = screen.getByTestId('content-viewer');
      expect(container).toHaveClass('overflow-y-auto');
    });
  });
});
