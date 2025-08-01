import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Annotation, PDFDocument, TextSelection } from "../types";

interface TooltipState {
  visible: boolean;
  position: { x: number; y: number };
}

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
  tooltipState: TooltipState;
  previewCard: PreviewCardState;
}

const initialState: AnnotationState = {
  currentPdf: null,
  annotations: {},
  activeSelection: null,
  hoveredAnnotation: null,
  tooltipState: {
    visible: false,
    position: { x: 0, y: 0 },
  },
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
      // Clear annotations when switching PDFs
      state.annotations = {};
      state.activeSelection = null;
      state.hoveredAnnotation = null;
      state.tooltipState.visible = false;
      state.previewCard.visible = false;
    },

    clearPdfDocument: (state) => {
      state.currentPdf = null;
      state.annotations = {};
      state.activeSelection = null;
      state.hoveredAnnotation = null;
      state.tooltipState.visible = false;
      state.previewCard.visible = false;
    },

    // Annotation CRUD actions
    loadAnnotations: (state, action: PayloadAction<Annotation[]>) => {
      state.annotations = {};
      action.payload.forEach((annotation) => {
        state.annotations[annotation.id] = annotation;
      });
    },

    createAnnotation: (state, action: PayloadAction<Annotation>) => {
      state.annotations[action.payload.id] = action.payload;
      // Clear active selection after creating annotation
      state.activeSelection = null;
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

    deleteAnnotation: (state, action: PayloadAction<string>) => {
      delete state.annotations[action.payload];
      // Clear preview card if it's showing the deleted annotation
      if (state.previewCard.annotationId === action.payload) {
        state.previewCard.visible = false;
        state.previewCard.annotationId = null;
      }
    },

    // Text selection actions
    setActiveSelection: (
      state,
      action: PayloadAction<TextSelection | null>
    ) => {
      state.activeSelection = action.payload;
    },

    // Hover state actions
    setHoveredAnnotation: (state, action: PayloadAction<string | null>) => {
      state.hoveredAnnotation = action.payload;
    },

    // Tooltip actions
    showTooltip: (state, action: PayloadAction<{ x: number; y: number }>) => {
      state.tooltipState.visible = true;
      state.tooltipState.position = action.payload;
    },

    hideTooltip: (state) => {
      state.tooltipState.visible = false;
    },

    updateTooltipPosition: (
      state,
      action: PayloadAction<{ x: number; y: number }>
    ) => {
      state.tooltipState.position = action.payload;
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
  createAnnotation,
  updateAnnotation,
  deleteAnnotation,
  setActiveSelection,
  setHoveredAnnotation,
  showTooltip,
  hideTooltip,
  updateTooltipPosition,
  showPreviewCard,
  hidePreviewCard,
  updatePreviewCardPosition,
} = annotationSlice.actions;

export default annotationSlice.reducer;
