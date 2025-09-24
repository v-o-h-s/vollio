import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QuizHistoryList } from '../QuizHistoryList';
import { apiSlice } from '@/lib/store/apiSlice';

// Mock store setup
const mockStore = configureStore({
  reducer: {
    api: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

// Mock the API hook
jest.mock('@/lib/store/apiSlice', () => ({
  ...jest.requireActual('@/lib/store/apiSlice'),
  useGetQuizHistoryQuery: () => ({
    data: {
      data: {
        attempts: [],
        summary: {
          totalAttempts: 0,
          averageScore: 0,
          improvementTrend: 'stable' as const,
        },
      },
    },
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

describe('QuizHistoryList', () => {
  it('renders empty state when no quiz history exists', () => {
    render(
      <Provider store={mockStore}>
        <QuizHistoryList />
      </Provider>
    );

    expect(screen.getByText('No Quiz History')).toBeInTheDocument();
    expect(screen.getByText("You haven't taken any quizzes yet. Start by generating your first quiz!")).toBeInTheDocument();
  });

  it('renders loading state', () => {
    // Mock loading state
    const useGetQuizHistoryQuery = jest.fn(() => ({
      data: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    }));

    jest.doMock('@/lib/store/apiSlice', () => ({
      ...jest.requireActual('@/lib/store/apiSlice'),
      useGetQuizHistoryQuery,
    }));

    render(
      <Provider store={mockStore}>
        <QuizHistoryList />
      </Provider>
    );

    expect(screen.getByText('Loading quiz history...')).toBeInTheDocument();
  });
});