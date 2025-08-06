import { describe, it, expect, beforeEach } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import annotationSlice, {
  setPdfDocument,
  loadAnnotations,
  createAnnotation,
  updateAnnotation,
  deleteAnnotation,
  setActiveSelection,
  showTooltip,
  hideTooltip,
  showPreviewCard,
  hidePreviewCard,
  setHoveredAnnotation
} from '@/lib/store/annotationSlice'
import type { PDFDocument, Annotation, TextSelection } from '@/lib/types'

describe('annotationSlice', () => {
  let store: ReturnType<typeof configureStore>

  beforeEach(() => {
    store = configureStore({
      reducer: {
        annotations: annotationSlice,
      },
    })
  })

  const mockPdfDocument: PDFDocument = {
    id: 'pdf-1',
    userId: 'user-1',
    filename: 'test.pdf',
    uploadedAt: new Date(),
    fileUrl: 'blob:test-url'
  }

  const mockAnnotation: Annotation = {
    id: 'annotation-1',
    userId: 'user-1',
    pdfId: 'pdf-1',
    pageNumber: 1,
    selectedText: 'Test selected text',
    noteContent: 'Test note content',
    coordinates: { x: 100, y: 200, width: 150, height: 20 },
    createdAt: new Date(),
    updatedAt: new Date()
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
      expect(state.tooltipState).toEqual({
        visible: false,
        position: { x: 0, y: 0 }
      })
      expect(state.previewCard).toEqual({
        visible: false,
        annotationId: null,
        position: { x: 0, y: 0 }
      })
    })
  })

  describe('setPdfDocument', () => {
    it('should set the current PDF document', () => {
      store.dispatch(setPdfDocument(mockPdfDocument))
      
      const state = store.getState().annotations
      expect(state.currentPdf).toEqual(mockPdfDocument)
    })

    it('should clear annotations when setting new PDF', () => {
      // First set some annotations
      store.dispatch(loadAnnotations([mockAnnotation]))
      expect(Object.keys(store.getState().annotations.annotations)).toHaveLength(1)
      
      // Then set new PDF
      store.dispatch(setPdfDocument(mockPdfDocument))
      
      const state = store.getState().annotations
      expect(state.annotations).toEqual({})
    })
  })

  describe('loadAnnotations', () => {
    it('should load annotations into the store', () => {
      const annotations = [mockAnnotation, { ...mockAnnotation, id: 'annotation-2' }]
      
      store.dispatch(loadAnnotations(annotations))
      
      const state = store.getState().annotations
      expect(Object.keys(state.annotations)).toHaveLength(2)
      expect(state.annotations['annotation-1']).toEqual(mockAnnotation)
      expect(state.annotations['annotation-2']).toEqual({ ...mockAnnotation, id: 'annotation-2' })
    })

    it('should replace existing annotations', () => {
      // Load initial annotations
      store.dispatch(loadAnnotations([mockAnnotation]))
      expect(Object.keys(store.getState().annotations.annotations)).toHaveLength(1)
      
      // Load new set of annotations
      const newAnnotations = [{ ...mockAnnotation, id: 'annotation-2' }]
      store.dispatch(loadAnnotations(newAnnotations))
      
      const state = store.getState().annotations
      expect(Object.keys(state.annotations)).toHaveLength(1)
      expect(state.annotations['annotation-2']).toBeDefined()
      expect(state.annotations['annotation-1']).toBeUndefined()
    })
  })

  describe('createAnnotation', () => {
    it('should add new annotation to the store', () => {
      store.dispatch(createAnnotation(mockAnnotation))
      
      const state = store.getState().annotations
      expect(state.annotations['annotation-1']).toEqual(mockAnnotation)
    })

    it('should clear active selection after creating annotation', () => {
      store.dispatch(setActiveSelection(mockTextSelection))
      expect(store.getState().annotations.activeSelection).toEqual(mockTextSelection)
      
      store.dispatch(createAnnotation(mockAnnotation))
      
      const state = store.getState().annotations
      expect(state.activeSelection).toBeNull()
    })
  })

  describe('updateAnnotation', () => {
    it('should update existing annotation', () => {
      store.dispatch(createAnnotation(mockAnnotation))
      
      const updates = { noteContent: 'Updated note content' }
      store.dispatch(updateAnnotation({ id: 'annotation-1', updates }))
      
      const state = store.getState().annotations
      expect(state.annotations['annotation-1'].noteContent).toBe('Updated note content')
      expect(state.annotations['annotation-1'].updatedAt).toBeInstanceOf(Date)
    })

    it('should not update non-existent annotation', () => {
      const updates = { noteContent: 'Updated note content' }
      store.dispatch(updateAnnotation({ id: 'non-existent', updates }))
      
      const state = store.getState().annotations
      expect(state.annotations['non-existent']).toBeUndefined()
    })
  })

  describe('deleteAnnotation', () => {
    it('should remove annotation from store', () => {
      store.dispatch(createAnnotation(mockAnnotation))
      expect(store.getState().annotations.annotations['annotation-1']).toBeDefined()
      
      store.dispatch(deleteAnnotation('annotation-1'))
      
      const state = store.getState().annotations
      expect(state.annotations['annotation-1']).toBeUndefined()
    })

    it('should hide preview card if deleted annotation was being previewed', () => {
      store.dispatch(createAnnotation(mockAnnotation))
      store.dispatch(showPreviewCard({ annotationId: 'annotation-1', position: { x: 100, y: 200 } }))
      
      expect(store.getState().annotations.previewCard.visible).toBe(true)
      
      store.dispatch(deleteAnnotation('annotation-1'))
      
      const state = store.getState().annotations
      expect(state.previewCard.visible).toBe(false)
      expect(state.previewCard.annotationId).toBeNull()
    })
  })

  describe('tooltip state management', () => {
    it('should show tooltip at specified position', () => {
      const position = { x: 150, y: 250 }
      store.dispatch(showTooltip(position))
      
      const state = store.getState().annotations
      expect(state.tooltipState.visible).toBe(true)
      expect(state.tooltipState.position).toEqual(position)
    })

    it('should hide tooltip', () => {
      store.dispatch(showTooltip({ x: 150, y: 250 }))
      expect(store.getState().annotations.tooltipState.visible).toBe(true)
      
      store.dispatch(hideTooltip())
      
      const state = store.getState().annotations
      expect(state.tooltipState.visible).toBe(false)
    })
  })

  describe('preview card state management', () => {
    it('should show preview card for annotation', () => {
      const payload = { annotationId: 'annotation-1', position: { x: 200, y: 300 } }
      store.dispatch(showPreviewCard(payload))
      
      const state = store.getState().annotations
      expect(state.previewCard.visible).toBe(true)
      expect(state.previewCard.annotationId).toBe('annotation-1')
      expect(state.previewCard.position).toEqual({ x: 200, y: 300 })
    })

    it('should hide preview card', () => {
      store.dispatch(showPreviewCard({ annotationId: 'annotation-1', position: { x: 200, y: 300 } }))
      expect(store.getState().annotations.previewCard.visible).toBe(true)
      
      store.dispatch(hidePreviewCard())
      
      const state = store.getState().annotations
      expect(state.previewCard.visible).toBe(false)
      expect(state.previewCard.annotationId).toBeNull()
    })
  })

  describe('active selection management', () => {
    it('should set active text selection', () => {
      store.dispatch(sstoreetAcelection(mockTetiSelect = crea  teT 
      
      const state =    //  tooltipations
     ;ate.activeSeloEqual(mockTextS)
    })
sible).to
 hould clear active sel=> {
      sto(setActivection(moction))
      expe(store.getSannotations.activeSelection).toEqual(mockTSelection)
    
      stspatch(setion(null))
      
  state = store.getotations
      exstate.activtoBeNull()
    }
  })

  describoltip({ x: annotation manage 150,     e> {
    it('shgetState().annions.tooation', () => {
    ltipStatBispae(trsetHoveredAnnotatiue);annot-1'))
    
   onst stat= store.getState()otations
pect(state.hdAnnotation)e('annotation-1'
      // Then hide      storespatch(hideToo());

    it('should cle   hovered anno    at', () => {
   e.vpatch(setHovon('annotation-1'
      expect(sto().annotns.hoveredAnnotatitoBe('annotation')
      
 ispatch(setHoveredAnnotaull))
      
st state = store.annotations
      exptation).toBeNull()
 
    
})   state = store.({gte().anno);
 tatstate.tisible).Be(false);
      extooltipState. x: 0, 0 }); });
te
  e('preview card s manage() => { {
  
    ('should show preview  with annotation ID and position',   t store = createTee();
      const sition = { x: 200,};
      onId: ation.id, position }al(posit;
 'shoeview card
      store.dispatch(showPreviewCard({ 
        annotationId: mockAnnotation.id, 
        position: { x: 200, y: 300 } 
      }));
      expect(store.getState().annotations.previewCard.visible).toBe(true);
      
      // Then hide it
      store.dispatch(hidePreviewCard());
      
      const state = store.getState().annotations;
      expect(state.previewCard.visible).toBe(false);
      expect(state.previewCard.annotationId).toBeNull();
      expect(state.previewCard.position).toEqual({ x: 0, y: 0 });
    });
  });

  describe('setHoveredAnnotation', () => {
    it('should set hovered annotation ID', () => {
      const store = createTestStore();
      
      store.dispatch(setHoveredAnnotation(mockAnnotation.id));
      
      const state = store.getState().annotations;
      expect(state.hoveredAnnotation).toBe(mockAnnotation.id);
    });

    it('should clear hovered annotation when null is passed', () => {
      const store = createTestStore();
      
      // First set hovered annotation
      store.dispatch(setHoveredAnnotation(mockAnnotation.id));
      expect(store.getState().annotations.hoveredAnnotation).toBe(mockAnnotation.id);
      
      // Then clear it
      store.dispatch(setHoveredAnnotation(null));
      expect(store.getState().annotations.hoveredAnnotation).toBeNull();
    });
  });

  describe('clearAnnotations', () => {
    it('should clear all annotations from store', () => {
      const store = createTestStore();
      
      // First add some annotations
      const annotation1 = { ...mockAnnotation, id: 'annotation-1' };
      const annotation2 = { ...mockAnnotation, id: 'annotation-2' };
      store.dispatch(loadAnnotations([annotation1, annotation2]));
      expect(Object.keys(store.getState().annotations.annotations)).toHaveLength(2);
      
      // Then clear all
      store.dispatch(clearAnnotations());
      
      const state = store.getState().annotations;
      expect(Object.keys(state.annotations)).toHaveLength(0);
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
      
      // Show tooltip
      store.dispatch(showTooltip({ x: 100, y: 200 }));
      
      // Show preview card
      store.dispatch(showPreviewCard({ 
        annotationId: mockAnnotation.id, 
        position: { x: 150, y: 250 } 
      }));
      
      const state = store.getState().annotations;
      
      expect(state.currentPdf).toEqual(mockPdfDocument);
      expect(state.annotations[mockAnnotation.id]).toEqual(mockAnnotation);
      expect(state.activeSelection).toEqual(mockTextSelection);
      expect(state.tooltipState.visible).toBe(true);
      expect(state.previewCard.visible).toBe(true);
    });
  });
});
      // First t storuld he = createTestStoreid   });e preview> {
     

 
      tore.getState().annotard.vnnotationId).toBe(mockAnnotation.iis;
      expect(staible)eviewCard.positi.totitrue);
      ate.previewC
      expect(state.prev    const state   sre.dispatchviewCard({ an