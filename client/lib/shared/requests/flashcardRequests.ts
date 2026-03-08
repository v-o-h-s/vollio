import { QuizLanguage } from "./quizRequests";

export interface CreateFlashCardsDTO {
  userPrompt?: string;
  documentId: string;
  numberOfCards?: number;
  language?: QuizLanguage;
  difficulty?: "Easy" | "Medium" | "Hard";
}

export interface FlashCardsSetIdParams {
  id: string;
}

export interface CreateManualFlashCardsDTO {
  name: string;
  description?: string;
  language?: string;
  documentId: string;
  flashCards: {
    front: string;
    back: string;
    hint?: string;
  }[];
}
