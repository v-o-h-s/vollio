import {
  CreateQuizDTO,
  QuizQuestionsTypeEnum,
} from "../../../../shared/validation/quizSchemas";

/**
 * Refined prompt generation utilities for quiz creation.
 * - Users specify ABSOLUTE COUNTS per question type (not percentages)
 * - Percentages are DERIVED internally only for model guidance
 * - Client enforces exact counts after generation
 */

type NormalizedDistribution = {
  mcqCount: number | "auto";
  trueFalseCount: number | "auto";
  mcqPercent: number | "auto";
  trueFalsePercent: number | "auto";
};

type PromptResult = {
  prompt: string;
  meta: {
    language: string | null;
    difficulty: string | null;
    numberOfQuestions: number | "auto";
    distribution: NormalizedDistribution;
    explanationLevel: string | null;
  };
};

// ------------------------------------------------------------------------

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

const sanitize = (s?: string) => {
  if (!s) return "";
  return s.replace(/```/g, "\\`\\`\\`").trim();
};

/**
 * Users DO NOT pass percentages.
 * They pass absolute counts per question type.
 * Example: { MCQ: 16, TRUE_FALSE: 4 }
 */
const normalizeDistribution = (
  d?: Partial<Record<QuizQuestionsTypeEnum, number>>,
  totalQuestions?: number,
): NormalizedDistribution => {
  if (
    !d ||
    (!d[QuizQuestionsTypeEnum.MCQ] && !d[QuizQuestionsTypeEnum.TRUE_FALSE])
  ) {
    return {
      mcqCount: "auto",
      trueFalseCount: "auto",
      mcqPercent: "auto",
      trueFalsePercent: "auto",
    };
  }

  const mcq =
    typeof d[QuizQuestionsTypeEnum.MCQ] === "number"
      ? Math.max(0, d[QuizQuestionsTypeEnum.MCQ]!)
      : 0;
  const tf =
    typeof d[QuizQuestionsTypeEnum.TRUE_FALSE] === "number"
      ? Math.max(0, d[QuizQuestionsTypeEnum.TRUE_FALSE]!)
      : 0;

  const sum = mcq + tf;

  if (sum === 0) {
    return {
      mcqCount: "auto",
      trueFalseCount: "auto",
      mcqPercent: "auto",
      trueFalsePercent: "auto",
    };
  }

  const total = totalQuestions && totalQuestions > 0 ? totalQuestions : sum;

  return {
    mcqCount: mcq,
    trueFalseCount: tf,
    mcqPercent: clamp(Math.round((mcq / total) * 100), 0, 100),
    trueFalsePercent: clamp(Math.round((tf / total) * 100), 0, 100),
  };
};

// ------------------------------------------------------------------------

export const quizPromptGenerator = (data: CreateQuizDTO): PromptResult => {
  const refinedUserPromptText =
    "Generate a quiz based on the content provided.";

  const language = data.language || null;
  const difficulty = data.difficultyLevel || null;
  const explanationLevel = data.explanationLevel || null;

  const numberOfQuestions: number | "auto" =
    typeof data.numberOfQuestions === "number" && data.numberOfQuestions > 0
      ? Math.floor(data.numberOfQuestions)
      : "auto";

  const distribution = normalizeDistribution(
    data.questionsDistribution,
    typeof numberOfQuestions === "number" ? numberOfQuestions : undefined,
  );

  const rules = [
    "Output ONLY valid JSON (no surrounding text).",
    "Each question MUST strictly match its declared type.",
    "Do NOT exceed requested question counts.",
    "If content is insufficient, reduce question count and explain why in metadata.",
    "Every question must be directly grounded in the provided content.",
  ];

  const distributionText =
    distribution.mcqCount === "auto"
      ? "Auto-select a reasonable mix of MCQ and True/False."
      : `Generate EXACTLY ${distribution.mcqCount} MCQ and ${distribution.trueFalseCount} True/False questions.`;

  const prompt = `SYSTEM INSTRUCTION:
    You are a strict quiz generation engine.

    RULES:
    - ${rules.join("\n- ")}
    - Assign a unique, valid v4 UUID to each question and option.

    USER INSTRUCTION:
    ${refinedUserPromptText}

    CONSTRAINTS:
    - Language: ${language ?? "auto-detect (en, fr, ar)"}
    - Difficulty: ${difficulty ?? "auto (easy, medium, hard)"}
    - Total questions: ${numberOfQuestions}

    - Question distribution: ${distributionText}
    - Explanation level: ${explanationLevel ?? "none"}

    INPUT CONTENT:
    <<CONTENT_GOES_HERE>>

    OUTPUT FORMAT:
    Return ONLY valid JSON with no markdown formatting. The JSON must match this structure:
    {
      "title": "string (A creative and relevant title for the quiz)",
      "questions": [
        {
          "id": "string",
          "type": "mcq",
          "text": "string",
          "points": number,
          "explanation": "string (optional)",
          "options": [
            { "id": "string", "text": "string" }
          ],
          "correctOptionIds": ["string"]
        },
        {
          "id": "string",
          "type": "true_false",
          "text": "string",
          "points": number,
          "explanation": "string (optional)",
          "correctAnswer": boolean
        }
      ],
      "settings": {
        "difficultyLevel": "easy" | "medium" | "hard",
        "numberOfQuestions": number,

        "explanationLevel": "none" | "brief" | "detailed"
      },
      "language": "en" | "fr" | "ar",
      "summary": "string"
    }
`;

  return {
    prompt,
    meta: {
      language,
      difficulty,
      numberOfQuestions,
      distribution,
      explanationLevel,
    },
  };
};
