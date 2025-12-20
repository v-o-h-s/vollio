import { CreateFlashCardsDTO } from "../../../../shared/validation/flashcardSchemas";

/**
 * Prompt generation utilities for flashcard creation.
 */

type PromptResult = {
  prompt: string;
  meta: {
    language: string | null;
    numberOfCards: number | "auto";
  };
};

const sanitize = (s?: string) => {
  if (!s) return "";
  return s.replace(/```/g, "\\`\\`\\`").trim();
};

export const refineUserPrompt = (userPrompt?: string): string => {
  const text = sanitize(userPrompt);
  if (!text)
    return "Generate a set of flashcards based on the content provided.";

  return `Refine the following user intent into a single clear instruction for a flashcard generator:\nUser intent: "${text}"\nResult:`;
};

export const flashcardPromptGenerator = (
  data: CreateFlashCardsDTO
): PromptResult => {
  const refinedUserPromptText = data.userPrompt
    ? refineUserPrompt(data.userPrompt)
    : "Generate a set of flashcards based on the content provided.";

  const language = data.language || null;

  const numberOfCards: number | "auto" =
    typeof data.numberOfCards === "number" && data.numberOfCards > 0
      ? Math.floor(data.numberOfCards)
      : "auto";

  const rules = [
    "Output ONLY valid JSON (no surrounding text).",
    "Each flashcard MUST have a clear 'front' (question/term) and 'back' (answer/definition).",
    "Include an 'explanation' field for additional context or deeper understanding of the card.",
    "Do NOT exceed requested card counts.",
    "If content is insufficient, reduce card count and explain why in metadata.",
    "Every flashcard must be directly grounded in the provided content.",
  ];

  const prompt = `SYSTEM INSTRUCTION:
    You are a strict flashcard generation engine.

    RULES:
    - ${rules.join("\n- ")}
    - Assign a unique, valid v4 UUID to each flashcard.

    USER INSTRUCTION:
    ${refinedUserPromptText}

    CONSTRAINTS:
    - Language: ${language ?? "auto-detect (en, fr, ar)"}
    - Total flashcards: ${numberOfCards}

    INPUT CONTENT:
    <<CONTENT_GOES_HERE>>

    OUTPUT FORMAT:
    Return ONLY valid JSON with no markdown formatting. The JSON must match this structure:
    {
      "name": "string (A creative and relevant title for this flashcard set)",
      "flashCards": [
        {
          "id": "string",
          "front": "string",
          "back": "string",
          "explanation": "string (optional)"
        }
      ],
      "language": "en" | "fr" | "ar",
      "summary": "string"
    }
`;

  return {
    prompt,
    meta: {
      language,
      numberOfCards,
    },
  };
};
