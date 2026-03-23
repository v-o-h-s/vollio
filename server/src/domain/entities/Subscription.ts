export class Subscription {
  private id: string;
  private userId: string;
  private planId: string | null;
  private status: string;
  private priceId: string | null;
  private currentPeriodEnd: Date | null;
  private createdAt: Date;
  private updatedAt: Date;

  constructor(
    id: string,
    userId: string,
    status: string,
    planId: string | null = null,
    priceId: string | null = null,
    currentPeriodEnd: Date | null = null,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    this.id = id;
    this.userId = userId;
    this.status = status;
    this.planId = planId;
    this.priceId = priceId;
    this.currentPeriodEnd = currentPeriodEnd;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  public getId(): string {
    return this.id;
  }

  public getUserId(): string {
    return this.userId;
  }

  public getPlanId(): string | null {
    return this.planId;
  }

  public getStatus(): string {
    return this.status;
  }

  public getPriceId(): string | null {
    return this.priceId;
  }

  public getCurrentPeriodEnd(): Date | null {
    return this.currentPeriodEnd;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public setStatus(status: string): void {
    this.status = status;
    this.updatedAt = new Date();
  }

  public setPlanId(planId: string | null): void {
    this.planId = planId;
    this.updatedAt = new Date();
  }

  public setCurrentPeriodEnd(date: Date | null): void {
    this.currentPeriodEnd = date;
    this.updatedAt = new Date();
  }

  public toJSON() {
    return {
      id: this.id,
      user_id: this.userId,
      plan_id: this.planId,
      status: this.status,
      price_id: this.priceId,
      current_period_end: this.currentPeriodEnd?.toISOString() || null,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
    };
  }
}
