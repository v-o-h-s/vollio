# Redux Store for PDF Annotations

This directory contains the Redux store implementation for managing PDF annotation state.

## Files

- **index.ts** - Main store configuration and exports
- **annotationSlice.ts** - Redux slice with all annotation-related state and actions
- **selectors.ts** - Memoized selectors for efficient data access
- **hooks.ts** - Typed hooks for React components
- **provider.tsx** - Redux Provider component for app integration
- **test-component.tsx** - Test component to verify store functionality

## State Structure

```typescript
interface AnnotationState {
  currentPdf: PDFDocument | null;
  annotations: Record<string, Annotation>;
  activeSelection: TextSelection | null;
  hoveredAnnotation: string | null;
  tooltipState: TooltipState;
  previewCard: PreviewCardState;
}
```

## Available Actions

### PDF Management

- `setPdfDocument(pdf)` - Set current PDF document
- `clearPdfDocument()` - Clear current PDF and reset state

### Annotation CRUD

- `loadAnnotations(annotations[])` - Load annotations from API
- `createAnnotation(annotation)` - Add new annotation
- `updateAnnotation({id, updates})` - Update existing annotation
- `deleteAnnotation(id)` - Remove annotation

### UI State Management

- `setActiveSelection(selection)` - Set currently selected text
- `setHoveredAnnotation(id)` - Set hovered annotation
- `showTooltip({x, y})` - Show annotation tooltip
- `hideTooltip()` - Hide annotation tooltip
- `showPreviewCard({annotationId, position})` - Show annotation preview
- `hidePreviewCard()` - Hide annotation preview

## Usage

```typescript
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { setPdfDocument, selectAnnotationsByPage } from "@/lib/store";

function MyComponent() {
  const dispatch = useAppDispatch();
  const annotations = useAppSelector((state) =>
    selectAnnotationsByPage(state, 1)
  );

  // Use the store...
}
```
