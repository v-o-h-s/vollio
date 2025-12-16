export enum QuizQuestionsTypeEnum {
    MCQ = "mcq",
    TRUE_FALSE = "true_false",
    FILL_IN_THE_BLANKS = "fill_blanks",
    SHORT_ANSWER = "short_answer",
}

export enum DifficultyLevel {
    EASY = "easy",
    MEDIUM = "medium",
    HARD = "hard"
}

export enum QuizLanguage {
    EN = "en",
    FR = "fr",
    AR = "ar"
}

export enum ExplanationLevel {
    NONE = "none",
    BRIEF = "brief",
    DETAILED = "detailed"
}

export interface BaseQuizQuestion {
    id: string;
    type: QuizQuestionsTypeEnum;
    text: string;
    points: number;
    explanation?: string;
    position?: number;
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

export interface FillBlanksQuestion extends BaseQuizQuestion {
    type: QuizQuestionsTypeEnum.FILL_IN_THE_BLANKS;
    blanks?: { id: string; acceptableAnswers: string[] }[];
}

export interface ShortAnswerQuestion extends BaseQuizQuestion {
    type: QuizQuestionsTypeEnum.SHORT_ANSWER;
    expectedAnswer?: string;
    gradingMode?: "manual" | "ai_assisted";
}

export type QuizQuestion = MCQQuestion | TrueFalseQuestion | FillBlanksQuestion | ShortAnswerQuestion;


export class Quiz {
    private id: string;
    private fileId: string;
    private language: QuizLanguage;
    private difficultyLevel?: DifficultyLevel;
    private numberOfQuestions?: number;
    private timeLimitMinutes?: number;
    private explanationLevel: ExplanationLevel;
    private questions?: QuizQuestion[];
    private createdAt: Date;

    constructor(
        id: string,
        fileId: string,
        difficultyLevel: DifficultyLevel = DifficultyLevel.MEDIUM,
        questions?: QuizQuestion[],
        language: QuizLanguage = QuizLanguage.EN,
        numberOfQuestions?: number,
        timeLimitMinutes?: number,
        explanationLevel: ExplanationLevel = ExplanationLevel.NONE,
        createdAt?: Date,
    ) {

        this.id = id;
        this.fileId = fileId;
        this.difficultyLevel = difficultyLevel;
        this.language = language;
        this.numberOfQuestions = numberOfQuestions;
        this.timeLimitMinutes = timeLimitMinutes;
        this.explanationLevel = explanationLevel;
        this.questions = questions || [];
        this.createdAt = createdAt || new Date();
    }
    public setTimeLimitMinutes(timeLimitMinutes: number): void {
        this.timeLimitMinutes = timeLimitMinutes;
    }
    public getId(): string {
        return this.id;
    }

    public getFileId(): string {
        return this.fileId;
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
            fileId: this.fileId,
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
