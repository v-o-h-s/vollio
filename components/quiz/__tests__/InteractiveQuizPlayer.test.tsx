import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { InteractiveQuizPlayer } from '../InteractiveQuizPlayer';
import { Quiz, QuizQuestion, QuizAttempt } from '@/lib/types';

// Mock the UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardDescription: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardHeader: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardTitle: ({ children, className }: any) => <div className={className}>{children}</div>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, className, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} className={className} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className }: any) => <span className={className}>{children}</span>,
}));

vi.mock('@/components/ui/progress', () => ({
  Progress: ({ value, className }: any) => (
    <div className={className} data-testid="progress" data-value={value} />
  ),
}));

vi.mock('@/components/ui/loading', () => ({
  LoadingSpinner: ({ className }: any) => <div className={className}>Loading...</div>,
}));

vi.mock('@/components/ui/error-notification', () => ({
  ErrorNotification: ({ title, message, onDismiss }: any) => (
    <div data-testid="error-notification">
      <h3>{title}</h3>
      <p>{message}</p>
      {onDismiss && <button onClick={onDismiss}>Dismiss</button>}
    </div>
  ),
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  ChevronLeft: () => <span>ChevronLeft</span>,
  ChevronRight: () => <span>ChevronRight</span>,
  Clock: () => <span>Clock</span>,
  CheckCircle: () => <span>CheckCircle</span>,
  XCircle: () => <span>XCircle</span>,
  RotateCcw: () => <span>RotateCcw</span>,
  Flag: () => <span>Flag</span>,
  BookOpen: () => <span>BookOpen</span>,
  Target: () => <span>Target</span>,
  Timer: () => <span>Timer</span>,
  Award: () => <span>Award</span>,
  ArrowRight: () => <span>ArrowRight</span>,
  ArrowLeft: () => <span>ArrowLeft</span>,
}));

