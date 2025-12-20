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

export class QuizRepository implements IQuizRepository {
  constructor(private supabaseClient: SupabaseClient) {}

  async save(quiz: Quiz): Promise<void> {
    const { error: quizError } = await this.supabaseClient.from("quizzes").insert({
      id: quiz.getId(),
      document_id: quiz.getFileId(),
      language: quiz.getLanguage(),
      difficulty_level: quiz.getDifficultyLevel(),
      number_of_questions:
        quiz.getNumberOfQuestions() || quiz.getQuestions().length,
      time_limit_minutes: quiz.getTimeLimitMinutes(),
      explanation_level: quiz.getExplanationLevel(),
      created_at: quiz.getCreatedAt().toISOString(),
    });

    if (quizError) throw new DatabaseError(quizError);

    const questions = quiz.getQuestions();
    if (questions.length === 0) return;

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

    if (questionsError) throw new DatabaseError(questionsError);

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
      if (error) throw new DatabaseError(error);
    }

    if (tfAnswers.length > 0) {
      const { error } = await this.supabaseClient
        .from("true_false_answers")
        .insert(tfAnswers);
      if (error) throw new DatabaseError(error);
    }
  }

  async findById(id: string): Promise<Quiz | null> {
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
      `
      )
      .eq("id", id)
      .single();

    if (quizError) {
      if (quizError.code === "PGRST116") return null;
      throw new DatabaseError(quizError);
    }

    return QuizMapper.fromPersistenceToDomain(quizData);
  }

  async findAll(): Promise<Quiz[]> {
    const { data, error } = await this.supabaseClient
      .from("quizzes")
      .select(
        `
        *,
        quiz_questions (
          *,
          mcq_options (*),
          true_false_answers (*)
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw new DatabaseError(error);
    return (data || []).map((row) => QuizMapper.fromPersistenceToDomain(row));
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabaseClient.from("quizzes").delete().eq("id", id);
    if (error) throw new DatabaseError(error);
  }
}
