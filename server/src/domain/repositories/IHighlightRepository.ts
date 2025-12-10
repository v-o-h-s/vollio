import { Highlight } from "../entities/Highlight";

export interface IHighlightRepository {
  /**
   * Get all highlights for a user, optionally filtered by PDF ID
   */
  getAllHighlights(userId: string, pdfId?: string): Promise<Highlight[]>;

  /**
   * Get a highlight by ID
   */
  getHighlightById(id: string, userId: string): Promise<Highlight | null>;

  /**
   * Create a new highlight
   */
  createHighlight(highlight: Highlight): Promise<Highlight>;

  /**
   * Update an existing highlight
   */
  updateHighlight(highlight: Highlight): Promise<Highlight>;

  /**
   * Delete a highlight
   */
  deleteHighlight(id: string, userId: string): Promise<void>;

  /**
   * Get all highlights for a PDF
   */
  getHighlightsByPdfId(pdfId: string, userId: string): Promise<Highlight[]>;
}
