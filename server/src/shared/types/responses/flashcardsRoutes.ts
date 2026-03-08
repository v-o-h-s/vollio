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
    hint: string;
  }[];
}

// GET /api/v1/flashcards
export type GetAllFlashCardsSetsResponse = FlashCardsSetSummary[];

export interface FlashCardsSetSummary {
  id: string;
  name: string;
  documentId: string;
  createdAt: string;
  language: string;
  flashCards: {
    id: string;
    front: string;
    back: string;
    hint: string;
  }[];
}

// GET /api/v1/flashcards/:id
export interface GetFlashCardsSetByIdResponse {
  id: string;
  name: string;
  documentId: string;
  createdAt: string;
  language: string;
  flashCards: {
    id: string;
    front: string;
    back: string;
    hint: string;
  }[];
}

// GET /api/v1/flashcards/document/:documentId
export type GetFlashCardsSetsByDocumentIdResponse = FlashCardsSetSummary[];
