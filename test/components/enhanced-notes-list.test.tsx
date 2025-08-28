import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EnhancedNotesList } from '@/components/ui/enhanced-notes-list';
import { Note } from '@/lib/types';

// Mock the enhanced note card component
vi.mock('@/components/ui/enhanced-note-card', () => ({
  EnhancedNoteCard: ({ note, variant, onEdit, onViewAnnotation, onDelete }: any) => (
    <div data-testid={`note-card-${note.id}`} data-variant={variant}>
      <h3>{note.title}</h3>
      <button onClick={() => onEdit(note.id)}>Edit {note.title}</button>
      {note.pdfAnnotationId && (
        <button onClick={() => onViewAnnotation(note.pdfAnnotationId)}>
          View PDF
        </button>
      )}
      {onDelete && (
        <button onClick={() => onDelete(note.id)}>Delete</button>
      )}
    </div>
  ),
}));

// Mock hooks
vi.mock('@/hooks/use-mobile', () => ({
  useMobile: vi.fn(() => ({ isMobile: false, isTablet: false, isDesktop: true, hasTouch: false, orientation: 'landscape', screenSize: 'lg' })),
}));

vi.mock('@/hooks/use-touch-gestures', () => ({
  useTouchGestures: vi.fn(() => ({})),
}));

