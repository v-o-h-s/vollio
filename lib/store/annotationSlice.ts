import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PDFDocument } from "../types/pdf";
import { TextSelection } from "../types/pdf";
import { Annotation } from "../types/pdf";
// will be used when implementing notes 
interface PreviewCardState {
  visible: boolean;
  annotationId: string | null;
  position: { x: number; y: number };
}

interface AnnotationState {
  currentPdf: PDFDocument | null;
  annotations: Record<string, Annotation>;
  activeSelection: TextSelection | null;
  hoveredAnnotation: string | null;
  previewCard: PreviewCardState;
}

const initialState: AnnotationState = {
  currentPdf: null,
  annotations: {},
  activeSelection: null,
  hoveredAnnotation: null,
  previewCard: {
    visible: false,
    annotationId: null,
    position: { x: 0, y: 0 },
  },
};

const annotationSlice = createSlice({
  name: "annotations",
  initialState,
  reducers: {
    // PDF Document actions
    setPdfDocument: (state, action: PayloadAction<PDFDocument>) => {
      state.currentPdf = action.payload;
      // Clear UI state when switching PDFs
      state.activeSelection = null;
      state.hoveredAnnotation = null;
      state.previewCard.visible = false;
    },

    clearPdfDocument: (state) => {
      state.currentPdf = null;
      state.annotations = {};
      state.activeSelection = null;
      state.hoveredAnnotation = null;
      state.previewCard.visible = false;
    },

    // Annotation management actions
    loadAnnotations: (state, action: PayloadAction<Annotation[]>) => {
      state.annotations = {};
      action.payload.forEach((annotation) => {
        state.annotations[annotation.id] = annotation;
      });
    },

    addAnnotation: (state, action: PayloadAction<Annotation>) => {
      state.annotations[action.payload.id] = action.payload;
    },

    updateAnnotation: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Annotation> }>
    ) => {
      const { id, updates } = action.payload;
      if (state.annotations[id]) {
        state.annotations[id] = { ...state.annotations[id], ...updates };
      }
    },

    removeAnnotation: (state, action: PayloadAction<string>) => {
      delete state.annotations[action.payload];
    },

    // Text selection actions
    setActiveSelection: (
      state,
      action: PayloadAction<TextSelection | null>
    ) => {
      state.activeSelection = action.payload;
    },

    // Clear active selection after annotation creation
    clearActiveSelection: (state) => {
      state.activeSelection = null;
    },

    // Hover state actions
    setHoveredAnnotation: (state, action: PayloadAction<string | null>) => {
      state.hoveredAnnotation = action.payload;
    },

    // Preview card actions
    showPreviewCard: (
      state,
      action: PayloadAction<{
        annotationId: string;
        position: { x: number; y: number };
      }>
    ) => {
      state.previewCard.visible = true;
      state.previewCard.annotationId = action.payload.annotationId;
      state.previewCard.position = action.payload.position;
    },

    hidePreviewCard: (state) => {
      state.previewCard.visible = false;
      state.previewCard.annotationId = null;
    },

    updatePreviewCardPosition: (
      state,
      action: PayloadAction<{ x: number; y: number }>
    ) => {
      state.previewCard.position = action.payload;
    },
  },
});

export const {
  setPdfDocument,
  clearPdfDocument,
  loadAnnotations,
  addAnnotation,
  updateAnnotation,
  removeAnnotation,
  setActiveSelection,
  setHoveredAnnotation,
  showPreviewCard,
  hidePreviewCard,
  updatePreviewCardPosition,
  clearActiveSelection,
} = annotationSlice.actions;

export default annotationSlice.reducer;
