import { FlashCard } from "./FlashCard";
import { QuizLanguage } from "./Quiz";

export class FlashCardsSet {
  private id: string;
  private name?: string;
  private documentId: string;
  private flashCards: FlashCard[];
  private language: QuizLanguage;
  private createdAt: Date;

  constructor(
    id: string,
    documentId: string,
    createdAt: Date = new Date(),
    language: QuizLanguage = QuizLanguage.EN,
    flashCards: FlashCard[] = [],
    name?: string
  ) {
    this.id = id;
    this.documentId = documentId;
    this.flashCards = flashCards;
    this.language = language;
    this.createdAt = createdAt;
    this.name = name;
  }

  public getId(): string {
    return this.id;
  }

  public getName(): string | undefined {
    return this.name;
  }

  public getDocumentId(): string {
    return this.documentId;
  }

  public getFlashCards(): FlashCard[] {
    return this.flashCards;
  }

  public setFlashCards(flashCards: FlashCard[]): void {
    this.flashCards = flashCards;
  }

  public setName(name: string): void {
    this.name = name;
  }

  public setId(id: string): void {
    this.id = id;
  }

  public getLanguage(): QuizLanguage {
    return this.language;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public toJSON() {
    return {
      id: this.id,
      name: this.name,
      flashCards: this.flashCards.map((fc) => fc.toJSON()),
      createdAt: this.createdAt.toISOString(),
      documentId: this.documentId,
      language: this.language,
    };
  }
}
