import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PartSection } from './PartSection';
import { Part } from '@/types';

const mockPart: Part = {
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
        { slug: 'semantic-elements', title: 'Semantic Elements', type: 'code', order: 3 },
      ],
    },
    {
      slug: 'module-02-css',
      moduleId: '2',
      title: 'CSS | Styling Web Pages',
      topicCount: 2,
      topics: [
        { slug: 'intro-to-css', title: 'Introduction to CSS', type: 'content', order: 1 },
        { slug: 'selectors', title: 'CSS Selectors', type: 'code', order: 2 },
      ],
    },
  ],
};

const defaultProps = {
  part: mockPart,
  activeTopic: null as string | null,
  isExpanded: false,
  onToggle: vi.fn(),
  onTopicSelect: vi.fn(),
};

describe('PartSection', () => {
  it('renders part title with correct format "Part N - [Subject Area]"', () => {
    render(<PartSection {...defaultProps} />);
    expect(screen.getByText('Part 1 - Web Foundations')).toBeInTheDocument();
  });

  it('displays part-level progress as completed modules / total modules', () => {
    render(<PartSection {...defaultProps} />);
    expect(screen.getByText('0 / 2 modules completed')).toBeInTheDocument();
  });

  it('counts a module as completed when all its topics are in completedTopics', () => {
    const completedTopics = new Set([
      'intro-to-html',
      'html-elements',
      'semantic-elements',
    ]);
    render(<PartSection {...defaultProps} completedTopics={completedTopics} />);
    expect(screen.getByText('1 / 2 modules completed')).toBeInTheDocument();
  });

  it('shows all modules completed when all topics across all modules are completed', () => {
    const completedTopics = new Set([
      'intro-to-html',
      'html-elements',
      'semantic-elements',
      'intro-to-css',
      'selectors',
    ]);
    render(<PartSection {...defaultProps} completedTopics={completedTopics} />);
    expect(screen.getByText('2 / 2 modules completed')).toBeInTheDocument();
  });

  it('does not render child modules when collapsed', () => {
    render(<PartSection {...defaultProps} isExpanded={false} />);
    expect(screen.queryByText('HTML | Basics of Web Pages')).not.toBeInTheDocument();
    expect(screen.queryByText('CSS | Styling Web Pages')).not.toBeInTheDocument();
  });

  it('renders child ModuleSection components when expanded', () => {
    render(<PartSection {...defaultProps} isExpanded={true} />);
    expect(screen.getByText('Module 1 · HTML | Basics of Web Pages')).toBeInTheDocument();
    expect(screen.getByText('Module 2 · CSS | Styling Web Pages')).toBeInTheDocument();
  });

  it('calls onToggle when part header is clicked', () => {
    const onToggle = vi.fn();
    render(<PartSection {...defaultProps} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole('button', { name: /Part 1/i }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('sets aria-expanded to true when expanded', () => {
    render(<PartSection {...defaultProps} isExpanded={true} />);
    const button = screen.getByRole('button', { name: /Part 1/i });
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('sets aria-expanded to false when collapsed', () => {
    render(<PartSection {...defaultProps} isExpanded={false} />);
    const button = screen.getByRole('button', { name: /Part 1/i });
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('rotates chevron when expanded', () => {
    const { container } = render(<PartSection {...defaultProps} isExpanded={true} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('rotate-90');
  });

  it('does not rotate chevron when collapsed', () => {
    const { container } = render(<PartSection {...defaultProps} isExpanded={false} />);
    const svg = container.querySelector('svg');
    expect(svg).not.toHaveClass('rotate-90');
  });

  it('auto-expands module containing the active topic', () => {
    render(
      <PartSection {...defaultProps} isExpanded={true} activeTopic="selectors" />
    );
    // The CSS module should be auto-expanded, showing its topics
    expect(screen.getByText('CSS Selectors')).toBeInTheDocument();
  });

  it('does not auto-expand modules without the active topic', () => {
    render(
      <PartSection {...defaultProps} isExpanded={true} activeTopic="selectors" />
    );
    // HTML module should not be expanded (no active topic in it)
    expect(screen.queryByText('Introduction to HTML')).not.toBeInTheDocument();
  });

  it('allows manual module toggle when expanded', () => {
    render(<PartSection {...defaultProps} isExpanded={true} />);
    // Click the HTML module header to expand it
    fireEvent.click(screen.getByRole('button', { name: /Module 1/i }));
    expect(screen.getByText('Introduction to HTML')).toBeInTheDocument();
  });

  it('passes onTopicSelect through to ModuleSection children', () => {
    const onTopicSelect = vi.fn();
    render(
      <PartSection
        {...defaultProps}
        isExpanded={true}
        activeTopic="html-elements"
        onTopicSelect={onTopicSelect}
      />
    );
    // The HTML module is auto-expanded due to active topic
    fireEvent.click(screen.getByText('Semantic Elements'));
    expect(onTopicSelect).toHaveBeenCalledWith(
      'part-01-web-foundations',
      'module-01-html',
      'semantic-elements'
    );
  });

  it('passes completedTopics through to ModuleSection children', () => {
    const completedTopics = new Set(['intro-to-html']);
    render(
      <PartSection
        {...defaultProps}
        isExpanded={true}
        activeTopic="html-elements"
        completedTopics={completedTopics}
      />
    );
    // The completed indicator should show in the module
    expect(screen.getByLabelText('Completed')).toBeInTheDocument();
  });
});
