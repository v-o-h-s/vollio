import { SupabaseClient } from "@supabase/supabase-js";
import { FlashCardsSet } from "../../domain/entities/FlashCardsSet";
import { IFlashCardsSetRepository } from "../../domain/repositories/IFlashCardsSetRepository";
import { DatabaseError } from "../../shared/errors/DatabaseError";
import { FlashCardMapper } from "../../shared/mappers/FlashCardMapper";
import { FastifyBaseLogger } from "fastify";

export class FlashCardsSetRepository implements IFlashCardsSetRepository {
  constructor(
    private supabaseClient: SupabaseClient,
    private logger: FastifyBaseLogger
  ) {}

  async save(set: FlashCardsSet): Promise<void> {
    this.logger.info({ setId: set.getId() }, "Saving flashcard set");
    const { error: setError } = await this.supabaseClient
      .from("flashcard_sets")
      .insert(FlashCardMapper.toPersistence(set));

    if (setError) {
      this.logger.error(
        { error: setError, setId: set.getId() },
        "Error saving flashcard set"
      );
      throw new DatabaseError(setError);
    }

    const flashCards = set.getFlashCards();
    if (flashCards.length === 0) {
      this.logger.info({ setId: set.getId() }, "No flashcards to save for set");
      return;
    }

    const flashCardRecords = flashCards.map((fc) => ({
      id: fc.getId(),
      set_id: set.getId(),
      front: fc.getFront(),
      back: fc.getBack(),
      explanation: fc.getExplanation(),
    }));

    const { error: cardsError } = await this.supabaseClient
      .from("flashcards")
      .insert(flashCardRecords);

    if (cardsError) {
      this.logger.error(
        { error: cardsError, setId: set.getId() },
        "Error saving flashcards for set"
      );
      throw new DatabaseError(cardsError);
    }
    this.logger.info(
      { setId: set.getId(), count: flashCards.length },
      "Flashcard set saved successfully"
    );
  }

  async findById(id: string): Promise<FlashCardsSet | null> {
    this.logger.info({ setId: id }, "Finding flashcard set by ID");
    const { data, error } = await this.supabaseClient
      .from("flashcard_sets")
      .select(
        `
        *,
        flashcards (*)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        this.logger.info({ setId: id }, "Flashcard set not found");
        return null;
      }
      this.logger.error(
        { error, setId: id },
        "Error finding flashcard set by ID"
      );
      throw new DatabaseError(error);
    }

    this.logger.info({ setId: id }, "Flashcard set found");
    return FlashCardMapper.fromPersistenceToDomain(data);
  }

  async findAll(): Promise<FlashCardsSet[]> {
    this.logger.info("Finding all flashcard sets");
    const { data, error } = await this.supabaseClient
      .from("flashcard_sets")
      .select(
        `
        *
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      this.logger.error({ error }, "Error finding all flashcard sets");
      throw new DatabaseError(error);
    }
    this.logger.info(
      { count: data?.length || 0 },
      "All flashcard sets retrieved"
    );
    return (data || []).map((row) =>
      FlashCardMapper.fromPersistenceToDomain(row)
    );
  }

  async findByDocumentId(documentId: string): Promise<FlashCardsSet[]> {
    this.logger.info({ documentId }, "Finding flashcard sets by document ID");
    const { data, error } = await this.supabaseClient
      .from("flashcard_sets")
      .select("*")
      .eq("document_id", documentId)
      .order("created_at", { ascending: false });

    if (error) {
      this.logger.error(
        { error, documentId },
        "Error finding flashcard sets by document ID"
      );
      throw new DatabaseError(error);
    }
    this.logger.info(
      { documentId, count: data?.length || 0 },
      "Flashcard sets retrieved for document"
    );
    return (data || []).map((row) =>
      FlashCardMapper.fromPersistenceToDomain(row)
    );
  }

  async delete(id: string): Promise<void> {
    this.logger.info({ setId: id }, "Deleting flashcard set");
    const { error } = await this.supabaseClient
      .from("flashcard_sets")
      .delete()
      .eq("id", id);

    if (error) {
      this.logger.error({ error, setId: id }, "Error deleting flashcard set");
      throw new DatabaseError(error);
    }
    this.logger.info({ setId: id }, "Flashcard set deleted successfully");
  }
}