describe('EnhancedNotesList', () => {
  const mockNotes: Note[] = [
    {
      id: '1',
      title: 'First Note',
      content: {
        type: 'doc',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'First note content' }] }
        ]
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T02:00:00Z',
      userId: 'user1',
      pdfAnnotationId: null,
    },
    {
      id: '2',
      title: 'Second Note',
      content: {
        type: 'doc',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'Second note content with more words to test filtering' }] }
        ]
      },
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T01:00:00Z',
      userId: 'user1',
      pdfAnnotationId: 'annotation-1',
    },
    {
      id: '3',
      title: 'Empty Note',
      content: { type: 'doc', content: [] },
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-03T00:00:00Z',
      userId: 'user1',
      pdfAnnotationId: null,
    },
  ];

  const mockProps = {
    notes: mockNotes,
    onCreateNote: vi.fn(),
    onEditNote: vi.fn(),
    onViewAnnotation: vi.fn(),
    onDeleteNote: vi.fn(),
    onDuplicateNote: vi.fn(),
    onToggleStarNote: vi.fn(),
    onViewModeChange: vi.fn(),
    onSortChange: vi.fn(),
    onFilterChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all notes in grid view by default', () => {
      render(<EnhancedNotesList {...mockProps} />);

      expect(screen.getByTestId('note-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('note-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('note-card-3')).toBeInTheDocument();
      
      // Should be in grid variant by default
      expect(screen.getByTestId('note-card-1')).toHaveAttribute('data-variant', 'grid');
    });

    it('should show correct results summary', () => {
      render(<EnhancedNotesList {...mockProps} />);

      expect(screen.getByText('3 notes')).toBeInTheDocument();
    });

    it('should render empty state when no notes', () => {
      render(<EnhancedNotesList {...mockProps} notes={[]} />);

      expect(screen.getByText('Start your note-taking journey')).toBeInTheDocument();
      expect(screen.getByText('Create your first note')).toBeInTheDocument();
    });
  });

  describe('View Mode Switching', () => {
    it('should switch between grid, list, and compact views', async () => {
      const user = userEvent.setup();
      
      render(<EnhancedNotesList {...mockProps} />);

      // Switch to list view
      const listButton = screen.getByTitle('List view');
      await user.click(listButton);

      expect(mockProps.onViewModeChange).toHaveBeenCalledWith('list');

      // Switch to compact view
      const compactButton = screen.getByTitle('Compact view');
      await user.click(compactButton);

      expect(mockProps.onViewModeChange).toHaveBeenCalledWith('compact');
    });

    it('should apply correct grid classes for different view modes', () => {
      const { rerender } = render(
        <EnhancedNotesList {...mockProps} viewMode="grid" />
      );

      let container = screen.getByTestId('note-card-1').parentElement?.parentElement;
      expect(container).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3');

      rerender(<EnhancedNotesList {...mockProps} viewMode="list" />);
      
      container = screen.getByTestId('note-card-1').parentElement?.parentElement;
      expect(container).toHaveClass('grid-cols-1');

      rerender(<EnhancedNotesList {...mockProps} viewMode="compact" />);
      
      container = screen.getByTestId('note-card-1').parentElement?.parentElement;
      expect(container).toHaveClass('sm:grid-cols-2', 'md:grid-cols-3', 'lg:grid-cols-4');
    });
  });

  describe('Search and Filtering', () => {
    it('should filter notes by search query', async () => {
      const user = userEvent.setup();
      
      render(<EnhancedNotesList {...mockProps} />);

      const searchInput = screen.getByPlaceholderText('Search notes...');
      await user.type(searchInput, 'First');

      expect(mockProps.onFilterChange).toHaveBeenCalledWith('First');
    });

    it('should show filtered results summary', () => {
      render(<EnhancedNotesList {...mockProps} filterBy="First" />);

      expect(screen.getByText('1 note matching "First"')).toBeInTheDocument();
    });

    it('should show search empty state when no results', () => {
      render(<EnhancedNotesList {...mockProps} notes={[]} filterBy="nonexistent" />);

      expect(screen.getByText('No notes found')).toBeInTheDocument();
      expect(screen.getByText(/No notes match your search for "nonexistent"/)).toBeInTheDocument();
    });

    it('should apply content-based filters', async () => {
      const user = userEvent.setup();
      
      render(<EnhancedNotesList {...mockProps} />);

      // Open filter dropdown
      const filterButton = screen.getByText('Filter');
      await user.click(filterButton);

      // Apply "Linked to PDFs" filter
      const linkedFilter = screen.getByText('Linked to PDFs');
      await user.click(linkedFilter);

      // Should show only notes with PDF annotations
      expect(screen.getByTestId('note-card-2')).toBeInTheDocument();
      expect(screen.queryByTestId('note-card-1')).not.toBeInTheDocument();
    });

    it('should show active filter badges', async () => {
      const user = userEvent.setup();
      
      render(<EnhancedNotesList {...mockProps} />);

      const filterButton = screen.getByText('Filter');
      await user.click(filterButton);

      const emptyFilter = screen.getByText('Empty Notes');
      await user.click(emptyFilter);

      // Should show filter badge
      expect(screen.getByText('empty')).toBeInTheDocument();
      expect(screen.getByText('1 note with 1 filter')).toBeInTheDocument();
    });

    it('should clear all filters', async () => {
      const user = userEvent.setup();
      
      render(<EnhancedNotesList {...mockProps} filterBy="test" />);

      // Apply a filter first
      const filterButton = screen.getByText('Filter');
      await user.click(filterButton);

      const linkedFilter = screen.getByText('Linked to PDFs');
      await user.click(linkedFilter);

      // Clear all filters
      const clearButton = screen.getByText('Clear all');
      await user.click(clearButton);

      expect(mockProps.onFilterChange).toHaveBeenCalledWith('');
    });
  });

  describe('Sorting', () => {
    it('should sort notes by different criteria', async () => {
      const user = userEvent.setup();
      
      render(<EnhancedNotesList {...mockProps} />);

      // Open sort dropdown
      const sortButton = screen.getByText('Sort');
      await user.click(sortButton);

      // Sort by title
      const titleSort = screen.getByText('Title');
      await user.click(titleSort);

      expect(mockProps.onSortChange).toHaveBeenCalledWith('title', 'desc');
    });

    it('should toggle sort order when clicking same criteria', async () => {
      const user = userEvent.setup();
      
      render(<EnhancedNotesList {...mockProps} sortBy="title" sortOrder="desc" />);

      const sortButton = screen.getByText('Sort');
      await user.click(sortButton);

      const titleSort = screen.getByText('Title');
      await user.click(titleSort);

      expect(mockProps.onSortChange).toHaveBeenCalledWith('title', 'asc');
    });

    it('should show current sort indicator', () => {
      render(<EnhancedNotesList {...mockProps} sortBy="title" sortOrder="asc" />);

      const sortButton = screen.getByText('Sort');
      fireEvent.click(sortButton);

      // Should show ascending indicator
      expect(screen.getByText('↑')).toBeInTheDocument();
    });
  });

  describe('Note Actions', () => {
    it('should handle note editing', async () => {
      const user = userEvent.setup();
      
      render(<EnhancedNotesList {...mockProps} />);

      const editButton = screen.getByText('Edit First Note');
      await user.click(editButton);

      expect(mockProps.onEditNote).toHaveBeenCalledWith('1');
    });

    it('should handle PDF annotation viewing', async () => {
      const user = userEvent.setup();
      
      render(<EnhancedNotesList {...mockProps} />);

      const pdfButton = screen.getByText('View PDF');
      await user.click(pdfButton);

      expect(mockProps.onViewAnnotation).toHaveBeenCalledWith('annotation-1');
    });

    it('should handle note creation from empty state', async () => {
      const user = userEvent.setup();
      
      render(<EnhancedNotesList {...mockProps} notes={[]} />);

      const createButton = screen.getByText('Create your first note');
      await user.click(createButton);

      expect(mockProps.onCreateNote).toHaveBeenCalled();
    });
  });

  describe('Responsive Behavior', () => {
    it('should adapt layout for mobile devices', () => {
      const { useMobile } = require('@/hooks/use-mobile');
      useMobile.mockReturnValue({ isMobile: true, isTablet: false, isDesktop: false, hasTouch: true, orientation: 'portrait', screenSize: 'sm' });

      render(<EnhancedNotesList {...mockProps} />);

      // Should still render but with mobile-optimized layout
      expect(screen.getByTestId('note-card-1')).toBeInTheDocument();
    });

    it('should show appropriate grid columns for different screen sizes', () => {
      render(<EnhancedNotesList {...mockProps} viewMode="compact" />);

      const container = screen.getByTestId('note-card-1').parentElement?.parentElement;
      expect(container).toHaveClass(
        'grid-cols-1',
        'sm:grid-cols-2',
        'md:grid-cols-3',
        'lg:grid-cols-4',
        'xl:grid-cols-5'
      );
    });
  });

  describe('Performance', () => {
    it('should handle large numbers of notes efficiently', () => {
      const manyNotes = Array.from({ length: 100 }, (_, i) => ({
        ...mockNotes[0],
        id: `note-${i}`,
        title: `Note ${i}`,
      }));

      const { container } = render(
        <EnhancedNotesList {...mockProps} notes={manyNotes} />
      );

      // Should render without performance issues
      expect(container.querySelectorAll('[data-testid^="note-card-"]')).toHaveLength(100);
    });

    it('should apply staggered animations to note cards', () => {
      render(<EnhancedNotesList {...mockProps} />);

      const noteItems = screen.getAllByTestId(/note-card-/);
      noteItems.forEach((item, index) => {
        const parent = item.parentElement;
        expect(parent).toHaveStyle(`animation-delay: ${Math.min(index * 50, 400)}ms`);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for controls', () => {
      render(<EnhancedNotesList {...mockProps} />);

      expect(screen.getByTitle('Grid view')).toBeInTheDocument();
      expect(screen.getByTitle('List view')).toBeInTheDocument();
      expect(screen.getByTitle('Compact view')).toBeInTheDocument();
    });

    it('should support keyboard navigation for view mode toggles', async () => {
      const user = userEvent.setup();
      
      render(<EnhancedNotesList {...mockProps} />);

      const gridButton = screen.getByTitle('Grid view');
      gridButton.focus();
      
      await user.keyboard('{Tab}');
      expect(screen.getByTitle('List view')).toHaveFocus();
      
      await user.keyboard('{Tab}');
      expect(screen.getByTitle('Compact view')).toHaveFocus();
    });

    it('should announce filter changes to screen readers', async () => {
      const user = userEvent.setup();
      
      render(<EnhancedNotesList {...mockProps} />);

      const searchInput = screen.getByPlaceholderText('Search notes...');
      await user.type(searchInput, 'test');

      // Results summary should be updated for screen readers
      expect(screen.getByText(/notes matching "test"/)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed note content gracefully', () => {
      const malformedNotes = [
        {
          ...mockNotes[0],
          content: null as any,
        },
        {
          ...mockNotes[0],
          id: '2',
          content: { type: 'invalid' } as any,
        },
      ];

      expect(() => {
        render(<EnhancedNotesList {...mockProps} notes={malformedNotes} />);
      }).not.toThrow();
    });

    it('should handle missing callback functions gracefully', () => {
      const propsWithoutCallbacks = {
        notes: mockNotes,
        onCreateNote: vi.fn(),
        onEditNote: vi.fn(),
      };

      expect(() => {
        render(<EnhancedNotesList {...propsWithoutCallbacks} />);
      }).not.toThrow();
    });
  });
});