import { Summary } from "../entities/Summary";

export interface ISummaryRepository {
  /**
   * Creates a summary in the database.
   * @param summary
   */
  createSummary(summary: Summary): Promise<Summary>;

  /**
   * Deletes a summary row from the database.
   * @param summaryId
   */
  deleteSummaryRow(summaryId: string): Promise<void>;

  /**
   * Gets a summary by its ID.
   * @param summaryId
   */
  getSummaryById(summaryId: string): Promise<Summary | null>;

  /**
   * Gets summaries by document ID.
   * @param documentId
   */
  getSummariesByDocumentId(documentId: string): Promise<Summary[]>;

  /**
   * update teh summary
   */
  updateSummary(summary: Summary): Promise<void>;
}
