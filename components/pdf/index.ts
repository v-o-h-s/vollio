/**
 * PDF Annotation Components Module
 *
 * This module exports all PDF-related components for the Noto application.
 * These components work together to provide a complete PDF annotation experience.
 *
 * Component Hierarchy:
 * PDFAnnotationViewer (main container)
 * ├── AnnotationOverlay (highlights existing annotations)
 * ├── AnnotationTooltip (desktop text selection UI)
 * ├── MobileAnnotationDialog (mobile text selection UI)
 * └── AnnotationPreviewCard (hover preview of annotations)
 *
 * Usage:
 * import { PDFAnnotationViewer } from '@/components/pdf'
 *
 * @author Noto Team
 * @version 1.0.0
 */

// Main PDF viewer component with annotation capabilities
export { default as PDFAnnotationViewer } from "./PDFAnnotationViewer";

// Desktop tooltip for text selection
export { default as AnnotationTooltip } from "./AnnotationTooltip";

// Preview card for annotation hover states
export { default as AnnotationPreviewCard } from "./AnnotationPreviewCard";

// Overlay component for rendering annotation highlights
export { default as AnnotationOverlay } from "./AnnotationOverlay";

// Mobile dialog for text selection (not exported by default, used internally)
export { default as MobileAnnotationDialog } from "./MobileAnnotationDialog";

// Fallback UI components for error states
export * from "./FallbackUI";
