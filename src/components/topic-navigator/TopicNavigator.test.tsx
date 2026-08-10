import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TopicNavigator } from './TopicNavigator';
import { Part } from '@/types';

const mockParts: Part[] = [
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
          { slug: 'variables', title: 'Variables', type: 'code', order: 1 },
          { slug: 'functions', title: 'Functions', type: 'code', order: 2 },
        ],
      },
    ],
  },
];

describe('TopicNavigator', () => {
  it('renders a navigation element with proper ARIA attributes', () => {
    render(
      <TopicNavigator
        parts={mockParts}
        activeTopic={null}
        onTopicSelect={vi.fn()}
      />
    );

    const nav = screen.getByRole('navigation', { name: 'Topic Navigator' });
    expect(nav).toBeInTheDocument();
  });

  it('renders all Part sections', () => {
    render(
      <TopicNavigator
        parts={mockParts}
        activeTopic={null}
        onTopicSelect={vi.fn()}
      />
    );

    expect(screen.getByText(/Part 1 — Web Foundations/)).toBeInTheDocument();
    expect(screen.getByText(/Part 2 — JavaScript/)).toBeInTheDocument();
  });

  it('auto-expands the part containing the active topic on mount', () => {
    render(
      <TopicNavigator
        parts={mockParts}
        activeTopic="variables"
        onTopicSelect={vi.fn()}
      />
    );

    // Part 2 should be expanded and show its module content
    expect(screen.getByText(/Module 4 · JavaScript \| Basics/)).toBeInTheDocument();
    // The active topic should be visible
    expect(screen.getByText('Variables')).toBeInTheDocument();
  });

  it('does not show modules of collapsed parts', () => {
    render(
      <TopicNavigator
        parts={mockParts}
        activeTopic={null}
        onTopicSelect={vi.fn()}
      />
    );

    // No modules should be visible when no active topic and nothing expanded
    expect(screen.queryByText(/Module 1 · HTML/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Module 4 · JavaScript/)).not.toBeInTheDocument();
  });

  it('allows manual toggle of Part sections', () => {
    render(
      <TopicNavigator
        parts={mockParts}
        activeTopic={null}
        onTopicSelect={vi.fn()}
      />
    );

    // Click Part 1 to expand it
    fireEvent.click(screen.getByText(/Part 1 — Web Foundations/));
    expect(screen.getByText(/Module 1 · HTML \| Basics of Web Pages/)).toBeInTheDocument();

    // Click Part 1 again to collapse it
    fireEvent.click(screen.getByText(/Part 1 — Web Foundations/));
    expect(screen.queryByText(/Module 1 · HTML \| Basics of Web Pages/)).not.toBeInTheDocument();
  });

  it('calls onTopicSelect with correct slugs when a topic is clicked', () => {
    const onTopicSelect = vi.fn();

    render(
      <TopicNavigator
        parts={mockParts}
        activeTopic="intro-to-html"
        onTopicSelect={onTopicSelect}
      />
    );

    // Part 1 should be auto-expanded due to active topic being in it
    // Click on another topic in the same module
    fireEvent.click(screen.getByText('HTML Elements'));
    expect(onTopicSelect).toHaveBeenCalledWith('part-01-web-foundations', 'module-01-html', 'html-elements');
  });

  it('renders with empty parts array without crashing', () => {
    render(
      <TopicNavigator
        parts={[]}
        activeTopic={null}
        onTopicSelect={vi.fn()}
      />
    );

    const nav = screen.getByRole('navigation', { name: 'Topic Navigator' });
    expect(nav).toBeInTheDocument();
  });

  it('passes completedTopics to PartSection for progress display', () => {
    const completedTopics = new Set(['intro-to-html', 'html-elements', 'semantic-elements']);

    render(
      <TopicNavigator
        parts={mockParts}
        activeTopic="intro-to-html"
        onTopicSelect={vi.fn()}
        completedTopics={completedTopics}
      />
    );

    // Part 1 is expanded due to active topic - check that completed indicators are shown
    // The module should show completed count
    expect(screen.getByText('3/3 completed')).toBeInTheDocument();
  });

  it('auto-expands when activeTopic changes to a topic in a different part', () => {
    const { rerender } = render(
      <TopicNavigator
        parts={mockParts}
        activeTopic="intro-to-html"
        onTopicSelect={vi.fn()}
      />
    );

    // Part 1 should be expanded
    expect(screen.getByText(/Module 1 · HTML \| Basics of Web Pages/)).toBeInTheDocument();

    // Change active topic to Part 2
    rerender(
      <TopicNavigator
        parts={mockParts}
        activeTopic="variables"
        onTopicSelect={vi.fn()}
      />
    );

    // Part 2 should now also be expanded
    expect(screen.getByText(/Module 4 · JavaScript \| Basics/)).toBeInTheDocument();
  });
});
