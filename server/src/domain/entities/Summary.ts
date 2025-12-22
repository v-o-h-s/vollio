export class Summary {
  private id: string;
  private pdfId: string;
  private mainPoints: string[];
  private createdAt: string;
  private updatedAt: string;
  private text?: string;
  constructor(
    pdfId: string,
    mainPoints: string[],
    createdAt?: string,
    updatedAt?: string,
    text?: string,
    id?: string
  ) {
    this.id = id ?? crypto.randomUUID();
    this.pdfId = pdfId;
    this.mainPoints = mainPoints;
    this.createdAt = createdAt ?? new Date().toISOString();
    this.updatedAt = updatedAt ?? new Date().toISOString();
    this.text = text;
  }
  public getText(): string | undefined {
    return this.text;
  }
  public setText(text: string): void {
    this.text = text;
  }
  public getId(): string {
    return this.id;
  }

  public getPdfId(): string {
    return this.pdfId;
  }

  public getMainPoints(): string[] {
    return this.mainPoints;
  }

  public getCreatedAt(): string {
    return this.createdAt;
  }

  public getUpdatedAt(): string {
    return this.updatedAt;
  }
  public setMainPoints(mainPoints: string[]): void {
    this.mainPoints = mainPoints;
  }
 
}
