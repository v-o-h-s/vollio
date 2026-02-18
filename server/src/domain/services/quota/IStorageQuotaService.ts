export interface IStorageQuotaService {
  /**
   * Check if a user can upload a file of a certain size
   */
  canUpload(userId: string, sizeInBytes: number): Promise<boolean>;

  /**
   * Consume storage space
   */
  consumeStorage(userId: string, sizeInBytes: number): Promise<void>;

  /**
   * Release storage space (on delete)
   */
  releaseStorage(userId: string, sizeInBytes: number): Promise<void>;

  /**
   * Get remaining storage in bytes
   */
  getRemainingBytes(userId: string): Promise<number>;
}
