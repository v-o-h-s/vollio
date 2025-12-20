// POST /api/v1/flashcards
export interface CreateFlashCardsSetResponse {
  id: string;
  name: string;
  documentId: string;
  createdAt: string;
  language: string;
  flashCards: {
    id: string;
    front: string;
    back: string;
    explanation: string;
  }[];
}
