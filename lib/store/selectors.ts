import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "./index";
import { Annotation } from "../types";

// Base selectors
export const selectAnnotationState = (state: RootState) => state.annotations;
export const selectCurrentPdf = (state: RootState) =>
  state.annotations.currentPdf;
export const selectAllAnnotations = (state: RootState) =>
  state.annotations.annotations;
export const selectActiveSelection = (state: RootState) =>
  state.annotations.activeSelection;
export const selectHoveredAnnotation = (state: RootState) =>
  state.annotations.hoveredAnnotation;
export const selectTooltipState = (state: RootState) =>
  state.annotations.tooltipState;
export const selectPreviewCard = (state: RootState) =>
  state.annotations.previewCard;

// Memoized selectors
export const selectAnnotationsArray = createSelector(
  [selectAllAnnotations],
  (annotations): Annotation[] => Object.values(annotations)
);

export const selectAnnotationsByPage = createSelector(
  [selectAllAnnotations, (_state: RootState, pageNumber: number) => pageNumber],
  (annotations, pageNumber): Annotation[] =>
    Object.values(annotations).filter(
      (annotation) => annotation.pageNumber === pageNumber
    )
);

export const selectAnnotationById = createSelector(
  [selectAllAnnotations, (_state: RootState, id: string) => id],
  (annotations, id): Annotation | undefined => annotations[id]
);

export const selectAnnotationsForCurrentPdf = createSelector(
  [selectAllAnnotations, selectCurrentPdf],
  (annotations, currentPdf): Annotation[] => {
    if (!currentPdf) return [];
    return Object.values(annotations).filter(
      (annotation) => annotation.pdfId === currentPdf.id
    );
  }
);

export const selectPreviewCardAnnotation = createSelector(
  [selectAllAnnotations, selectPreviewCard],
  (annotations, previewCard): Annotation | null => {
    if (!previewCard.visible || !previewCard.annotationId) return null;
    return annotations[previewCard.annotationId] || null;
  }
);

export const selectHoveredAnnotationData = createSelector(
  [selectAllAnnotations, selectHoveredAnnotation],
  (annotations, hoveredId): Annotation | null => {
    if (!hoveredId) return null;
    return annotations[hoveredId] || null;
  }
);

export const selectIsTooltipVisible = createSelector(
  [selectTooltipState],
  (tooltipState): boolean => tooltipState.visible
);

export const selectIsPreviewCardVisible = createSelector(
  [selectPreviewCard],
  (previewCard): boolean => previewCard.visible
);

// Utility selectors
export const selectHasAnnotations = createSelector(
  [selectAllAnnotations],
  (annotations): boolean => Object.keys(annotations).length > 0
);

export const selectAnnotationCount = createSelector(
  [selectAllAnnotations],
  (annotations): number => Object.keys(annotations).length
);

export const selectAnnotationCountByPage = createSelector(
  [selectAllAnnotations, (_state: RootState, pageNumber: number) => pageNumber],
  (annotations, pageNumber): number =>
    Object.values(annotations).filter(
      (annotation) => annotation.pageNumber === pageNumber
    ).length
);
