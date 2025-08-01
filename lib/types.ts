/**
 * Core types for PDF annotation system
 */

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TextSelection {
  text: string;
  pageNumber: number;
  coordinates: Rectangle;
  pdfId: string;
}

export interface Annotation {
  id: string;
  userId: string;
  pdfId: string;
  pageNumber: number;
  selectedText: string;
  noteContent: string;
  coordinates: Rectangle;
  createdAt: Date;
  updatedAt: Date;
}

export interface PDFDocument {
  id: string;
  userId: string;
  filename: string;
  uploadedAt: Date;
  fileUrl: string; // For prototype, use blob URLs
}
