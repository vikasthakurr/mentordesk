import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ModuleSection } from './ModuleSection';
import { Module } from '@/types';

const mockModule: Module = {
  slug: 'module-01-html',
  moduleId: '1',
  title: 'HTML | Basics of Web Pages',
  topicCount: 3,
  topics: [
    { slug: 'intro-to-html', title: 'Introduction to HTML', type: 'content', order: 1 },
    { slug: 'html-elements', title: 'HTML Elements', type: 'code', order: 2 },
    { slug: 'semantic-elements', title: 'Semantic Elements', type: 'code', order: 3 },
  ],
};

const defaultProps = {
  module: mockModule,
  partSlug: 'part-01-web-foundations',
  activeTopic: null as string | null,
  isExpanded: false,
  onToggle: vi.fn(),
  onTopicSelect: vi.fn(),
};

describe('ModuleSection', () => {
  it('renders module title with correct format', () => {
    render(<ModuleSection {...defaultProps} />);
    expect(screen.getByText('Module 1 · HTML | Basics of Web Pages')).toBeInTheDocument();
  });

  it('displays topic count badge', () => {
    render(<ModuleSection {...defaultProps} />);
    expect(screen.getByText('3 topics')).toBeInTheDocument();
  });

  it('displays singular "topic" for single topic module', () => {
    const singleTopicModule: Module = {
      ...mockModule,
      topics: [{ slug: 'only-topic', title: 'Only Topic', type: 'content', order: 1 }],
    };
    render(<ModuleSection {...defaultProps} module={singleTopicModule} />);
    expect(screen.getByText('1 topic')).toBeInTheDocument();
  });

  it('displays module-level progress', () => {
    const completedTopics = new Set(['intro-to-html', 'html-elements']);
    render(<ModuleSection {...defaultProps} completedTopics={completedTopics} />);
    expect(screen.getByText('2/3 completed')).toBeInTheDocument();
  });

  it('displays 0 completed when no topics are completed', () => {
    render(<ModuleSection {...defaultProps} />);
    expect(screen.getByText('0/3 completed')).toBeInTheDocument();
  });

  it('does not render topic items when collapsed', () => {
    render(<ModuleSection {...defaultProps} isExpanded={false} />);
    expect(screen.queryByText('Introduction to HTML')).not.toBeInTheDocument();
    expect(screen.queryByText('HTML Elements')).not.toBeInTheDocument();
  });

  it('renders topic items when expanded', () => {
    render(<ModuleSection {...defaultProps} isExpanded={true} />);
    expect(screen.getByText('Introduction to HTML')).toBeInTheDocument();
    expect(screen.getByText('HTML Elements')).toBeInTheDocument();
    expect(screen.getByText('Semantic Elements')).toBeInTheDocument();
  });

  it('calls onToggle when header is clicked', () => {
    const onToggle = vi.fn();
    render(<ModuleSection {...defaultProps} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole('button', { name: /Module 1/i }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('sets aria-expanded to true when expanded', () => {
    render(<ModuleSection {...defaultProps} isExpanded={true} />);
    const button = screen.getByRole('button', { name: /Module 1/i });
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('sets aria-expanded to false when collapsed', () => {
    render(<ModuleSection {...defaultProps} isExpanded={false} />);
    const button = screen.getByRole('button', { name: /Module 1/i });
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('highlights the active topic when expanded', () => {
    render(
      <ModuleSection {...defaultProps} isExpanded={true} activeTopic="html-elements" />
    );
    const activeButton = screen.getByText('HTML Elements').closest('button');
    expect(activeButton).toHaveAttribute('aria-current', 'true');
  });

  it('calls onTopicSelect with correct args when a topic is clicked', () => {
    const onTopicSelect = vi.fn();
    render(
      <ModuleSection {...defaultProps} isExpanded={true} onTopicSelect={onTopicSelect} />
    );
    fireEvent.click(screen.getByText('HTML Elements'));
    expect(onTopicSelect).toHaveBeenCalledWith(
      'part-01-web-foundations',
      'module-01-html',
      'html-elements'
    );
  });

  it('marks completed topics with completion indicator', () => {
    const completedTopics = new Set(['intro-to-html']);
    render(
      <ModuleSection {...defaultProps} isExpanded={true} completedTopics={completedTopics} />
    );
    expect(screen.getByLabelText('Completed')).toBeInTheDocument();
  });

  it('rotates chevron when expanded', () => {
    const { container } = render(<ModuleSection {...defaultProps} isExpanded={true} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('rotate-90');
  });

  it('does not rotate chevron when collapsed', () => {
    const { container } = render(<ModuleSection {...defaultProps} isExpanded={false} />);
    const svg = container.querySelector('svg');
    expect(svg).not.toHaveClass('rotate-90');
  });
});
