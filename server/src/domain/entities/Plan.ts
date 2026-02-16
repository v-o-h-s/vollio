export class Plan {
  private id: string;
  private name: string;
  private slug: string;
  private priceCents: number;
  private currency: string;
  private billingInterval: string;
  private paddlePriceId: string | null;
  private isActive: boolean;
  private maxDocuments: number | null;
  private maxAiQueriesPerDay: number | null;
  private createdAt: Date;
  private updatedAt: Date;

  constructor(
    id: string,
    name: string,
    slug: string,
    priceCents: number,
    currency: string,
    billingInterval: string,
    paddlePriceId: string | null = null,
    isActive: boolean = true,
    maxDocuments: number | null = null,
    maxAiQueriesPerDay: number | null = null,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    this.id = id;
    this.name = name;
    this.slug = slug;
    this.priceCents = priceCents;
    this.currency = currency;
    this.billingInterval = billingInterval;
    this.paddlePriceId = paddlePriceId;
    this.isActive = isActive;
    this.maxDocuments = maxDocuments;
    this.maxAiQueriesPerDay = maxAiQueriesPerDay;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getSlug(): string {
    return this.slug;
  }

  public getPriceCents(): number {
    return this.priceCents;
  }

  public getCurrency(): string {
    return this.currency;
  }

  public getBillingInterval(): string {
    return this.billingInterval;
  }

  public getPaddlePriceId(): string | null {
    return this.paddlePriceId;
  }

  public getIsActive(): boolean {
    return this.isActive;
  }

  public getMaxDocuments(): number | null {
    return this.maxDocuments;
  }

  public getMaxAiQueriesPerDay(): number | null {
    return this.maxAiQueriesPerDay;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public toJSON() {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      price_cents: this.priceCents,
      currency: this.currency,
      billing_interval: this.billingInterval,
      paddle_price_id: this.paddlePriceId,
      is_active: this.isActive,
      max_documents: this.maxDocuments,
      max_ai_queries_per_day: this.maxAiQueriesPerDay,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
    };
  }
}