describe('InteractiveQuizPlayer', () => {
  const mockQuiz: Quiz = {
    id: 'quiz-1',
    userId: 'user-1',
    title: 'Test Quiz',
    sourceDocumentIds: ['doc-1'],
    questionCount: 2,
    difficulty: 'medium',
    questionTypes: ['mcq', 'truefalse'],
    generationMethod: 'rag',
    metadata: {},
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockQuestions: QuizQuestion[] = [
    {
      id: 'q1',
      quizId: 'quiz-1',
      questionText: 'What is the capital of France?',
      questionType: 'mcq',
      options: ['London', 'Berlin', 'Paris', 'Madrid'],
      correctAnswer: 'Paris',
      explanation: 'Paris is the capital and largest city of France.',
      difficulty: 'easy',
      orderIndex: 0,
      sourceChunks: [],
      sourcePages: [1],
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'q2',
      quizId: 'quiz-1',
      questionText: 'The Earth is flat.',
      questionType: 'truefalse',
      correctAnswer: 'False',
      explanation: 'The Earth is approximately spherical in shape.',
      difficulty: 'easy',
      orderIndex: 1,
      sourceChunks: [],
      sourcePages: [2],
      createdAt: '2024-01-01T00:00:00Z',
    },
  ];

  const mockOnComplete = vi.fn();
  const mockOnExit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders quiz header with correct information', () => {
    render(
      <InteractiveQuizPlayer
        quiz={mockQuiz}
        questions={mockQuestions}
        onComplete={mockOnComplete}
        onExit={mockOnExit}
      />
    );

    expect(screen.getByText('Test Quiz')).toBeInTheDocument();
    expect(screen.getByText('2 questions')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
  });

  it('displays the first question initially', () => {
    render(
      <InteractiveQuizPlayer
        quiz={mockQuiz}
        questions={mockQuestions}
        onComplete={mockOnComplete}
        onExit={mockOnExit}
      />
    );

    expect(screen.getByText('What is the capital of France?')).toBeInTheDocument();
    expect(screen.getByText('London')).toBeInTheDocument();
    expect(screen.getByText('Berlin')).toBeInTheDocument();
    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.getByText('Madrid')).toBeInTheDocument();
  });

  it('allows selecting answers for MCQ questions', () => {
    render(
      <InteractiveQuizPlayer
        quiz={mockQuiz}
        questions={mockQuestions}
        onComplete={mockOnComplete}
        onExit={mockOnExit}
      />
    );

    const parisOption = screen.getByText('Paris').closest('button');
    expect(parisOption).toBeInTheDocument();
    
    fireEvent.click(parisOption!);
    
    // The button should be selected (this would be reflected in styling)
    expect(parisOption).toHaveClass('border-primary');
  });

  it('navigates between questions', () => {
    render(
      <InteractiveQuizPlayer
        quiz={mockQuiz}
        questions={mockQuestions}
        onComplete={mockOnComplete}
        onExit={mockOnExit}
      />
    );

    // Initially on question 1
    expect(screen.getByText('What is the capital of France?')).toBeInTheDocument();

    // Click next button
    const nextButton = screen.getByText('Next').closest('button');
    fireEvent.click(nextButton!);

    // Should now be on question 2
    expect(screen.getByText('The Earth is flat.')).toBeInTheDocument();
  });

  it('shows progress correctly', () => {
    render(
      <InteractiveQuizPlayer
        quiz={mockQuiz}
        questions={mockQuestions}
        onComplete={mockOnComplete}
        onExit={mockOnExit}
      />
    );

    expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
    expect(screen.getByText('0/2 answered')).toBeInTheDocument();

    // Answer first question
    const parisOption = screen.getByText('Paris').closest('button');
    fireEvent.click(parisOption!);

    expect(screen.getByText('1/2 answered')).toBeInTheDocument();
  });

  it('enables submit button when all questions are answered', async () => {
    render(
      <InteractiveQuizPlayer
        quiz={mockQuiz}
        questions={mockQuestions}
        onComplete={mockOnComplete}
        onExit={mockOnExit}
      />
    );

    // Submit button should not be visible initially
    expect(screen.queryByText('Submit Quiz')).not.toBeInTheDocument();

    // Answer first question
    const parisOption = screen.getByText('Paris').closest('button');
    fireEvent.click(parisOption!);

    // Navigate to second question
    const nextButton = screen.getByText('Next').closest('button');
    fireEvent.click(nextButton!);

    // Answer second question
    const falseOption = screen.getByText('False').closest('button');
    fireEvent.click(falseOption!);

    // Submit button should now be visible
    expect(screen.getByText('Submit Quiz')).toBeInTheDocument();
  });

  it('calls onComplete when quiz is submitted', async () => {
    render(
      <InteractiveQuizPlayer
        quiz={mockQuiz}
        questions={mockQuestions}
        onComplete={mockOnComplete}
        onExit={mockOnExit}
      />
    );

    // Answer first question
    const parisOption = screen.getByText('Paris').closest('button');
    fireEvent.click(parisOption!);

    // Navigate to second question
    const nextButton = screen.getByText('Next').closest('button');
    fireEvent.click(nextButton!);

    // Answer second question
    const falseOption = screen.getByText('False').closest('button');
    fireEvent.click(falseOption!);

    // Submit quiz
    const submitButton = screen.getByText('Submit Quiz').closest('button');
    fireEvent.click(submitButton!);

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          quizId: 'quiz-1',
          userId: 'user-1',
          answers: {
            q1: 'Paris',
            q2: 'False',
          },
          score: 100,
          totalQuestions: 2,
        })
      );
    });
  });

  it('shows results after quiz completion', async () => {
    render(
      <InteractiveQuizPlayer
        quiz={mockQuiz}
        questions={mockQuestions}
        onComplete={mockOnComplete}
        onExit={mockOnExit}
      />
    );

    // Answer questions and submit
    const parisOption = screen.getByText('Paris').closest('button');
    fireEvent.click(parisOption!);

    const nextButton = screen.getByText('Next').closest('button');
    fireEvent.click(nextButton!);

    const falseOption = screen.getByText('False').closest('button');
    fireEvent.click(falseOption!);

    const submitButton = screen.getByText('Submit Quiz').closest('button');
    fireEvent.click(submitButton!);

    await waitFor(() => {
      expect(screen.getByText('Score: 100%')).toBeInTheDocument();
      expect(screen.getByText('2/2 correct')).toBeInTheDocument();
    });
  });

  it('updates timer correctly', () => {
    render(
      <InteractiveQuizPlayer
        quiz={mockQuiz}
        questions={mockQuestions}
        onComplete={mockOnComplete}
        onExit={mockOnExit}
      />
    );

    // Initially shows 0:00
    expect(screen.getByText('0:00')).toBeInTheDocument();

    // Advance timer by 65 seconds
    vi.advanceTimersByTime(65000);

    // Should show 1:05
    expect(screen.getByText('1:05')).toBeInTheDocument();
  });

  it('handles true/false questions correctly', () => {
    render(
      <InteractiveQuizPlayer
        quiz={mockQuiz}
        questions={mockQuestions}
        onComplete={mockOnComplete}
        onExit={mockOnExit}
      />
    );

    // Navigate to true/false question
    const nextButton = screen.getByText('Next').closest('button');
    fireEvent.click(nextButton!);

    expect(screen.getByText('The Earth is flat.')).toBeInTheDocument();
    expect(screen.getByText('True')).toBeInTheDocument();
    expect(screen.getByText('False')).toBeInTheDocument();

    // Select False
    const falseOption = screen.getByText('False').closest('button');
    fireEvent.click(falseOption!);

    expect(falseOption).toHaveClass('border-primary');
  });

  it('calls onExit when exit button is clicked', () => {
    render(
      <InteractiveQuizPlayer
        quiz={mockQuiz}
        questions={mockQuestions}
        onComplete={mockOnComplete}
        onExit={mockOnExit}
      />
    );

    const exitButton = screen.getByText('Exit Quiz').closest('button');
    fireEvent.click(exitButton!);

    expect(mockOnExit).toHaveBeenCalled();
  });
});