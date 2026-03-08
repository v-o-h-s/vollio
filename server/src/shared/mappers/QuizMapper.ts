import {
  Quiz,
  QuizQuestion,
  QuizQuestionsTypeEnum,
  MCQQuestion,
  TrueFalseQuestion,
  DifficultyLevel,
  QuizLanguage,
  ExplanationLevel,
} from "../../domain/entities/Quiz";
import { CreateQuizResponse } from "../../shared";

export class QuizMapper {
  constructor() {}
  public static fromDomainToInterface(quiz: Quiz): CreateQuizResponse {
    return {
      id: quiz.getId(),
      title: quiz.getTitle(),
      documentId: quiz.getDocumentId(),
      language: quiz.getLanguage(),
      settings: {
        difficultyLevel: quiz.getDifficultyLevel(),
        numberOfQuestions: quiz.getNumberOfQuestions(),
        explanationLevel: quiz.getExplanationLevel(),
      },
      questions: quiz.getQuestions() || [],
      createdAt: quiz.getCreatedAt().toISOString(),
    };
  }

  public static fromPersistenceToDomain(row: any): Quiz {
    const questions: QuizQuestion[] = (row.quiz_questions || [])
      .sort((a: any, b: any) => a.position - b.position)
      .map((q: any) => {
        const base: any = {
          id: q.id,
          type: q.type,
          text: q.text,
          points: q.points,
          explanation: q.explanation,
        };

        if (q.type === QuizQuestionsTypeEnum.MCQ) {
          return {
            ...base,
            options: (q.mcq_options || [])
              .sort((a: any, b: any) => a.position - b.position)
              .map((opt: any) => ({
                id: opt.id,
                text: opt.text,
              })),
            correctOptionIds: (q.mcq_options || [])
              .filter((opt: any) => opt.is_correct)
              .map((opt: any) => opt.id),
          } as MCQQuestion;
        } else if (q.type === QuizQuestionsTypeEnum.TRUE_FALSE) {
          return {
            ...base,
            correctAnswer: q.true_false_answers?.[0]?.correct_answer,
          } as TrueFalseQuestion;
        }
        return base as QuizQuestion;
      });

    return new Quiz(
      row.id,
      row.document_id,
      row.difficulty_level as DifficultyLevel,
      row.language as QuizLanguage,
      row.explanation_level as ExplanationLevel,
      row.number_of_questions,

      new Date(row.created_at),
      questions,
      row.title,
    );
  }

  public static toPersistence(quiz: Quiz) {
    return {
      id: quiz.getId(),
      document_id: quiz.getDocumentId(),
      difficulty_level: quiz.getDifficultyLevel(),
      language: quiz.getLanguage(),
      explanation_level: quiz.getExplanationLevel(),
      number_of_questions: quiz.getNumberOfQuestions(),
      created_at: quiz.getCreatedAt().toISOString(),
      title: quiz.getTitle(),
    };
  }
}
