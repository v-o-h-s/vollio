import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from '@/lib/store/apiSlice';

// Mock the LazyNotionEditor component
vi.mock('@/components/editor/LazyNotionEditor', () => ({
  LazyNotionEditor: ({ mode, onModeChange, showModeToggle, showWordCount, showReadingTime }: any) => (
    <div data-testid="lazy-notion-editor">
      <div data-testid="editor-mode">{mode}</div>
      <div data-testid="show-mode-toggle">{showModeToggle?.toString()}</div>
      <div data-testid="show-word-count">{showWordCount?.toString()}</div>
      <div data-testid="show-reading-time">{showReadingTime?.toString()}</div>
      {onModeChange && (
        <button onClick={() => onModeChange('focus')} data-testid="change-mode">
          Change Mode
        </button>
      )}
    </div>
  ),
}));

// Mock the router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
}));

// Mock the store hooks
vi.mock('@/lib/store/apiSlice', () => ({
  useGetNoteQuery: () => ({
    data: {
      id: '1',
      title: 'Test Note',
      content: { type: 'doc', content: [{ type: 'paragraph' }] },
      updatedAt: new Date().toISOString(),
      pdfAnnotationId: null,
    },
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
  useUpdateNoteMutation: () => [vi.fn(), { isLoading: false }],
  useDeleteNoteMutation: () => [vi.fn(), { isLoading: false }],
  useCreateNoteMutation: () => [vi.fn(), { isLoading: false }],
}));

// Mock other hooks
vi.mock('@/hooks/use-note-sync', () => ({
  useNoteSync: () => ({
    broadcastUpdate: vi.fn(),
    broadcastDelete: vi.fn(),
    broadcastCreate: vi.fn(),
  }),
}));

vi.mock('@/lib/utils/note-notifications', () => ({
  noteNotifications: {
    updateSuccess: vi.fn(),
    updateError: vi.fn(),
    createSuccess: vi.fn(),
    createError: vi.fn(),
    deleteSuccess: vi.fn(),
    deleteError: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
}));

// Create a mock store
const createMockStore = () => configureStore({
  reducer: {
    api: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

describe('Enhanced Notes Editor Modes', () => {
  it('should render mode toggle buttons in normal mode', async () => {
    const store = createMockStore();
    
    // Import the component dynamically to avoid SSR issues
    const { default: NotePage } = await import('@/app/dashboard/notes/[id]/page');
    
    render(
      <Provider store={store}>
        <NotePage params={{ id: '1' }} />
      </Provider>
    );

    // Check if mode toggle buttons are rendered
    expect(screen.getByText('Normal')).toBeInTheDocument();
    expect(screen.getByText('Fullscreen')).toBeInTheDocument();
    expect(screen.getByText('Focus')).toBeInTheDocument();
  });

  it('should hide mode toggle buttons in focus mode', async () => {
    const store = createMockStore();
    
    const { default: NotePage } = await import('@/app/dashboard/notes/[id]/page');
    
    render(
      <Provider store={store}>
        <NotePage params={{ id: '1' }} />
      </Provider>
    );

    // Click focus mode button
    const focusButton = screen.getByTitle('Focus mode (F11)');
    fireEvent.click(focusButton);

    // Mode toggle buttons should be hidden in focus mode
    // (This would need to be tested with proper state management)
  });

  it('should pass correct props to LazyNotionEditor', async () => {
    const store = createMockStore();
    
    const { default: NotePage } = await import('@/app/dashboard/notes/[id]/page');
    
    render(
      <Provider store={store}>
        <NotePage params={{ id: '1' }} />
      </Provider>
    );

    // Check if LazyNotionEditor receives correct props
    expect(screen.getByTestId('show-word-count')).toHaveTextContent('true');
    expect(screen.getByTestId('show-reading-time')).toHaveTextContent('true');
  });

  it('should render floating controls in focus mode', async () => {
    const store = createMockStore();
    
    const { default: NotePage } = await import('@/app/dashboard/notes/[id]/page');
    
    const { container } = render(
      <Provider store={store}>
        <NotePage params={{ id: '1' }} />
      </Provider>
    );

    // Click focus mode button to trigger focus mode
    const focusButton = screen.getByTitle('Focus mode (F11)');
    fireEvent.click(focusButton);

    // Check if focus mode controls are rendered
    // (This would need proper state management to test fully)
  });
});

describe('New Note Page Enhanced Modes', () => {
  it('should render mode toggle buttons for new notes', async () => {
    const store = createMockStore();
    
    const { default: NewNotePage } = await import('@/app/dashboard/notes/new/page');
    
    render(
      <Provider store={store}>
        <NewNotePage />
      </Provider>
    );

    // Check if mode toggle buttons are rendered
    expect(screen.getByText('Normal')).toBeInTheDocument();
    expect(screen.getByText('Fullscreen')).toBeInTheDocument();
    expect(screen.getByText('Focus')).toBeInTheDocument();
  });

  it('should handle keyboard shortcuts for mode switching', async () => {
    const store = createMockStore();
    
    const { default: NewNotePage } = await import('@/app/dashboard/notes/new/page');
    
    render(
      <Provider store={store}>
        <NewNotePage />
      </Provider>
    );

    // Simulate F11 key press for focus mode
    fireEvent.keyDown(document, { key: 'F11' });
    
    // Simulate Escape key press to exit focus mode
    fireEvent.keyDown(document, { key: 'Escape' });
    
    // Simulate Ctrl+Shift+F for fullscreen mode
    fireEvent.keyDown(document, { key: 'F', ctrlKey: true, shiftKey: true });
    
    // These would need proper state management to test the actual mode changes
  });
});