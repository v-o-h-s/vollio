import { Quiz } from "../../domain/entities/Quiz";
import { CreateQuizResponse } from "../types/responses/quizRoutes";

export class QuizMapper {
    constructor() { }
    public static fromDomainToInterface(quiz: Quiz): CreateQuizResponse {
        return {
            id: quiz.getId(),
            fileId: quiz.getFileId(),
            language: quiz.getLanguage(),
            settings: {
                difficultyLevel: quiz.getDifficultyLevel(),
                numberOfQuestions: quiz.getNumberOfQuestions()!,
                timeLimitMinutes: quiz.getTimeLimitMinutes()!,
                explanationLevel: quiz.getExplanationLevel(),
            },
            questions: quiz.getQuestions() || [],
            createdAt: quiz.getCreatedAt().toISOString(),
        }
    }
}