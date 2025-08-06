/**
 * Utility functions for PDF coordinate calculations and transformations
 */

import { Rectangle } from "@/lib/types";

/**
 * Calculates bounding rectangle coordinates relative to PDF page
 * @param selection - Browser selection object
 * @param pageElement - PDF page DOM element
 * @param pageNumber - Current page number
 * @returns Rectangle coordinates relative to the PDF page
 */
export function calculateSelectionBounds(
  selection: Selection,
  pageElement: HTMLElement,
  pageNumber: number
): Rectangle | null {
  if (!selection.rangeCount || !pageElement) {
    return null;
  }

  try {
    const range = selection.getRangeAt(0);
    const rects = range.getClientRects();

    if (rects.length === 0) {
      return null;
    }

    // Get the first rectangle for the selection
    const rect = rects[0];
    const pageRect = pageElement.getBoundingClientRect();

    // Calculate coordinates relative to the PDF page
    const relativeX = rect.left - pageRect.left;
    const relativeY = rect.top - pageRect.top;

    return {
      x: Math.max(0, relativeX),
      y: Math.max(0, relativeY),
      width: rect.width,
      height: rect.height,
    };
  } catch (error) {
    console.error("Error calculating selection bounds:", error);
    return null;
  }
}

/**
 * Extracts text content from a selection
 * @param selection - Browser selection object
 * @returns Selected text content
 */
export function extractSelectedText(selection: Selection): string {
  if (!selection.rangeCount) {
    return "";
  }

  try {
    return selection.toString().trim();
  } catch (error) {
    console.error("Error extracting selected text:", error);
    return "";
  }
}

/**
 * Gets the current page number from a PDF page element
 * @param element - DOM element within a PDF page
 * @returns Page number (1-based) or 1 as fallback
 */
export function getCurrentPageNumber(element: HTMLElement): number {
  try {
    // Look for page-specific attributes or classes
    let current = element;
    while (current && current !== document.body) {
      // Check for common PDF viewer page indicators
      if (current.dataset?.pageNumber) {
        return parseInt(current.dataset.pageNumber, 10);
      }

      // Check for Syncfusion-specific page attributes
      if (current.getAttribute("data-page-number")) {
        return parseInt(current.getAttribute("data-page-number")!, 10);
      }

      // Check for ID patterns that contain page numbers
      if (current.id) {
        const idPageMatch = current.id.match(/page[\-_]?(\d+)/i);
        if (idPageMatch) {
          return parseInt(idPageMatch[1], 10);
        }
      }

      // Check for class names that might contain page numbers
      const classList = Array.from(current.classList);
      for (const className of classList) {
        const pageMatch = className.match(/page[\-_]?(\d+)/i);
        if (pageMatch) {
          return parseInt(pageMatch[1], 10);
        }
      }

      current = current.parentElement as HTMLElement;
    }

    // Fallback: try to find page number from Syncfusion's structure
    const pageElements = document.querySelectorAll(
      '[id*="pageDiv"], [class*="e-pv-page"], [data-page-number]'
    );
    for (let i = 0; i < pageElements.length; i++) {
      if (pageElements[i].contains(element)) {
        // Try to extract page number from the element itself
        const pageEl = pageElements[i] as HTMLElement;
        if (pageEl.dataset?.pageNumber) {
          return parseInt(pageEl.dataset.pageNumber, 10);
        }
        if (pageEl.getAttribute("data-page-number")) {
          return parseInt(pageEl.getAttribute("data-page-number")!, 10);
        }
        // Fallback to index + 1
        return i + 1;
      }
    }

    return 1; // Default fallback
  } catch (error) {
    console.error("Error getting current page number:", error);
    return 1;
  }
}

/**
 * Transforms coordinates based on PDF zoom level
 * @param coordinates - Original coordinates
 * @param zoomLevel - Current zoom level (1.0 = 100%)
 * @returns Transformed coordinates
 */
export function transformCoordinatesForZoom(
  coordinates: Rectangle,
  zoomLevel: number
): Rectangle {
  return {
    x: coordinates.x / zoomLevel,
    y: coordinates.y / zoomLevel,
    width: coordinates.width / zoomLevel,
    height: coordinates.height / zoomLevel,
  };
}

