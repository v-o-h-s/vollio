import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EnhancedNoteCard } from '@/components/ui/enhanced-note-card';
import { Note } from '@/lib/types';

// Mock date utilities
vi.mock('@/lib/utils/dates', () => ({
  safeFormatDistanceToNow: vi.fn(() => '2 hours ago'),
}));

describe('EnhancedNoteCard', () => {
  const mockNote: Note = {
    id: '1',
    title: 'Test Note',
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'This is a test note content with some text.' }]
        }
      ]
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T02:00:00Z',
    userId: 'user1',
    pdfAnnotationId: null,
  };

  const mockNoteWithPDF: Note = {
    ...mockNote,
    id: '2',
    pdfAnnotationId: 'annotation-1',
  };

  const mockProps = {
    onEdit: vi.fn(),
    onViewAnnotation: vi.fn(),
    onDelete: vi.fn(),
    onDuplicate: vi.fn(),
    onToggleStar: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Grid Variant', () => {
    it('should render note card with title and content preview', () => {
      render(
        <EnhancedNoteCard
          note={mockNote}
          variant="grid"
          {...mockProps}
        />
      );

      expect(screen.getByText('Test Note')).toBeInTheDocument();
      expect(screen.getByText('This is a test note content with some text.')).toBeInTheDocument();
    });

    it('should show metadata including word count and reading time', () => {
      render(
        <EnhancedNoteCard
          note={mockNote}
          variant="grid"
          showMetadata={true}
          {...mockProps}
        />
      );

      expect(screen.getByText('2 hours ago')).toBeInTheDocument();
      expect(screen.getByText('10 words')).toBeInTheDocument();
      expect(screen.getByText('1 min read')).toBeInTheDocument();
    });

    it('should call onEdit when card is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <EnhancedNoteCard
          note={mockNote}
          variant="grid"
          {...mockProps}
        />
      );

      const card = screen.getByRole('button', { name: /test note/i });
      await user.click(card);

      expect(mockProps.onEdit).toHaveBeenCalledWith('1');
    });

    it('should show PDF annotation badge when linked', () => {
      render(
        <EnhancedNoteCard
          note={mockNoteWithPDF}
          variant="grid"
          {...mockProps}
        />
      );

      expect(screen.getByText('Linked to PDF')).toBeInTheDocument();
    });

    it('should show hover actions on mouse enter', async () => {
      const user = userEvent.setup();
      
      render(
        <EnhancedNoteCard
          note={mockNote}
          variant="grid"
          {...mockProps}
        />
      );

      const card = screen.getByRole('button', { name: /test note/i });
      await user.hover(card);

      // Actions should become visible
      expect(screen.getByTitle('Star note')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /more/i })).toBeInTheDocument();
    });
  });

  describe('List Variant', () => {
    it('should render in list layout with horizontal arrangement', () => {
      render(
        <EnhancedNoteCard
          note={mockNote}
          variant="list"
          {...mockProps}
        />
      );

      const card = screen.getByRole('button', { name: /test note/i });
      expect(card).toHaveClass('border-l-4');
    });

    it('should show inline actions in list view', async () => {
      const user = userEvent.setup();
      
      render(
        <EnhancedNoteCard
          note={mockNote}
          variant="list"
          {...mockProps}
        />
      );

      const card = screen.getByRole('button', { name: /test note/i });
      await user.hover(card);

      expect(screen.getByTitle('Star note')).toBeInTheDocument();
    });
  });

  describe('Compact Variant', () => {
    it('should render in compact layout without preview text', () => {
      render(
        <EnhancedNoteCard
          note={mockNote}
          variant="compact"
          {...mockProps}
        />
      );

      expect(screen.getByText('Test Note')).toBeInTheDocument();
      // Preview text should not be shown in compact mode
      expect(screen.queryByText('This is a test note content with some text.')).not.toBeInTheDocument();
    });

    it('should show limited metadata in compact view', () => {
      render(
        <EnhancedNoteCard
          note={mockNote}
          variant="compact"
          showMetadata={true}
          {...mockProps}
        />
      );

      expect(screen.getByText('2 hours ago')).toBeInTheDocument();
      // Word count should not be shown in compact mode
      expect(screen.queryByText('10 words')).not.toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should call onViewAnnotation when PDF link is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <EnhancedNoteCard
          note={mockNoteWithPDF}
          variant="grid"
          {...mockProps}
        />
      );

      const card = screen.getByRole('button', { name: /test note/i });
      await user.hover(card);

      const pdfLink = screen.getByTitle('View PDF annotation');
      await user.click(pdfLink);

      expect(mockProps.onViewAnnotation).toHaveBeenCalledWith('annotation-1');
    });

    it('should call onToggleStar when star button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <EnhancedNoteCard
          note={mockNote}
          variant="grid"
          {...mockProps}
        />
      );

      const card = screen.getByRole('button', { name: /test note/i });
      await user.hover(card);

      const starButton = screen.getByTitle('Star note');
      await user.click(starButton);

      expect(mockProps.onToggleStar).toHaveBeenCalledWith('1');
    });

    it('should open dropdown menu and call actions', async () => {
      const user = userEvent.setup();
      
      render(
        <EnhancedNoteCard
          note={mockNote}
          variant="grid"
          {...mockProps}
        />
      );

      const card = screen.getByRole('button', { name: /test note/i });
      await user.hover(card);

      const moreButton = screen.getByRole('button', { name: /more/i });
      await user.click(moreButton);

      // Check dropdown items
      expect(screen.getByText('Edit Note')).toBeInTheDocument();
      expect(screen.getByText('Duplicate')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();

      // Click duplicate
      const duplicateButton = screen.getByText('Duplicate');
      await user.click(duplicateButton);

      expect(mockProps.onDuplicate).toHaveBeenCalledWith('1');
    });

    it('should prevent event propagation on action buttons', async () => {
      const user = userEvent.setup();
      
      render(
        <EnhancedNoteCard
          note={mockNote}
          variant="grid"
          {...mockProps}
        />
      );

      const card = screen.getByRole('button', { name: /test note/i });
      await user.hover(card);

      const starButton = screen.getByTitle('Star note');
      await user.click(starButton);

      // onEdit should not be called when clicking action buttons
      expect(mockProps.onEdit).not.toHaveBeenCalled();
      expect(mockProps.onToggleStar).toHaveBeenCalledWith('1');
    });
  });

  describe('Content Processing', () => {
    it('should handle empty content gracefully', () => {
      const emptyNote: Note = {
        ...mockNote,
        content: { type: 'doc', content: [] },
      };

      render(
        <EnhancedNoteCard
          note={emptyNote}
          variant="grid"
          {...mockProps}
        />
      );

      expect(screen.getByText('Empty note')).toBeInTheDocument();
      expect(screen.getByText('0 words')).toBeInTheDocument();
    });

    it('should truncate long content in preview', () => {
      const longNote: Note = {
        ...mockNote,
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ 
                type: 'text', 
                text: 'This is a very long note content that should be truncated when displayed in the preview. '.repeat(10)
              }]
            }
          ]
        },
      };

      render(
        <EnhancedNoteCard
          note={longNote}
          variant="grid"
          showPreview={true}
          {...mockProps}
        />
      );

      const previewText = screen.getByText(/This is a very long note content/);
      expect(previewText.textContent).toMatch(/\.\.\.$/);
    });

    it('should calculate word count correctly', () => {
      const multiParagraphNote: Note = {
        ...mockNote,
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'First paragraph with five words.' }]
            },
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Second paragraph with four words.' }]
            }
          ]
        },
      };

      render(
        <EnhancedNoteCard
          note={multiParagraphNote}
          variant="grid"
          showMetadata={true}
          {...mockProps}
        />
      );

      expect(screen.getByText('9 words')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(
        <EnhancedNoteCard
          note={mockNote}
          variant="grid"
          {...mockProps}
        />
      );

      const card = screen.getByRole('button');
      expect(card).toBeInTheDocument();
      
      // Action buttons should have proper titles
      fireEvent.mouseEnter(card);
      expect(screen.getByTitle('Star note')).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <EnhancedNoteCard
          note={mockNote}
          variant="grid"
          {...mockProps}
        />
      );

      const card = screen.getByRole('button');
      
      // Focus and activate with keyboard
      card.focus();
      await user.keyboard('{Enter}');

      expect(mockProps.onEdit).toHaveBeenCalledWith('1');
    });
  });

  describe('Responsive Behavior', () => {
    it('should apply correct classes for different variants', () => {
      const { rerender } = render(
        <EnhancedNoteCard
          note={mockNote}
          variant="grid"
          {...mockProps}
        />
      );

      let card = screen.getByRole('button');
      expect(card).toHaveClass('p-6');

      rerender(
        <EnhancedNoteCard
          note={mockNote}
          variant="list"
          {...mockProps}
        />
      );

      card = screen.getByRole('button');
      expect(card).toHaveClass('border-l-4');

      rerender(
        <EnhancedNoteCard
          note={mockNote}
          variant="compact"
          {...mockProps}
        />
      );

      card = screen.getByRole('button');
      expect(card).toHaveClass('p-4');
    });
  });
});