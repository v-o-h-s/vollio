export enum QuizQuestionsTypeEnum {
  MCQ = "mcq",
  TRUE_FALSE = "true_false",
}

export enum DifficultyLevel {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
}

export enum QuizLanguage {
  EN = "en",
  FR = "fr",
  AR = "ar",
}

export enum ExplanationLevel {
  NONE = "none",
  BRIEF = "brief",
  DETAILED = "detailed",
}

export interface BaseQuizQuestion {
  id: string;
  type: QuizQuestionsTypeEnum;
  text: string;
  points: number;
  explanation?: string;
}

export interface MCQQuestion extends BaseQuizQuestion {
  type: QuizQuestionsTypeEnum.MCQ;
  options: { id: string; text: string }[];
  correctOptionIds?: string[];
}

export interface TrueFalseQuestion extends BaseQuizQuestion {
  type: QuizQuestionsTypeEnum.TRUE_FALSE;
  correctAnswer?: boolean;
}

export type QuizQuestion = MCQQuestion | TrueFalseQuestion;

export interface CreateQuizDTO {
  documentId: string;
  difficultyLevel: DifficultyLevel;
  numberOfQuestions?: number;
  language?: QuizLanguage;

  explanationLevel?: ExplanationLevel;
  questionsDistribution?: Partial<Record<QuizQuestionsTypeEnum, number>>;
}

export interface QuizIdParams {
  id: string;
}
