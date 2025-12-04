import { JSONContent } from "../shared/types/note";

export class Note {
  private id: string;
  private title?: string;
  private content?: JSONContent;
  private pdfId?: string;

  constructor(
    id: string,
    title?: string,
    content?: JSONContent,
    pdfId?: string
  ) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.pdfId = pdfId;
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
  public toJSON() {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      pdfId: this.pdfId,
    };
  }
}
