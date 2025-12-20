import { QuizCreationFormData } from "../schemas/createQuizSchema";
import { redirect } from "next/navigation";

export const onSubmit = async (data: QuizCreationFormData) => {
  const body: any = {
    documentId: data.documentId,
    difficultyLevel: data.difficulty.toUpperCase(),
  };

  if (data.userPrompt?.trim()) body.userPrompt = data.userPrompt.trim();
  if (data.numberOfQuestions) body.numberOfQuestions = data.numberOfQuestions;
  if (data.language) body.language = data.language;
  if (data.timeLimitMinutes) body.timeLimitMinutes = data.timeLimitMinutes;
  if (data.explanationLevel)
    body.explanationLevel = data.explanationLevel.toUpperCase();

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

  try {
    const resp = await fetch("/api/v1/quizzes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(text || "Failed to create quiz");
    }

    const responseData = await resp.json();

    // Navigate to the created quiz if id present
    if (responseData?.id)
      redirect(`/dashboard/knowledge-test/quizzes/${responseData.id}`);
    else redirect("/dashboard/knowledge-test");
  } catch (err: any) {
    console.error(err);
  }
};
