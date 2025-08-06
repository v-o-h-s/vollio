import { Annotation, PDFDocument } from "./types";

/**
 * Mock database for prototype implementation
 * In a real application, this would be replaced with actual database operations
 */

class MockDatabase {
  private annotations: Annotation[] = [];
  private pdfs: PDFDocument[] = [];

  // Annotation operations
  getAnnotations(
    userId: string,
    pdfId?: string,
    pageNumber?: number
  ): Annotation[] {
    let filtered = this.annotations.filter(
      (annotation) => annotation.userId === userId
    );

    if (pdfId) {
      filtered = filtered.filter((annotation) => annotation.pdfId === pdfId);
    }

    if (pageNumber !== undefined) {
      filtered = filtered.filter(
        (annotation) => annotation.pageNumber === pageNumber
      );
    }

    return filtered;
  }

  createAnnotation(annotation: Annotation): Annotation {
    this.annotations.push(annotation);
    return annotation;
  }

  updateAnnotation(
    id: string,
    userId: string,
    updates: Partial<Annotation>
  ): Annotation | null {
    const index = this.annotations.findIndex(
      (annotation) => annotation.id === id && annotation.userId === userId
    );

    if (index === -1) {
      return null;
    }

    this.annotations[index] = {
      ...this.annotations[index],
      ...updates,
      updatedAt: new Date(),
    };

    return this.annotations[index];
  }

  deleteAnnotation(id: string, userId: string): Annotation | null {
    const index = this.annotations.findIndex(
      (annotation) => annotation.id === id && annotation.userId === userId
    );

    if (index === -1) {
      return null;
    }

    return this.annotations.splice(index, 1)[0];
  }

  // PDF operations
  getPDFs(userId: string): PDFDocument[] {
    return this.pdfs.filter((pdf) => pdf.userId === userId);
  }

  getPDF(id: string, userId: string): PDFDocument | null {
    return (
      this.pdfs.find((pdf) => pdf.id === id && pdf.userId === userId) || null
    );
  }

  createPDF(pdf: PDFDocument): PDFDocument {
    this.pdfs.push(pdf);
    return pdf;
  }

  deletePDF(id: string, userId: string): PDFDocument | null {
    const index = this.pdfs.findIndex(
      (pdf) => pdf.id === id && pdf.userId === userId
    );

    if (index === -1) {
      return null;
    }

    return this.pdfs.splice(index, 1)[0];
  }

  // Utility methods for development/testing
  getAllAnnotations(): Annotation[] {
    return [...this.annotations];
  }

  getAllPDFs(): PDFDocument[] {
    return [...this.pdfs];
  }

  clearAll(): void {
    this.annotations = [];
    this.pdfs = [];
  }
}

// Export a singleton instance
export const mockDB = new MockDatabase();
