import { Plan } from "./Plan";

export class Resources {
  constructor(
    private userId: string,
    private planId: string,
    private remainingAiTokens: number,
    private remainingStorageBytes: number,
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

  public getRemainingAiTokens(): number {
    return this.remainingAiTokens;
  }

  public setRemainingAiTokens(tokens: number): void {
    this.remainingAiTokens = tokens;
  }

  public getRemainingStorageBytes(): number {
    return this.remainingStorageBytes;
  }

  public setRemainingStorageBytes(bytes: number): void {
    this.remainingStorageBytes = bytes;
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
    if (this.remainingAiTokens < amount) {
      throw new Error("Insufficient AI tokens");
    }
    this.remainingAiTokens -= amount;
  }

  /**
   * Business Logic: Consume storage space
   */
  public consumeStorage(sizeInBytes: number): void {
    if (this.remainingStorageBytes < sizeInBytes) {
      throw new Error("Insufficient storage space");
    }
    this.remainingStorageBytes -= sizeInBytes;
  }

  /**
   * Business Logic: Release storage space (on delete)
   */
  public releaseStorage(sizeInBytes: number): void {
    this.remainingStorageBytes += sizeInBytes;
  }

  /**
   * Business Logic: Update allocation based on a new plan (e.g. upgrade/renewal)
   */
  public updateFromPlan(plan: Plan): void {
    this.planId = plan.getId();
    this.remainingAiTokens = plan.getMaxAiTokens() || 0;
    this.remainingStorageBytes = plan.getMaxStorageBytes() || 0;
    this.updatedAt = new Date();
  }

  public toJSON() {
    return {
      userId: this.userId,
      planId: this.planId,
      remainingAiTokens: this.remainingAiTokens,
      remainingStorageBytes: this.remainingStorageBytes,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
