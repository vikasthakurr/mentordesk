import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TopicItem } from './TopicItem';
import { TopicMeta } from '@/types';

const baseTopic: TopicMeta = {
  slug: 'intro-to-html',
  title: 'Introduction to HTML',
  type: 'content',
  order: 1,
};

describe('TopicItem', () => {
  it('renders topic title', () => {
    render(
      <TopicItem topic={baseTopic} isActive={false} isCompleted={false} onClick={() => {}} />
    );
    expect(screen.getByText('Introduction to HTML')).toBeInTheDocument();
  });

  it('shows active highlight when isActive is true', () => {
    const { container } = render(
      <TopicItem topic={baseTopic} isActive={true} isCompleted={false} onClick={() => {}} />
    );
    const button = container.querySelector('button');
    expect(button).toHaveClass('bg-indigo-100');
    expect(button).toHaveClass('text-indigo-900');
    expect(button).toHaveAttribute('aria-current', 'true');
  });

  it('does not show active highlight when isActive is false', () => {
    const { container } = render(
      <TopicItem topic={baseTopic} isActive={false} isCompleted={false} onClick={() => {}} />
    );
    const button = container.querySelector('button');
    expect(button).not.toHaveClass('bg-indigo-100');
    expect(button).not.toHaveAttribute('aria-current');
  });

  it('shows emoji prefix when exerciseType is "art"', () => {
    const topic: TopicMeta = { ...baseTopic, exerciseType: 'art' };
    render(
      <TopicItem topic={topic} isActive={false} isCompleted={false} onClick={() => {}} />
    );
    expect(screen.getByText('🎨')).toBeInTheDocument();
  });

  it('shows emoji prefix when exerciseType is "build"', () => {
    const topic: TopicMeta = { ...baseTopic, exerciseType: 'build' };
    render(
      <TopicItem topic={topic} isActive={false} isCompleted={false} onClick={() => {}} />
    );
    expect(screen.getByText('🛠️')).toBeInTheDocument();
  });

  it('shows emoji prefix when exerciseType is "challenge"', () => {
    const topic: TopicMeta = { ...baseTopic, exerciseType: 'challenge' };
    render(
      <TopicItem topic={topic} isActive={false} isCompleted={false} onClick={() => {}} />
    );
    expect(screen.getByText('🧩')).toBeInTheDocument();
  });

  it('does not show emoji when exerciseType is not set', () => {
    const { container } = render(
      <TopicItem topic={baseTopic} isActive={false} isCompleted={false} onClick={() => {}} />
    );
    expect(container.querySelector('[aria-label*="exercise"]')).not.toBeInTheDocument();
  });

  it('shows completion indicator when isCompleted is true', () => {
    render(
      <TopicItem topic={baseTopic} isActive={false} isCompleted={true} onClick={() => {}} />
    );
    expect(screen.getByText('✓')).toBeInTheDocument();
    expect(screen.getByLabelText('Completed')).toBeInTheDocument();
  });

  it('does not show completion indicator when isCompleted is false', () => {
    render(
      <TopicItem topic={baseTopic} isActive={false} isCompleted={false} onClick={() => {}} />
    );
    expect(screen.queryByText('✓')).not.toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(
      <TopicItem topic={baseTopic} isActive={false} isCompleted={false} onClick={handleClick} />
    );
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when Enter key is pressed', () => {
    const handleClick = vi.fn();
    render(
      <TopicItem topic={baseTopic} isActive={false} isCompleted={false} onClick={handleClick} />
    );
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when Space key is pressed', () => {
    const handleClick = vi.fn();
    render(
      <TopicItem topic={baseTopic} isActive={false} isCompleted={false} onClick={handleClick} />
    );
    fireEvent.keyDown(screen.getByRole('button'), { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick for other keys', () => {
    const handleClick = vi.fn();
    render(
      <TopicItem topic={baseTopic} isActive={false} isCompleted={false} onClick={handleClick} />
    );
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Tab' });
    expect(handleClick).not.toHaveBeenCalled();
  });
});
