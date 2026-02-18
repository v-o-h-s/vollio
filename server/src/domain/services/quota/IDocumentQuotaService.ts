export interface IDocumentQuotaService {
  /**
   * Check if a user can create another document
   */
  canCreateDocument(userId: string): Promise<boolean>;

  /**
   * Consume a document slot
   */
  consumeDocument(userId: string): Promise<void>;

  /**
   * Release a document slot (on delete)
   */
  releaseDocument(userId: string): Promise<void>;

  /**
   * Get remaining document count
   */
  getRemainingDocuments(userId: string): Promise<number>;
}
