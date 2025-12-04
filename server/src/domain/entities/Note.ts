import { JSONContent } from "../../shared/types/note";

export class Note {
  private id: string;
  private userId: string;
  private title?: string;
  private content?: JSONContent;
  private pdfId?: string;
  private createdAt: Date;
  private updatedAt: Date;

  constructor(
    id: string,
    userId: string,
    title?: string,
    content?: JSONContent,
    pdfId?: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.pdfId = pdfId;
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

  public getPdfId(): string | undefined {
    return this.pdfId;
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
      pdfId: this.pdfId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
