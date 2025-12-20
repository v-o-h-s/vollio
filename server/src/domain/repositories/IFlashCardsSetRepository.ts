import { FlashCardsSet } from "../entities/FlashCardsSet";

export interface IFlashCardsSetRepository {
  save(set: FlashCardsSet): Promise<void>;
  findById(id: string): Promise<FlashCardsSet | null>;
  findAll(): Promise<FlashCardsSet[]>;
  findByDocumentId(documentId: string): Promise<FlashCardsSet[]>;
  delete(id: string): Promise<void>;
}