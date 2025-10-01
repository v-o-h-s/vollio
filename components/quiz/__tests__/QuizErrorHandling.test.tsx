import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QuizGenerationErrorBoundary, QuizPlayerErrorBoundary } from '../QuizErrorBoundary';


// Mock the error handling utilities
vi.mock('@/lib/utils/error-handling', () => ({
  mapErrorToAppError: vi.fn((error) => ({
    type: 'UNKNOWN_ERROR',
    message: error.message,
    userMessage: error.message,
    severity: 'MEDIUM',
    retryable: true,
    timestamp: new Date(),
    context: { component: 'QuizComponent', action: 'test' }
  })),
  logError: vi.fn(),
  createAppError: vi.fn((type, message, context) => ({
    type,
    message,
    userMessage: message,
    severity: 'MEDIUM',
    retryable: true,
    timestamp: new Date(),
    context
  }))
}));

// Component that throws an error for testing
const ErrorThrowingComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error for quiz component');
  }
  return <div>Component working correctly</div>;
};

describe('Quiz Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should catch and display quiz generation errors', async () => {
    render(
      <QuizGenerationErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </QuizGenerationErrorBoundary>
    );

    // Should display error boundary fallback
    expect(screen.getByText('Quiz Generation Error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong while generating your quiz')).toBeInTheDocument();
    
    // Should show suggestions
    expect(screen.getByText('What you can try:')).toBeInTheDocument();
    expect(screen.getByText('Try reducing the number of questions')).toBeInTheDocument();
    
    // Should show action buttons
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Back to Quizzes')).toBeInTheDocument();
    expect(screen.getByText('Go Home')).toBeInTheDocument();
  });

  it('should catch and display quiz player errors', async () => {
    render(
      <QuizPlayerErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </QuizPlayerErrorBoundary>
    );

    // Should display error boundary fallback
    expect(screen.getByText('Quiz Player Error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong while taking the quiz')).toBeInTheDocument();
    
    // Should show player-specific suggestions
    expect(screen.getByText('Your progress has been saved')).toBeInTheDocument();
    expect(screen.getByText('Try refreshing the page')).toBeInTheDocument();
  });

  it('should allow retry functionality', async () => {
    const { rerender } = render(
      <QuizGenerationErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </QuizGenerationErrorBoundary>
    );

    // Error should be displayed
    expect(screen.getByText('Quiz Generation Error')).toBeInTheDocument();
    
    // Click try again button
    const tryAgainButton = screen.getByText('Try Again');
    fireEvent.click(tryAgainButton);

    // Rerender with working component
    rerender(
      <QuizGenerationErrorBoundary>
        <ErrorThrowingComponent shouldThrow={false} />
      </QuizGenerationErrorBoundary>
    );

    // Should show working component
    await waitFor(() => {
      expect(screen.getByText('Component working correctly')).toBeInTheDocument();
    });
  });

  it('should show technical details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <QuizGenerationErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </QuizGenerationErrorBoundary>
    );

    // Should show technical details section
    expect(screen.getByText('Technical Details (Development)')).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('should handle different error contexts appropriately', () => {
    // Test with different error boundary contexts
    const contexts = [
      { Component: QuizGenerationErrorBoundary, title: 'Quiz Generation Error' },
      { Component: QuizPlayerErrorBoundary, title: 'Quiz Player Error' }
    ];

    contexts.forEach(({ Component, title }) => {
      const { unmount } = render(
        <Component>
          <ErrorThrowingComponent shouldThrow={true} />
        </Component>
      );

      expect(screen.getByText(title)).toBeInTheDocument();
      unmount();
    });
  });
});