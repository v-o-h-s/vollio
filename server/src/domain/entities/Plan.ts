export class Plan {
  private id: string;
  private name: string;
  private slug: string;
  private priceCents: number;
  private currency: string;
  private billingInterval: string;
  private paddlePriceId: string | null;
  private isActive: boolean;
  private maxAiTokens: number | null;
  private maxStorageBytes: number | null;
  private maxDocuments: number | null;
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
    maxAiTokens: number | null = null,
    maxStorageBytes: number | null = null,
    maxDocuments: number | null = null,
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
    this.maxAiTokens = maxAiTokens;
    this.maxStorageBytes = maxStorageBytes;
    this.maxDocuments = maxDocuments;
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

  public getMaxAiTokens(): number | null {
    return this.maxAiTokens;
  }

  public getMaxStorageBytes(): number | null {
    return this.maxStorageBytes;
  }

  public getMaxDocuments(): number | null {
    return this.maxDocuments;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public isFree(): boolean {
    return this.slug === "free";
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
      max_ai_tokens: this.maxAiTokens,
      max_storage_bytes: this.maxStorageBytes,
      max_documents: this.maxDocuments,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
    };
  }
}
