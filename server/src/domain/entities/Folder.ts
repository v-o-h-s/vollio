export class Folder {
  private id: string;
  private userId: string;
  private name: string;
  private parentId: string | null;
  private createdAt: Date;
  private updatedAt: Date;

  constructor(
    id: string,
    userId: string,
    name: string,
    parentId: string | null = null,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.id = id;
    this.userId = userId;
    this.name = name;
    this.parentId = parentId;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  /**
   * Get folder ID
   */
  public getId(): string {
    return this.id;
  }

  /**
   * Get user ID
   */
  public getUserId(): string {
    return this.userId;
  }

  /**
   * Get folder name
   */
  public getName(): string {
    return this.name;
  }

  /**
   * Set folder name
   */
  public setName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error("Folder name cannot be empty");
    }
    if (name.length > 255) {
      throw new Error("Folder name cannot exceed 255 characters");
    }
    this.name = name.trim();
    this.updatedAt = new Date();
  }

  /**
   * Get parent folder ID
   */
  public getParentId(): string | null {
    return this.parentId;
  }

  /**
   * Set parent folder ID
   */
  public setParentId(parentId: string | null): void {
    if (parentId === this.id) {
      throw new Error("A folder cannot be its own parent");
    }
    this.parentId = parentId;
    this.updatedAt = new Date();
  }

  /**
   * Get creation date
   */
  public getCreatedAt(): Date {
    return this.createdAt;
  }

  /**
   * Get last update date
   */
  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  /**
   * Convert to plain object
   */
  public toJSON() {
    return {
      id: this.id,
      user_id: this.userId,
      name: this.name,
      parent_id: this.parentId,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
    };
  }
}
