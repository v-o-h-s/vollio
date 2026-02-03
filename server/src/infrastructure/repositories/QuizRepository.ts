import { SupabaseClient } from "@supabase/supabase-js";
import {
  Quiz,
  QuizQuestionsTypeEnum,
  MCQQuestion,
  TrueFalseQuestion,
} from "../../domain/entities/Quiz";
import { IQuizRepository } from "../../domain/repositories/IQuizRepository";
import { DatabaseError } from "../../shared/errors/DatabaseError";
import { QuizMapper } from "../../shared/mappers/QuizMapper";
import { FastifyBaseLogger } from "fastify";

/**
 * QuizRepository
 *
 * @description
 * Handles all database operations related to quizzes.
 *
 * @class
 * @implements {IQuizRepository}
 */
export class QuizRepository implements IQuizRepository {
  constructor(
    private supabaseClient: SupabaseClient,
    private logger: FastifyBaseLogger,
  ) {}

  /**
   * Saves a quiz to the database.
   *
   * @param {Quiz} quiz - The quiz to save.
   * @returns {Promise<void>}
   */
  async save(quiz: Quiz): Promise<void> {
    this.logger.info({ quizId: quiz.getId() }, "Saving quiz to database");
    const { error: quizError } = await this.supabaseClient
      .from("quizzes")
      .insert({
        id: quiz.getId(),
        title: quiz.getTitle(),
        document_id: quiz.getDocumentId(),
        language: quiz.getLanguage(),
        difficulty_level: quiz.getDifficultyLevel(),
        number_of_questions:
          quiz.getNumberOfQuestions() || quiz.getQuestions().length,
        explanation_level: quiz.getExplanationLevel(),
        created_at: quiz.getCreatedAt().toISOString(),
      });

    if (quizError) {
      this.logger.error(
        { error: quizError, quizId: quiz.getId() },
        "Error saving quiz",
      );
      throw new DatabaseError(quizError);
    }

    const questions = quiz.getQuestions();
    if (questions.length === 0) {
      this.logger.info(
        { quizId: quiz.getId() },
        "No questions to save for quiz",
      );
      return;
    }

    // Prepare quiz_questions
    const questionRecords = questions.map((q, index) => ({
      id: q.id,
      quiz_id: quiz.getId(),
      type: q.type,
      text: q.text,
      points: q.points || 0,
      explanation: q.explanation,
      position: index + 1,
    }));

    const { error: questionsError } = await this.supabaseClient
      .from("quiz_questions")
      .insert(questionRecords);

    if (questionsError) {
      this.logger.error(
        { error: questionsError, quizId: quiz.getId() },
        "Error saving quiz questions",
      );
      throw new DatabaseError(questionsError);
    }

    // Prepare sub-table records
    const mcqOptions: any[] = [];
    const tfAnswers: any[] = [];

    for (const q of questions) {
      if (q.type === QuizQuestionsTypeEnum.MCQ) {
        const mcq = q as MCQQuestion;
        mcq.options.forEach((opt, idx) => {
          mcqOptions.push({
            id: opt.id,
            question_id: q.id,
            text: opt.text,
            is_correct: mcq.correctOptionIds?.includes(opt.id) || false,
            position: idx,
          });
        });
      } else if (q.type === QuizQuestionsTypeEnum.TRUE_FALSE) {
        const tf = q as TrueFalseQuestion;
        tfAnswers.push({
          question_id: q.id,
          correct_answer: tf.correctAnswer ?? false,
        });
      }
    }

    if (mcqOptions.length > 0) {
      const { error } = await this.supabaseClient
        .from("mcq_options")
        .insert(mcqOptions);
      if (error) {
        this.logger.error(
          { error, quizId: quiz.getId() },
          "Error saving MCQ options",
        );
        throw new DatabaseError(error);
      }
    }

    if (tfAnswers.length > 0) {
      const { error } = await this.supabaseClient
        .from("true_false_answers")
        .insert(tfAnswers);
      if (error) {
        this.logger.error(
          { error, quizId: quiz.getId() },
          "Error saving True/False answers",
        );
        throw new DatabaseError(error);
      }
    }
    this.logger.info(
      { quizId: quiz.getId(), questionsCount: questions.length },
      "Quiz saved successfully",
    );
  }

  /**
   * Finds a quiz by its ID.
   *
   * @param {string} id - The ID of the quiz to find.
   * @returns {Promise<Quiz | null>} The quiz if found, otherwise null.
   */
  async findById(id: string): Promise<Quiz | null> {
    this.logger.info({ quizId: id }, "Finding quiz by ID");
    const { data: quizData, error: quizError } = await this.supabaseClient
      .from("quizzes")
      .select(
        `
        *,
        quiz_questions (
          *,
          mcq_options (*),
          true_false_answers (*)
        )
      `,
      )
      .eq("id", id)
      .single();

    if (quizError) {
      if (quizError.code === "PGRST116") {
        this.logger.info({ quizId: id }, "Quiz not found");
        return null;
      }
      this.logger.error(
        { error: quizError, quizId: id },
        "Error finding quiz by ID",
      );
      throw new DatabaseError(quizError);
    }

    this.logger.info({ quizId: id }, "Quiz found");
    return QuizMapper.fromPersistenceToDomain(quizData);
  }

  /**
   * Finds all quizzes in the database.
   *
   * @returns {Promise<Quiz[]>} An array of quizzes.
   */
  async findAll(): Promise<Quiz[]> {
    this.logger.info("Finding all quizzes");
    const { data, error } = await this.supabaseClient
      .from("quizzes")
      .select(`*`)
      .order("created_at", { ascending: false });

    if (error) {
      this.logger.error({ error }, "Error finding all quizzes");
      throw new DatabaseError(error);
    }
    this.logger.info(
      { count: data?.length || 0 },
      "Quizzes retrieved successfully",
    );
    return (data || []).map((row) => QuizMapper.fromPersistenceToDomain(row));
  }

  /**
   * Deletes a quiz from the database by its ID.
   *
   * @param {string} id - The ID of the quiz to delete.
   * @returns {Promise<void>}
   */
  async delete(id: string): Promise<void> {
    this.logger.info({ quizId: id }, "Deleting quiz");
    const { error } = await this.supabaseClient
      .from("quizzes")
      .delete()
      .eq("id", id);
    if (error) {
      this.logger.error({ error, quizId: id }, "Error deleting quiz");
      throw new DatabaseError(error);
    }
    this.logger.info({ quizId: id }, "Quiz deleted successfully");
  }
}
