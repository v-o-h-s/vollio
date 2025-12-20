import { FlashCard } from "../../domain/entities/FlashCard";
import { FlashCardsSet } from "../../domain/entities/FlashCardsSet";
import { QuizLanguage } from "../../domain/entities/Quiz";

export class FlashCardMapper {
  public static fromPersistenceToDomain(row: any): FlashCardsSet {
    const flashCards = (row.flashcards || []).map(
      (fc: any) => new FlashCard(fc.id, fc.set_id, fc.front, fc.back, fc.hint)
    );

    return new FlashCardsSet(
      row.id,
      row.document_id,
      new Date(row.created_at),
      row.language as QuizLanguage,
      flashCards,
      row.name
    );
  }

  public static toPersistence(set: FlashCardsSet) {
    return {
      id: set.getId(),
      name: set.getName(),
      document_id: set.getDocumentId(),
      language: set.getLanguage(),
      created_at: set.getCreatedAt().toISOString(),
    };
  }
}
