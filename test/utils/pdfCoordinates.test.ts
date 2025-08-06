import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  calculateSelectionBounds,
  extractSelectedText,
  getCurrentPageNumber,
  transformCoordinatesForZoom,
  findPdfPageElement,
  getPdfViewerScrollPosition,
  adjustCoordinatesForScroll,
  getCurrentZoomLevel,
  transformCoordinatesForDisplay,
} from "@/lib/utils/pdfCoordinates";
import type { Rectangle } from "@/lib/types";

// Mock DOM elements and Selection API
const createMockSelection = (text: string, rect: DOMRect) => {
  const range = {
    getClientRects: vi.fn(() => [rect]),
    toString: vi.fn(() => text),
  };

  const selection = {
    rangeCount: 1,
    getRangeAt: vi.fn(() => range),
    toString: vi.fn(() => text),
  };

  return { selection, range };
};

const createMockElement = (attributes: Record<string, string> = {}) => {
  const element = document.createElement("div");
  Object.entries(attributes).forEach(([key, value]) => {
    if (key.startsWith("data-")) {
      element.setAttribute(key, value);
    } else if (key === "id") {
      element.id = value;
    } else if (key === "className") {
      element.className = value;
    }
  });
  return element;
};

describe("PDF Coordinates Utilities", () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("calculateSelectionBounds", () => {
    it("should calculate selection bounds relative to page element", () => {
      const pageElement = createMockElement();
      pageElement.getBoundingClientRect = vi.fn(() => ({
        left: 100,
        top: 50,
        width: 800,
        height: 1000,
        right: 900,
        bottom: 1050,
        x: 100,
        y: 50,
        toJSON: vi.fn(),
      }));

      const selectionRect = {
        left: 200,
        top: 150,
        width: 100,
        height: 20,
        right: 300,
        bottom: 170,
        x: 200,
        y: 150,
        toJSON: vi.fn(),
      };

      const { selection } = createMockSelection("test text", selectionRect);

      const result = calculateSelectionBounds(
        selection as Selection,
        pageElement,
        1
      );

      expect(result).toEqual({
        x: 100, // 200 - 100
        y: 100, // 150 - 50
        width: 100,
        height: 20,
      });
    });

    it("should return null for empty selection", () => {
      const pageElement = createMockElement();
      const selection = { rangeCount: 0 } as Selection;

      const result = calculateSelectionBounds(selection, pageElement, 1);

      expect(result).toBeNull();
    });

    it("should handle negative coordinates by clamping to 0", () => {
      const pageElement = createMockElement();
      pageElement.getBoundingClientRect = vi.fn(() => ({
        left: 200,
        top: 200,
        width: 800,
        height: 1000,
        right: 1000,
        bottom: 1200,
        x: 200,
        y: 200,
        toJSON: vi.fn(),
      }));

      const selectionRect = {
        left: 150, // Less than page left
        top: 150, // Less than page top
        width: 100,
        height: 20,
        right: 250,
        bottom: 170,
        x: 150,
        y: 150,
        toJSON: vi.fn(),
      };

      const { selection } = createMockSelection("test text", selectionRect);

      const result = calculateSelectionBounds(
        selection as Selection,
        pageElement,
        1
      );

      expect(result).toEqual({
        x: 0, // Clamped from negative
        y: 0, // Clamped from negative
        width: 100,
        height: 20,
      });
    });
  });

  describe("extractSelectedText", () => {
    it("should extract text from selection", () => {
      const { selection } = createMockSelection(
        "  selected text  ",
        {} as DOMRect
      );

      const result = extractSelectedText(selection as Selection);

      expect(result).toBe("selected text"); // Trimmed
    });

    it("should return empty string for empty selection", () => {
      const selection = { rangeCount: 0 } as Selection;

      const result = extractSelectedText(selection);

      expect(result).toBe("");
    });

    it("should handle selection errors gracefully", () => {
      const selection = {
        rangeCount: 1,
        toString: vi.fn(() => {
          throw new Error("Selection error");
        }),
      } as unknown as Selection;

      const result = extractSelectedText(selection);

      expect(result).toBe("");
    });
  });

  describe("getCurrentPageNumber", () => {
    it("should extract page number from data-page-number attribute", () => {
      const element = createMockElement({ "data-page-number": "3" });

      const result = getCurrentPageNumber(element);

      expect(result).toBe(3);
    });

    it("should extract page number from ID pattern", () => {
      const element = createMockElement({ id: "page-5" });

      const result = getCurrentPageNumber(element);

      expect(result).toBe(5);
    });

    it("should extract page number from class name pattern", () => {
      const element = createMockElement({ className: "pdf-page_7" });

      const result = getCurrentPageNumber(element);

      expect(result).toBe(7);
    });

    it("should return 1 as fallback when no page number found", () => {
      const element = createMockElement();

      const result = getCurrentPageNumber(element);

      expect(result).toBe(1);
    });

    it("should traverse parent elements to find page number", () => {
      const parent = createMockElement({ "data-page-number": "4" });
      const child = createMockElement();
      parent.appendChild(child);

      const result = getCurrentPageNumber(child);

      expect(result).toBe(4);
    });
  });

  describe("transformCoordinatesForZoom", () => {
    it("should scale coordinates based on zoom level", () => {
      const coordinates: Rectangle = { x: 100, y: 200, width: 150, height: 30 };
      const zoomLevel = 1.5;

      const result = transformCoordinatesForZoom(coordinates, zoomLevel);

      expect(result).toEqual({
        x: 100 / 1.5,
        y: 200 / 1.5,
        width: 150 / 1.5,
        height: 30 / 1.5,
      });
    });

    it("should handle zoom level of 1 (no scaling)", () => {
      const coordinates: Rectangle = { x: 100, y: 200, width: 150, height: 30 };
      const zoomLevel = 1;

      const result = transformCoordinatesForZoom(coordinates, zoomLevel);

      expect(result).toEqual(coordinates);
    });

    it("should handle zoom out (scale > 1)", () => {
      const coordinates: Rectangle = { x: 100, y: 200, width: 150, height: 30 };
      const zoomLevel = 2;

      const result = transformCoordinatesForZoom(coordinates, zoomLevel);

      expect(result).toEqual({
        x: 50,
        y: 100,
        width: 75,
        height: 15,
      });
    });
  });

  describe("findPdfPageElement", () => {
    it("should find PDF page element by class name", () => {
      const pageElement = createMockElement({
        className: "e-pv-page-container",
      });
      const childElement = createMockElement();
      pageElement.appendChild(childElement);
      document.body.appendChild(pageElement);

      const result = findPdfPageElement(childElement);

      expect(result).toBe(pageElement);
    });

    it("should find PDF page element by ID pattern", () => {
      const pageElement = createMockElement({ id: "pageDiv1" });
      const childElement = createMockElement();
      pageElement.appendChild(childElement);
      document.body.appendChild(pageElement);

      const result = findPdfPageElement(childElement);

      expect(result).toBe(pageElement);
    });

    it("should return null when no page element found", () => {
      const element = createMockElement();
      document.body.appendChild(element);

      const result = findPdfPageElement(element);

      expect(result).toBeNull();
    });
  });

  describe("getPdfViewerScrollPosition", () => {
    it("should get scroll position from viewer element", () => {
      const viewerElement = createMockElement();
      const scrollContainer = createMockElement({
        className: "e-pv-viewer-container",
      });

      Object.defineProperty(scrollContainer, "scrollLeft", {
        value: 50,
        writable: true,
      });
      Object.defineProperty(scrollContainer, "scrollTop", {
        value: 100,
        writable: true,
      });

      viewerElement.appendChild(scrollContainer);

      const result = getPdfViewerScrollPosition(viewerElement);

      expect(result).toEqual({ x: 50, y: 100 });
    });

    it("should return default position when viewer not found", () => {
      const result = getPdfViewerScrollPosition();

      expect(result).toEqual({ x: 0, y: 0 });
    });

    it("should handle errors gracefully", () => {
      const viewerElement = null as any;

      const result = getPdfViewerScrollPosition(viewerElement);

      expect(result).toEqual({ x: 0, y: 0 });
    });
  });

  describe("adjustCoordinatesForScroll", () => {
    it("should adjust coordinates for scroll position", () => {
      const coordinates: Rectangle = { x: 200, y: 300, width: 100, height: 50 };
      const scrollPosition = { x: 50, y: 100 };

      const result = adjustCoordinatesForScroll(coordinates, scrollPosition);

      expect(result).toEqual({
        x: 150, // 200 - 50
        y: 200, // 300 - 100
        width: 100,
        height: 50,
      });
    });

    it("should handle zero scroll position", () => {
      const coordinates: Rectangle = { x: 200, y: 300, width: 100, height: 50 };
      const scrollPosition = { x: 0, y: 0 };

      const result = adjustCoordinatesForScroll(coordinates, scrollPosition);

      expect(result).toEqual(coordinates);
    });
  });

  describe("getCurrentZoomLevel", () => {
    it("should get zoom level from PDF viewer ref", () => {
      const mockPdfViewer = {
        magnificationModule: {
          zoomFactor: 1.5,
        },
      };

      const pdfViewerRef = { current: mockPdfViewer };

      const result = getCurrentZoomLevel(pdfViewerRef);

      expect(result).toBe(1.5);
    });

    it("should return default zoom level when ref is null", () => {
      const pdfViewerRef = { current: null };

      const result = getCurrentZoomLevel(pdfViewerRef);

      expect(result).toBe(1.0);
    });

    it("should handle missing magnification module", () => {
      const mockPdfViewer = {};
      const pdfViewerRef = { current: mockPdfViewer };

      const result = getCurrentZoomLevel(pdfViewerRef);

      expect(result).toBe(1.0);
    });
  });

  describe("transformCoordinatesForDisplay", () => {
    it("should apply both zoom and scroll transformations", () => {
      const coordinates: Rectangle = { x: 100, y: 200, width: 50, height: 25 };
      const zoomLevel = 2;
      const scrollPosition = { x: 20, y: 40 };

      const result = transformCoordinatesForDisplay(
        coordinates,
        zoomLevel,
        scrollPosition
      );

      expect(result).toEqual({
        x: 180, // (100 * 2) - 20
        y: 360, // (200 * 2) - 40
        width: 100, // 50 * 2
        height: 50, // 25 * 2
      });
    });

    it("should handle identity transformations", () => {
      const coordinates: Rectangle = { x: 100, y: 200, width: 50, height: 25 };
      const zoomLevel = 1;
      const scrollPosition = { x: 0, y: 0 };

      const result = transformCoordinatesForDisplay(
        coordinates,
        zoomLevel,
        scrollPosition
      );

      expect(result).toEqual(coordinates);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle null/undefined inputs gracefully", () => {
      expect(calculateSelectionBounds(null as any, null as any, 1)).toBeNull();
      expect(extractSelectedText(null as any)).toBe("");
      expect(getCurrentPageNumber(null as any)).toBe(1);
      expect(findPdfPageElement(null as any)).toBeNull();
    });

    it("should handle DOM manipulation errors", () => {
      const element = createMockElement();

      // Mock getBoundingClientRect to throw error
      element.getBoundingClientRect = vi.fn(() => {
        throw new Error("DOM error");
      });

      // Should not crash
      expect(() => findPdfPageElement(element)).not.toThrow();
    });

    it("should handle extreme coordinate values", () => {
      const coordinates: Rectangle = {
        x: Number.MAX_SAFE_INTEGER,
        y: Number.MAX_SAFE_INTEGER,
        width: Number.MAX_SAFE_INTEGER,
        height: Number.MAX_SAFE_INTEGER,
      };
      const zoomLevel = 0.1;

      const result = transformCoordinatesForZoom(coordinates, zoomLevel);

      expect(result.x).toBeFinite();
      expect(result.y).toBeFinite();
      expect(result.width).toBeFinite();
      expect(result.height).toBeFinite();
    });
  });
});