/**
 * Finds the PDF page element that contains the given element
 * @param element - DOM element to search from
 * @returns PDF page element or null if not found
 */
export function findPdfPageElement(element: HTMLElement): HTMLElement | null {
  let current = element;
  while (current && current !== document.body) {
    // Look for Syncfusion PDF viewer page container patterns
    if (
      current.classList.contains("e-pv-page-container") ||
      current.classList.contains("e-pv-page-div") ||
      current.classList.contains("page") ||
      current.id?.includes("pageDiv") ||
      current.id?.includes("pageContainer") ||
      current.dataset?.pageNumber ||
      // Additional Syncfusion-specific selectors
      current.classList.contains("e-pv-text-layer") ||
      current.classList.contains("e-pv-text-selection-layer")
    ) {
      return current;
    }
    current = current.parentElement as HTMLElement;
  }

  // Fallback: look for any element with page-related attributes
  current = element;
  while (current && current !== document.body) {
    const id = current.id || "";
    const className = current.className || "";

    if (
      id.match(/page[\-_]?\d+/i) ||
      className.match(/page[\-_]?\d+/i) ||
      current.getAttribute("data-page-number")
    ) {
      return current;
    }
    current = current.parentElement as HTMLElement;
  }

  return null;
}

/**
 * Gets the current scroll position of the PDF viewer
 * @param viewerElement - PDF viewer container element
 * @returns Scroll position { x, y } or { x: 0, y: 0 } if not found
 */
export function getPdfViewerScrollPosition(viewerElement?: HTMLElement): {
  x: number;
  y: number;
} {
  try {
    const viewer =
      viewerElement || document.getElementById("pdf-annotation-viewer");
    if (!viewer) {
      return { x: 0, y: 0 };
    }

    // Look for the scrollable container within the PDF viewer
    const scrollContainer =
      viewer.querySelector(".e-pv-viewer-container") ||
      viewer.querySelector(".e-pv-page-container") ||
      viewer;

    if (scrollContainer) {
      return {
        x: scrollContainer.scrollLeft || 0,
        y: scrollContainer.scrollTop || 0,
      };
    }

    return { x: 0, y: 0 };
  } catch (error) {
    console.error("Error getting PDF viewer scroll position:", error);
    return { x: 0, y: 0 };
  }
}

/**
 * Adjusts coordinates for scroll position
 * @param coordinates - Original coordinates
 * @param scrollPosition - Current scroll position
 * @returns Adjusted coordinates
 */
export function adjustCoordinatesForScroll(
  coordinates: Rectangle,
  scrollPosition: { x: number; y: number }
): Rectangle {
  return {
    x: coordinates.x - scrollPosition.x,
    y: coordinates.y - scrollPosition.y,
    width: coordinates.width,
    height: coordinates.height,
  };
}

/**
 * Gets the current zoom level from Syncfusion PDF viewer
 * @param pdfViewerRef - Reference to the PDF viewer component
 * @returns Current zoom level (1.0 = 100%) or 1.0 as fallback
 */
export function getCurrentZoomLevel(
  pdfViewerRef: React.RefObject<any>
): number {
  try {
    if (pdfViewerRef.current) {
      const magnificationModule = (pdfViewerRef.current as any)
        .magnificationModule;
      if (magnificationModule && magnificationModule.zoomFactor) {
        return magnificationModule.zoomFactor;
      }
    }
    return 1.0;
  } catch (error) {
    console.error("Error getting current zoom level:", error);
    return 1.0;
  }
}

/**
 * Transforms coordinates to account for both zoom and scroll
 * @param coordinates - Original coordinates
 * @param zoomLevel - Current zoom level
 * @param scrollPosition - Current scroll position
 * @returns Fully transformed coordinates
 */
export function transformCoordinatesForDisplay(
  coordinates: Rectangle,
  zoomLevel: number,
  scrollPosition: { x: number; y: number }
): Rectangle {
  // First apply zoom transformation
  const zoomedCoords = {
    x: coordinates.x * zoomLevel,
    y: coordinates.y * zoomLevel,
    width: coordinates.width * zoomLevel,
    height: coordinates.height * zoomLevel,
  };

  // Then adjust for scroll position
  return adjustCoordinatesForScroll(zoomedCoords, scrollPosition);
}
