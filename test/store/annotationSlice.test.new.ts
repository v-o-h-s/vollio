import { describe, it, expect, beforeEach } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import annotationSlice, {
  setPdfDocument,
  loadAnnotations,
  addAnnotation,
  updateAnnotation,
  removeAnnotation,
  setActiveSelection,
  showPreviewCard,
  hidePreviewCard,
  setHoveredAnnotation,
  clearActiveSelection
} from '@/lib/store/annotationSlice'
import type { PDFDocument, Annotation, TextSelection } from '@/lib/types'

describe('annotationSlice', () => {
  let store: ReturnType<typeof configureStore>

  const createTestStore = () => {
    return configureStore({
      reducer: {
        annotations: annotationSlice,
      },
    })
  }

  beforeEach(() => {
    store = createTestStore()
  })

  const mockPdfDocument: PDFDocument = {
    id: 'pdf-1',
    userId: 'user-1',
    filename: 'test.pdf',
    fileSize: 1024,
    storagePath: 'storage/path',
    mimeType: 'application/pdf',
    uploadedAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    fileUrl: 'blob:test-url'
  }

  const mockAnnotation: Annotation = {
    id: 'annotation-1',
    userId: 'user-1',
    pdfId: 'pdf-1',
    pageNumber: 1,
    selectedText: 'Test selected text',
    content: 'Test note content',
    coordinates: { x: 100, y: 200, width: 150, height: 20 },
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  }

  const mockTextSelection: TextSelection = {
    text: 'Selected text',
    pageNumber: 1,
    coordinates: { x: 100, y: 200, width: 150, height: 20 },
    pdfId: 'pdf-1'
  }

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().annotations
      
      expect(state.currentPdf).toBeNull()
      expect(state.annotations).toEqual({})
      expect(state.activeSelection).toBeNull()
      expect(state.hoveredAnnotation).toBeNull()
      expect(state.previewCard).toEqual({
        visible: false,
        annotationId: null,
        position: { x: 0, y: 0 }
      })
    })
  })

  describe('setPdfDocument', () => {
    it('should set PDF document and clear UI state', () => {
      store.dispatch(setPdfDocument(mockPdfDocument))
      
      const state = store.getState().annotations
      expect(state.currentPdf).toEqual(mockPdfDocument)
      expect(state.activeSelection).toBeNull()
      expect(state.hoveredAnnotation).toBeNull()
    })
  })

  describe('loadAnnotations', () => {
    it('should load annotations array into normalized state', () => {
      store.dispatch(loadAnnotations([mockAnnotation]))
      expect(Object.keys(store.getState().annotations.annotations)).toHaveLength(1)
      
      const state = store.getState().annotations
      expect(state.annotations['annotation-1']).toEqual(mockAnnotation)
    })
  })

  describe('addAnnotation', () => {
    it('should add new annotation to the store', () => {
      store.dispatch(addAnnotation(mockAnnotation))
      
      const state = store.getState().annotations
      expect(state.annotations['annotation-1']).toEqual(mockAnnotation)
    })
  })

  describe('updateAnnotation', () => {
    it('should update existing annotation', () => {
      store.dispatch(addAnnotation(mockAnnotation))
      
      const updates = { selectedText: 'Updated note content' }
      store.dispatch(updateAnnotation({ id: 'annotation-1', updates }))
      
      const state = store.getState().annotations
      expect(state.annotations['annotation-1'].selectedText).toBe('Updated note content')
    })

    it('should not update non-existent annotation', () => {
      const updates = { selectedText: 'Updated content' }
      store.dispatch(updateAnnotation({ id: 'non-existent', updates }))
      
      const state = store.getState().annotations
      expect(state.annotations['non-existent']).toBeUndefined()
    })
  })

  describe('removeAnnotation', () => {
    it('should remove annotation from store', () => {
      store.dispatch(addAnnotation(mockAnnotation))
      expect(Object.keys(store.getState().annotations.annotations)).toHaveLength(1)
      
      store.dispatch(removeAnnotation('annotation-1'))
      
      const state = store.getState().annotations
      expect(state.annotations['annotation-1']).toBeUndefined()
      expect(Object.keys(state.annotations)).toHaveLength(0)
    })
  })

  describe('setActiveSelection', () => {
    it('should set active selection', () => {
      store.dispatch(setActiveSelection(mockTextSelection))
      
      const state = store.getState().annotations
      expect(state.activeSelection).toEqual(mockTextSelection)
    })

    it('should clear active selection', () => {
      store.dispatch(setActiveSelection(mockTextSelection))
      expect(store.getState().annotations.activeSelection).toEqual(mockTextSelection)
    
      store.dispatch(setActiveSelection(null))
      
      const state = store.getState().annotations
      expect(state.activeSelection).toBeNull()
    })
  })

  describe('annotation hover management', () => {
    it('should set hovered annotation', () => {
      const store = createTestStore();
      store.dispatch(setHoveredAnnotation('annotation-1'));
      
      const state = store.getState().annotations;
      expect(state.hoveredAnnotation).toBe('annotation-1');
    });

    it('should clear hovered annotation', () => {
      const store = createTestStore();
      store.dispatch(setHoveredAnnotation('annotation-1'));
      expect(store.getState().annotations.hoveredAnnotation).toBe('annotation-1');
      
      store.dispatch(setHoveredAnnotation(null));
      
      const state = store.getState().annotations;
      expect(state.hoveredAnnotation).toBeNull();
    });
  });

  describe('preview card state management', () => {
    it('should show preview card for annotation', () => {
      const store = createTestStore();
      store.dispatch(showPreviewCard({ 
        annotationId: 'annotation-1', 
        position: { x: 100, y: 200 } 
      }));
      
      const state = store.getState().annotations;
      expect(state.previewCard.visible).toBe(true);
      expect(state.previewCard.annotationId).toBe('annotation-1');
      expect(state.previewCard.position).toEqual({ x: 100, y: 200 });
    });

    it('should hide preview card', () => {
      const store = createTestStore();
      store.dispatch(showPreviewCard({ 
        annotationId: 'annotation-1', 
        position: { x: 100, y: 200 } 
      }));
      expect(store.getState().annotations.previewCard.visible).toBe(true);
      
      store.dispatch(hidePreviewCard());
      
      const state = store.getState().annotations;
      expect(state.previewCard.visible).toBe(false);
      expect(state.previewCard.annotationId).toBeNull();
    });
  });

  describe('complex state interactions', () => {
    it('should handle multiple state changes correctly', () => {
      const store = createTestStore();
      
      // Set PDF document
      store.dispatch(setPdfDocument(mockPdfDocument));
      
      // Load annotations
      store.dispatch(loadAnnotations([mockAnnotation]));
      
      // Set active selection
      store.dispatch(setActiveSelection(mockTextSelection));
      
      // Show preview card
      store.dispatch(showPreviewCard({ 
        annotationId: mockAnnotation.id, 
        position: { x: 100, y: 200 } 
      }));
      
      const state = store.getState().annotations;
      
      // Verify all state is correct
      expect(state.currentPdf).toEqual(mockPdfDocument);
      expect(state.annotations[mockAnnotation.id]).toEqual(mockAnnotation);
      expect(state.activeSelection).toEqual(mockTextSelection);
      expect(state.previewCard.visible).toBe(true);
      expect(state.previewCard.annotationId).toBe(mockAnnotation.id);
    });
  });
});
