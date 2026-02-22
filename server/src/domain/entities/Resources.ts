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
    private usedQuizzes: number = 0,
    private maxQuizzes: number = 0,
    private usedFlashcards: number = 0,
    private maxFlashcards: number = 0,
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

  public getUsedQuizzes(): number {
    return this.usedQuizzes;
  }

  public getMaxQuizzes(): number {
    return this.maxQuizzes;
  }

  public getUsedFlashcards(): number {
    return this.usedFlashcards;
  }

  public getMaxFlashcards(): number {
    return this.maxFlashcards;
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

  public getRemainingQuizzes(): number {
    return Math.max(0, this.maxQuizzes - this.usedQuizzes);
  }

  public getRemainingFlashcards(): number {
    return Math.max(0, this.maxFlashcards - this.usedFlashcards);
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
   * Business Logic: Increment quiz count
   */
  public consumeQuiz(): void {
    if (this.getRemainingQuizzes() <= 0) {
      throw new Error("Quiz limit reached");
    }
    this.usedQuizzes += 1;
    this.updatedAt = new Date();
  }

  /**
   * Business Logic: Decrement quiz count (on delete)
   */
  public releaseQuiz(): void {
    this.usedQuizzes = Math.max(0, this.usedQuizzes - 1);
    this.updatedAt = new Date();
  }

  /**
   * Business Logic: Increment flashcard set count
   */
  public consumeFlashcards(): void {
    if (this.getRemainingFlashcards() <= 0) {
      throw new Error("Flashcard limit reached");
    }
    this.usedFlashcards += 1;
    this.updatedAt = new Date();
  }

  /**
   * Business Logic: Decrement flashcard set count (on delete)
   */
  public releaseFlashcards(): void {
    this.usedFlashcards = Math.max(0, this.usedFlashcards - 1);
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
    this.maxQuizzes = plan.getMaxQuizzes() || 0;
    this.maxFlashcards = plan.getMaxFlashcards() || 0;

    // Standard SaaS Behavior:
    // 1. Reset AI tokens usage to 0 (new month/billing cycle refill)
    this.usedAiTokens = 0;

    // 2. Storage usage is NOT reset (the files are still there)
    // We just have a new max. If used > max, getRemaining() will return 0.
    // same for documents, quizzes, and flashcards count

    this.updatedAt = new Date();
  }

  public toJSON() {
    return {
      userId: this.userId,
      planId: this.planId,
      usedAiTokens: this.usedAiTokens,
      usedStorageBytes: this.usedStorageBytes,
      usedDocuments: this.usedDocuments,
      usedQuizzes: this.usedQuizzes,
      usedFlashcards: this.usedFlashcards,
      remainingAiTokens: this.getRemainingAiTokens(),
      remainingStorageBytes: this.getRemainingStorageBytes(),
      remainingDocuments: this.getRemainingDocuments(),
      remainingQuizzes: this.getRemainingQuizzes(),
      remainingFlashcards: this.getRemainingFlashcards(),
      maxAiTokens: this.maxAiTokens,
      maxStorageBytes: this.maxStorageBytes,
      maxDocuments: this.maxDocuments,
      maxQuizzes: this.maxQuizzes,
      maxFlashcards: this.maxFlashcards,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
