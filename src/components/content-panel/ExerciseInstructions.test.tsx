import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ExerciseInstructions from './ExerciseInstructions';

vi.mock('./ContentViewer', () => ({
  default: ({ content }: { content: string }) => (
    <div data-testid="content-viewer" data-content={content}>
      {content}
    </div>
  ),
}));

vi.mock('highlight.js/styles/github-dark.css', () => ({}));

describe('ExerciseInstructions', () => {
  describe('Rendering', () => {
    it('renders the instructions panel with correct test id', () => {
      render(<ExerciseInstructions instructions="# Hello" />);
      expect(screen.getByTestId('exercise-instructions')).toBeInTheDocument();
    });

    it('renders the toggle button with label', () => {
      render(<ExerciseInstructions instructions="# Hello" />);
      expect(screen.getByTestId('exercise-instructions-toggle')).toBeInTheDocument();
      expect(screen.getByText('📋 Exercise Instructions')).toBeInTheDocument();
    });

    it('renders instructions content via ContentViewer', () => {
      render(<ExerciseInstructions instructions="Follow these steps..." />);
      const viewers = screen.getAllByTestId('content-viewer');
      expect(viewers[0]).toHaveAttribute('data-content', 'Follow these steps...');
    });
  });

  describe('Collapse/Expand behavior', () => {
    it('is expanded by default on initial load', () => {
      render(<ExerciseInstructions instructions="# Instructions" />);
      expect(screen.getByTestId('exercise-instructions-body')).toBeInTheDocument();
      expect(screen.getByTestId('exercise-instructions-toggle')).toHaveAttribute(
        'aria-expanded',
        'true'
      );
    });

    it('collapses when toggle button is clicked', () => {
      render(<ExerciseInstructions instructions="# Instructions" />);
      const toggle = screen.getByTestId('exercise-instructions-toggle');

      fireEvent.click(toggle);

      expect(screen.queryByTestId('exercise-instructions-body')).not.toBeInTheDocument();
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
    });

    it('re-expands when toggle button is clicked again', () => {
      render(<ExerciseInstructions instructions="# Instructions" />);
      const toggle = screen.getByTestId('exercise-instructions-toggle');

      fireEvent.click(toggle); // collapse
      fireEvent.click(toggle); // expand

      expect(screen.getByTestId('exercise-instructions-body')).toBeInTheDocument();
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Reference content', () => {
    it('does not render reference section when referenceContent is not provided', () => {
      render(<ExerciseInstructions instructions="# Instructions" />);
      expect(screen.queryByTestId('exercise-reference-content')).not.toBeInTheDocument();
    });

    it('does not render reference section when referenceContent is empty string', () => {
      render(<ExerciseInstructions instructions="# Instructions" referenceContent="" />);
      expect(screen.queryByTestId('exercise-reference-content')).not.toBeInTheDocument();
    });

    it('does not render reference section when referenceContent is whitespace only', () => {
      render(<ExerciseInstructions instructions="# Instructions" referenceContent="   " />);
      expect(screen.queryByTestId('exercise-reference-content')).not.toBeInTheDocument();
    });

    it('renders reference section when referenceContent is provided', () => {
      render(
        <ExerciseInstructions
          instructions="# Instructions"
          referenceContent="Expected output: Hello World"
        />
      );
      expect(screen.getByTestId('exercise-reference-content')).toBeInTheDocument();
      expect(screen.getByText('📎 Reference / Expected Output')).toBeInTheDocument();
    });

    it('renders reference content via ContentViewer', () => {
      render(
        <ExerciseInstructions
          instructions="# Instructions"
          referenceContent="Expected: 42"
        />
      );
      const viewers = screen.getAllByTestId('content-viewer');
      // First viewer is instructions, second is reference
      expect(viewers[1]).toHaveAttribute('data-content', 'Expected: 42');
    });

    it('hides reference section when panel is collapsed', () => {
      render(
        <ExerciseInstructions
          instructions="# Instructions"
          referenceContent="Expected output"
        />
      );
      const toggle = screen.getByTestId('exercise-instructions-toggle');
      fireEvent.click(toggle);

      expect(screen.queryByTestId('exercise-reference-content')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('toggle button has aria-expanded attribute', () => {
      render(<ExerciseInstructions instructions="# Instructions" />);
      const toggle = screen.getByTestId('exercise-instructions-toggle');
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
    });

    it('toggle button has aria-controls pointing to body', () => {
      render(<ExerciseInstructions instructions="# Instructions" />);
      const toggle = screen.getByTestId('exercise-instructions-toggle');
      expect(toggle).toHaveAttribute('aria-controls', 'exercise-instructions-body');
    });
  });
});
