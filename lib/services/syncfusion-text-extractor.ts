import { PdfViewer } from "@syncfusion/ej2-pdfviewer";
import { createElement } from "@syncfusion/ej2-base";

export interface SyncfusionExtractionOptions {
  enableTextSelection?: boolean;
  enableTextSearch?: boolean;
  extractImages?: boolean;
  preserveFormatting?: boolean;
  timeout?: number;
}

export interface SyncfusionPageText {
  pageNumber: number;
  text: string;
  confidence: number;
  bounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  }[];
}

export interface SyncfusionExtractionResult {
  success: boolean;
  pageTexts: SyncfusionPageText[];
  totalPages: number;
  extractionMethod: "syncfusion";
  error?: string;
}

export class SyncfusionTextExtractor {
  private static readonly DEFAULT_OPTIONS: Required<SyncfusionExtractionOptions> =
    {
      enableTextSelection: true,
      enableTextSearch: true,
      extractImages: false,
      preserveFormatting: true,
      timeout: 30000, // 30 seconds
    };

  /**
   * Extract text from PDF using Syncfusion PDF Viewer
   */
  async extractText(
    pdfBuffer: Buffer,
    options: SyncfusionExtractionOptions = {}
  ): Promise<SyncfusionExtractionResult> {
    const config = { ...SyncfusionTextExtractor.DEFAULT_OPTIONS, ...options };

    return new Promise((resolve) => {
      let pdfViewer: PdfViewer | null = null;
      let timeoutId: NodeJS.Timeout | null = null;
      let isResolved = false;

      const cleanup = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        if (pdfViewer) {
          try {
            pdfViewer.destroy();
          } catch (error) {
            console.warn("Error destroying PDF viewer:", error);
          }
          pdfViewer = null;
        }
      };

      const resolveOnce = (result: SyncfusionExtractionResult) => {
        if (!isResolved) {
          isResolved = true;
          cleanup();
          resolve(result);
        }
      };

      // Set timeout
      timeoutId = setTimeout(() => {
        resolveOnce({
          success: false,
          pageTexts: [],
          totalPages: 0,
          extractionMethod: "syncfusion",
          error: "Text extraction timeout",
        });
      }, config.timeout);

      try {
        // Create container element
        const container = createElement("div", {
          id: `pdfViewer_${Date.now()}`,
          styles:
            "position: absolute; left: -9999px; width: 800px; height: 600px;",
        });

        // Append to document body (required for Syncfusion)
        document.body.appendChild(container);

        // Initialize PDF Viewer
        pdfViewer = new PdfViewer({
          enableTextSelection: config.enableTextSelection,
          enableTextSearch: config.enableTextSearch,
          enableDownload: false,
          enablePrint: false,
          enableNavigation: true,
          enableMagnification: false,
          enableToolbar: false,

          // Event handlers
          documentLoad: async (args: any) => {
            try {
              const totalPages = pdfViewer!.pageCount;
              const pageTexts: SyncfusionPageText[] = [];

              // Extract text from each page
              for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
                try {
                  const pageText = await this.extractPageText(
                    pdfViewer!,
                    pageNum
                  );
                  if (pageText.text.trim()) {
                    pageTexts.push(pageText);
                  }
                } catch (pageError) {
                  console.warn(
                    `Failed to extract text from page ${pageNum}:`,
                    pageError
                  );
                  // Continue with other pages
                }
              }

              // Remove container from DOM
              if (container.parentNode) {
                container.parentNode.removeChild(container);
              }

              resolveOnce({
                success: true,
                pageTexts,
                totalPages,
                extractionMethod: "syncfusion",
              });
            } catch (error) {
              // Remove container from DOM
              if (container.parentNode) {
                container.parentNode.removeChild(container);
              }

              resolveOnce({
                success: false,
                pageTexts: [],
                totalPages: 0,
                extractionMethod: "syncfusion",
                error: `Text extraction failed: ${
                  error instanceof Error ? error.message : "Unknown error"
                }`,
              });
            }
          },

          documentLoadFailed: (args: any) => {
            // Remove container from DOM
            if (container.parentNode) {
              container.parentNode.removeChild(container);
            }

            resolveOnce({
              success: false,
              pageTexts: [],
              totalPages: 0,
              extractionMethod: "syncfusion",
              error: `Document load failed: ${
                args.errorDetails || "Unknown error"
              }`,
            });
          },
        });

        // Render PDF Viewer
        pdfViewer.appendTo(container);

        // Load PDF from buffer
        const base64String = pdfBuffer.toString("base64");
        const dataUrl = `data:application/pdf;base64,${base64String}`;

        // Load the document
        pdfViewer.load(dataUrl, "");
      } catch (error) {
        resolveOnce({
          success: false,
          pageTexts: [],
          totalPages: 0,
          extractionMethod: "syncfusion",
          error: `Syncfusion initialization failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        });
      }
    });
  }

  /**
   * Extract text from a specific page
   */
  private async extractPageText(
    pdfViewer: PdfViewer,
    pageNumber: number
  ): Promise<SyncfusionPageText> {
    return new Promise((resolve, reject) => {
      try {
        // Navigate to the specific page
        pdfViewer.navigation.goToPage(pageNumber);

        // Wait for page to render
        setTimeout(() => {
          try {
            let extractedText = "";
            let confidence = 95; // High confidence for Syncfusion extraction

            // Method 1: Try to use Syncfusion's text extraction API if available
            if (typeof (pdfViewer as any).textSearch !== "undefined") {
              try {
                // Use text search functionality to extract all text
                const searchResult = (pdfViewer as any).textSearch.searchText(
                  "",
                  false
                );
                if (searchResult && searchResult.length > 0) {
                  extractedText = searchResult
                    .map((item: any) => item.text || "")
                    .join(" ");
                }
              } catch (searchError) {
                console.warn("Text search method failed:", searchError);
              }
            }

            // Method 2: Try to extract from page elements
            if (!extractedText.trim()) {
              try {
                const pageElements = pdfViewer.element.querySelectorAll(
                  `[data-page-number="${pageNumber}"] .e-pv-text`
                );
                const textParts: string[] = [];

                pageElements.forEach((element) => {
                  const text =
                    (element as HTMLElement).textContent ||
                    (element as HTMLElement).innerText ||
                    "";
                  if (text.trim()) {
                    textParts.push(text.trim());
                  }
                });

                extractedText = textParts.join(" ");
              } catch (elementError) {
                console.warn("Element extraction method failed:", elementError);
              }
            }

            // Method 3: Fallback to getting all visible text from the page container
            if (!extractedText.trim()) {
              try {
                const pageContainer =
                  pdfViewer.element.querySelector(
                    `[data-page-number="${pageNumber}"]`
                  ) || pdfViewer.element.querySelector(".e-pv-page-container");

                if (pageContainer) {
                  extractedText =
                    (pageContainer as HTMLElement).textContent ||
                    (pageContainer as HTMLElement).innerText ||
                    "";
                }
              } catch (containerError) {
                console.warn(
                  "Container extraction method failed:",
                  containerError
                );
              }
            }

            // Method 4: Last resort - try to get any text from the viewer
            if (!extractedText.trim()) {
              try {
                const allTextElements = pdfViewer.element.querySelectorAll(
                  '.e-pv-text, .textLayer, [class*="text"]'
                );
                const textParts: string[] = [];

                allTextElements.forEach((element) => {
                  const text =
                    (element as HTMLElement).textContent ||
                    (element as HTMLElement).innerText ||
                    "";
                  if (text.trim()) {
                    textParts.push(text.trim());
                  }
                });

                extractedText = textParts.join(" ");
              } catch (fallbackError) {
                console.warn(
                  "Fallback extraction method failed:",
                  fallbackError
                );
              }
            }

            // If still no text, reduce confidence
            if (!extractedText.trim()) {
              confidence = 0;
              console.warn(`No text extracted from page ${pageNumber}`);
            }

            resolve({
              pageNumber,
              text: extractedText.trim(),
              confidence,
            });
          } catch (error) {
            reject(
              new Error(
                `Failed to extract text from page ${pageNumber}: ${error}`
              )
            );
          }
        }, 2000); // Wait 2 seconds for page to fully render
      } catch (error) {
        reject(new Error(`Failed to navigate to page ${pageNumber}: ${error}`));
      }
    });
  }

  /**
   * Extract text with bounds information (if supported)
   */
  async extractTextWithBounds(
    pdfBuffer: Buffer,
    options: SyncfusionExtractionOptions = {}
  ): Promise<SyncfusionExtractionResult> {
    // For now, this is the same as regular extraction
    // In the future, this could be enhanced to extract text bounds
    return this.extractText(pdfBuffer, options);
  }

  /**
   * Check if Syncfusion PDF Viewer is available
   */
  static isAvailable(): boolean {
    try {
      return (
        typeof PdfViewer !== "undefined" && typeof document !== "undefined"
      );
    } catch {
      return false;
    }
  }

  /**
   * Get supported file types
   */
  static getSupportedTypes(): string[] {
    return ["application/pdf", ".pdf"];
  }

  /**
   * Validate PDF buffer
   */
  static validatePdfBuffer(buffer: Buffer): boolean {
    if (!buffer || buffer.length === 0) {
      return false;
    }

    // Check PDF header
    const header = buffer.subarray(0, 4).toString();
    return header === "%PDF";
  }

  /**
   * Estimate extraction time based on file size
   */
  static estimateExtractionTime(bufferSize: number): number {
    // Rough estimation: 1MB = ~5 seconds
    const sizeInMB = bufferSize / (1024 * 1024);
    return Math.max(5000, Math.min(60000, sizeInMB * 5000)); // 5s to 60s
  }
}

export const syncfusionTextExtractor = new SyncfusionTextExtractor();
