import { JSONContent } from "@vollio/shared";

export class Note {
  private id: string;
  private userId: string;
  private title?: string;
  private content?: JSONContent;
  private documentId?: string;
  private createdAt: Date;
  private updatedAt: Date;

  constructor(
    id: string,
    userId: string,
    title?: string,
    content?: JSONContent,
    documentId?: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.documentId = documentId;
    this.userId = userId;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }
  public getId(): string {
    return this.id;
  }

  public getTitle(): string | undefined {
    return this.title;
  }

  public getContent(): JSONContent | undefined {
    return this.content;
  }

  public getDocumentId(): string | undefined {
    return this.documentId;
  }
  public getUserId(): string {
    return this.userId;
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
      title: this.title,
      content: this.content,
      userId: this.userId,
      documentId: this.documentId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
