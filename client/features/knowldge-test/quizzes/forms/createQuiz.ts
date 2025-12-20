import { QuizCreationFormData } from "../schemas/createQuizSchema";
import { redirect } from "next/navigation";

export const onSubmit = async (data: QuizCreationFormData) => {
  const body: any = {
    documentId: data.documentId,
    difficultyLevel: data.difficulty.toUpperCase(),
    language: data.language,
    explanationLevel: data.explanationLevel.toUpperCase(),
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

  const resp = await fetch("/api/v1/quizzes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(text || "Failed to create quiz");
  }

  return await resp.json();
};
