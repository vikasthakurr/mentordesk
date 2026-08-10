import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MarkAsCompletedButton from './MarkAsCompletedButton';
import * as progress from '@/lib/progress';

vi.mock('@/lib/progress', () => ({
  isTopicComplete: vi.fn(),
  markTopicComplete: vi.fn(),
  markTopicIncomplete: vi.fn(),
}));

describe('MarkAsCompletedButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (progress.isTopicComplete as ReturnType<typeof vi.fn>).mockReturnValue(false);
    (progress.markTopicComplete as ReturnType<typeof vi.fn>).mockReturnValue(true);
  });

  describe('rendering', () => {
    it('renders with "Mark as completed" text when topic is not completed', () => {
      render(<MarkAsCompletedButton topicSlug="intro-to-html" />);

      const button = screen.getByTestId('mark-completed-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Mark as completed');
    });

    it('renders with "Completed" text and checkmark when topic is completed', () => {
      (progress.isTopicComplete as ReturnType<typeof vi.fn>).mockReturnValue(true);

      render(<MarkAsCompletedButton topicSlug="intro-to-html" />);

      const button = screen.getByTestId('mark-completed-button');
      expect(button).toHaveTextContent('Completed');
    });

    it('has aria-pressed=false when not completed', () => {
      render(<MarkAsCompletedButton topicSlug="intro-to-html" />);

      const button = screen.getByTestId('mark-completed-button');
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });

    it('has aria-pressed=true when completed', () => {
      (progress.isTopicComplete as ReturnType<typeof vi.fn>).mockReturnValue(true);

      render(<MarkAsCompletedButton topicSlug="intro-to-html" />);

      const button = screen.getByTestId('mark-completed-button');
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('toggle behavior', () => {
    it('marks topic as complete when clicked from incomplete state', () => {
      render(<MarkAsCompletedButton topicSlug="intro-to-html" />);

      fireEvent.click(screen.getByTestId('mark-completed-button'));

      expect(progress.markTopicComplete).toHaveBeenCalledWith('intro-to-html');
    });

    it('marks topic as incomplete when clicked from completed state', () => {
      (progress.isTopicComplete as ReturnType<typeof vi.fn>).mockReturnValue(true);

      render(<MarkAsCompletedButton topicSlug="intro-to-html" />);

      fireEvent.click(screen.getByTestId('mark-completed-button'));

      expect(progress.markTopicIncomplete).toHaveBeenCalledWith('intro-to-html');
    });

    it('updates visual state after toggling to completed', () => {
      render(<MarkAsCompletedButton topicSlug="intro-to-html" />);

      const button = screen.getByTestId('mark-completed-button');
      expect(button).toHaveTextContent('Mark as completed');

      fireEvent.click(button);

      expect(button).toHaveTextContent('Completed');
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('updates visual state after toggling to incomplete', () => {
      (progress.isTopicComplete as ReturnType<typeof vi.fn>).mockReturnValue(true);

      render(<MarkAsCompletedButton topicSlug="intro-to-html" />);

      const button = screen.getByTestId('mark-completed-button');
      expect(button).toHaveTextContent('Completed');

      fireEvent.click(button);

      expect(button).toHaveTextContent('Mark as completed');
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });

    it('calls onToggle callback with new state when toggling to completed', () => {
      const onToggle = vi.fn();
      render(<MarkAsCompletedButton topicSlug="intro-to-html" onToggle={onToggle} />);

      fireEvent.click(screen.getByTestId('mark-completed-button'));

      expect(onToggle).toHaveBeenCalledWith(true);
    });

    it('calls onToggle callback with new state when toggling to incomplete', () => {
      (progress.isTopicComplete as ReturnType<typeof vi.fn>).mockReturnValue(true);
      const onToggle = vi.fn();

      render(<MarkAsCompletedButton topicSlug="intro-to-html" onToggle={onToggle} />);

      fireEvent.click(screen.getByTestId('mark-completed-button'));

      expect(onToggle).toHaveBeenCalledWith(false);
    });

    it('does not update state if markTopicComplete returns false (storage failure)', () => {
      (progress.markTopicComplete as ReturnType<typeof vi.fn>).mockReturnValue(false);
      const onToggle = vi.fn();

      render(<MarkAsCompletedButton topicSlug="intro-to-html" onToggle={onToggle} />);

      const button = screen.getByTestId('mark-completed-button');
      fireEvent.click(button);

      // State should remain unchanged
      expect(button).toHaveTextContent('Mark as completed');
      expect(button).toHaveAttribute('aria-pressed', 'false');
      expect(onToggle).not.toHaveBeenCalled();
    });
  });

  describe('topic slug changes', () => {
    it('re-checks completion state when topicSlug changes', () => {
      (progress.isTopicComplete as ReturnType<typeof vi.fn>)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);

      const { rerender } = render(
        <MarkAsCompletedButton topicSlug="intro-to-html" />
      );

      expect(screen.getByTestId('mark-completed-button')).toHaveTextContent(
        'Mark as completed'
      );

      rerender(<MarkAsCompletedButton topicSlug="html-elements" />);

      expect(screen.getByTestId('mark-completed-button')).toHaveTextContent(
        'Completed'
      );
      expect(progress.isTopicComplete).toHaveBeenCalledWith('html-elements');
    });
  });

  describe('styling', () => {
    it('applies outline/ghost style when not completed', () => {
      render(<MarkAsCompletedButton topicSlug="intro-to-html" />);

      const button = screen.getByTestId('mark-completed-button');
      expect(button).toHaveClass('bg-white');
      expect(button).toHaveClass('border-gray-300');
      expect(button).toHaveClass('text-gray-700');
    });

    it('applies filled/solid green style when completed', () => {
      (progress.isTopicComplete as ReturnType<typeof vi.fn>).mockReturnValue(true);

      render(<MarkAsCompletedButton topicSlug="intro-to-html" />);

      const button = screen.getByTestId('mark-completed-button');
      expect(button).toHaveClass('bg-green-600');
      expect(button).toHaveClass('text-white');
      expect(button).toHaveClass('border-green-600');
    });
  });
});
