import { Plan } from "./Plan";

export class Resources {
  constructor(
    private userId: string,
    private planId: string,
    private usedAiTokens: number,
    private usedStorageBytes: number,
    private usedDocuments: number,
    private maxAiTokens: number,
    private maxStorageBytes: number,
    private maxDocuments: number,
    private createdAt: Date = new Date(),
    private updatedAt: Date = new Date(),
  ) {}

  public getUserId(): string {
    return this.userId;
  }

  public getPlanId(): string {
    return this.planId;
  }

  public setPlanId(planId: string): void {
    this.planId = planId;
  }

  public getUsedAiTokens(): number {
    return this.usedAiTokens;
  }

  public getUsedStorageBytes(): number {
    return this.usedStorageBytes;
  }

  public getUsedDocuments(): number {
    return this.usedDocuments;
  }

  public getMaxAiTokens(): number {
    return this.maxAiTokens;
  }

  public getMaxStorageBytes(): number {
    return this.maxStorageBytes;
  }

  public getMaxDocuments(): number {
    return this.maxDocuments;
  }

  public getRemainingAiTokens(): number {
    return Math.max(0, this.maxAiTokens - this.usedAiTokens);
  }

  public getRemainingStorageBytes(): number {
    return Math.max(0, this.maxStorageBytes - this.usedStorageBytes);
  }

  public getRemainingDocuments(): number {
    return Math.max(0, this.maxDocuments - this.usedDocuments);
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  /**
   * Business Logic: Consume AI tokens
   */
  public consumeAiTokens(amount: number): void {
    // We check against remaining
    if (this.getRemainingAiTokens() < amount) {
      throw new Error("Insufficient AI tokens");
    }
    this.usedAiTokens += amount;
    this.updatedAt = new Date();
  }

  /**
   * Business Logic: Consume storage space
   */
  public consumeStorage(sizeInBytes: number): void {
    if (this.getRemainingStorageBytes() < sizeInBytes) {
      throw new Error("Insufficient storage space");
    }
    this.usedStorageBytes += sizeInBytes;
    this.updatedAt = new Date();
  }

  /**
   * Business Logic: Release storage space (on delete)
   */
  public releaseStorage(sizeInBytes: number): void {
    this.usedStorageBytes = Math.max(0, this.usedStorageBytes - sizeInBytes);
    this.updatedAt = new Date();
  }

  /**
   * Business Logic: Increment document count
   */
  public consumeDocument(): void {
    if (this.getRemainingDocuments() <= 0) {
      throw new Error("Document limit reached");
    }
    this.usedDocuments += 1;
    this.updatedAt = new Date();
  }

  /**
   * Business Logic: Decrement document count (on delete)
   */
  public releaseDocument(): void {
    this.usedDocuments = Math.max(0, this.usedDocuments - 1);
    this.updatedAt = new Date();
  }

  /**
   * Business Logic: Update allocation based on a new plan (e.g. upgrade/renewal)
   * This preserves existing storage usage while applying new limits.
   */
  public updateFromPlan(plan: Plan): void {
    this.planId = plan.getId();
    this.maxAiTokens = plan.getMaxAiTokens() || 0;
    this.maxStorageBytes = plan.getMaxStorageBytes() || 0;
    this.maxDocuments = plan.getMaxDocuments() || 0;

    // Standard SaaS Behavior:
    // 1. Reset AI tokens usage to 0 (new month/billing cycle refill)
    this.usedAiTokens = 0;

    // 2. Storage usage is NOT reset (the files are still there)
    // We just have a new max. If used > max, getRemaining() will return 0.
    // same for documents count

    this.updatedAt = new Date();
  }

  public toJSON() {
    return {
      userId: this.userId,
      planId: this.planId,
      usedAiTokens: this.usedAiTokens,
      usedStorageBytes: this.usedStorageBytes,
      usedDocuments: this.usedDocuments,
      remainingAiTokens: this.getRemainingAiTokens(),
      remainingStorageBytes: this.getRemainingStorageBytes(),
      remainingDocuments: this.getRemainingDocuments(),
      maxAiTokens: this.maxAiTokens,
      maxStorageBytes: this.maxStorageBytes,
      maxDocuments: this.maxDocuments,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
