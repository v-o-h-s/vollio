import { JSONContent } from "@vollio/shared";

export class Note {
  private id: string;
  private title?: string;
  private content?: JSONContent;
  private documentId?: string;
  private createdAt: Date;
  private updatedAt: Date;
  private isSummary: boolean;

  constructor(
    id: string,
    title?: string,
    content?: JSONContent,
    documentId?: string,
    createdAt?: Date,
    updatedAt?: Date,
    isSummary?: boolean
  ) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.documentId = documentId;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
    this.isSummary = isSummary ?? false;
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

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }
  public isNoteSummary(): boolean {
    return this.isSummary;
  }
  public setNoteIsSummary(value: boolean): void {
    this.isSummary = value;
  }

  public toJSON() {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      documentId: this.documentId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isSummary: this.isSummary,
    };
  }
}
