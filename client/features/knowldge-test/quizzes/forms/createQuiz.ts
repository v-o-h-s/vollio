import { QuizCreationFormData } from "../schemas/createQuizSchema";

export const prepareQuizPayload = (data: QuizCreationFormData) => {
  const body: any = {
    documentId: data.documentId,
    difficultyLevel: data.difficulty,
    language: data.language,
    explanationLevel: data.explanationLevel,
    numberOfQuestions: data.numberOfQuestions,
  };

  if (data.userPrompt?.trim()) body.userPrompt = data.userPrompt.trim();
  if (data.timeLimitMinutes) body.timeLimitMinutes = data.timeLimitMinutes;

  // questionsDistribution: only include numbers
  const dist: Record<string, number> = {};
  if (data.questionsDistribution) {
    Object.entries(data.questionsDistribution).forEach(([k, v]) => {
      if (typeof v === "number" && !Number.isNaN(v) && v > 0) {
        dist[k] = v;
      }
    });
  }
  if (Object.keys(dist).length > 0) body.questionsDistribution = dist;

  return body;
};
