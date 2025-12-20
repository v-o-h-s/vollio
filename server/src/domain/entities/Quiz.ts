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

export class Quiz {
  private id: string;
  private documentId: string;
  private language: QuizLanguage;
  private difficultyLevel?: DifficultyLevel;
  private numberOfQuestions?: number;
  private timeLimitMinutes?: number;
  private explanationLevel: ExplanationLevel;
  private questions?: QuizQuestion[];
  private title?: string;
  private createdAt: Date;

  constructor(
    id: string,
    documentId: string,
    difficultyLevel: DifficultyLevel = DifficultyLevel.MEDIUM,
    language: QuizLanguage = QuizLanguage.EN,
    explanationLevel: ExplanationLevel = ExplanationLevel.NONE,
    numberOfQuestions?: number,
    timeLimitMinutes?: number,
    createdAt: Date = new Date(),
    questions?: QuizQuestion[],
    title?: string
  ) {
    this.id = id;
    this.documentId = documentId;
    this.difficultyLevel = difficultyLevel;
    this.language = language;
    this.numberOfQuestions = numberOfQuestions;
    this.timeLimitMinutes = timeLimitMinutes;
    this.explanationLevel = explanationLevel;
    this.questions = questions || [];
    this.createdAt = createdAt || new Date();
    this.title = title;
  }

  public getTitle(): string | null {
    return this.title ?? null;
  }

  public setTitle(title: string): void {
    this.title = title;
  }

  public setTimeLimitMinutes(timeLimitMinutes: number): void {
    this.timeLimitMinutes = timeLimitMinutes;
  }

  public getId(): string {
    return this.id;
  }

  public getFileId(): string {
    return this.documentId;
  }

  public getLanguage(): QuizLanguage {
    return this.language;
  }

  public getDifficultyLevel(): DifficultyLevel | null {
    return this.difficultyLevel ?? null;
  }

  public setDifficultyLevel(difficultyLevel: DifficultyLevel): void {
    this.difficultyLevel = difficultyLevel;
  }

  public getNumberOfQuestions(): number | null {
    return this.numberOfQuestions ?? null;
  }

  public setNumberOfQuestions(numberOfQuestions: number): void {
    this.numberOfQuestions = numberOfQuestions;
  }

  public getTimeLimitMinutes(): number | null {
    return this.timeLimitMinutes ?? null;
  }

  public getExplanationLevel(): ExplanationLevel {
    return this.explanationLevel;
  }

  public getQuestions(): QuizQuestion[] {
    return this.questions ?? [];
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public setQuestions(questions: QuizQuestion[]): void {
    this.questions = questions;
  }

  public ToJSON() {
    return {
      id: this.id,
      documentId: this.documentId,
      title: this.title,
      language: this.language,
      difficultyLevel: this.difficultyLevel,
      numberOfQuestions: this.numberOfQuestions,
      timeLimitMinutes: this.timeLimitMinutes,
      explanationLevel: this.explanationLevel,
      questions: this.questions,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
