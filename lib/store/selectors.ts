import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "./index";
import { Annotation } from "../types";

// Base selectors for UI state
export const selectAnnotationState = (state: RootState) => state.annotations;
export const selectCurrentPdf = (state: RootState) =>
  state.annotations.currentPdf;
export const selectActiveSelection = (state: RootState) =>
  state.annotations.activeSelection;
export const selectHoveredAnnotation = (state: RootState) =>
  state.annotations.hoveredAnnotation;
export const selectPreviewCard = (state: RootState) =>
  state.annotations.previewCard;

// UI state selectors
export const selectIsPreviewCardVisible = createSelector(
  [selectPreviewCard],
  (previewCard): boolean => previewCard.visible
);

// Helper selectors for components that need to work with RTK Query data
export const selectPreviewCardAnnotationId = createSelector(
  [selectPreviewCard],
  (previewCard): string | null => {
    if (!previewCard.visible || !previewCard.annotationId) return null;
    return previewCard.annotationId;
  }
);
