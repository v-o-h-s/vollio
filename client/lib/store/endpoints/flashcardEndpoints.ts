import { ApiBuilder } from "./types";
import {
  GetAllFlashCardsSetsResponse,
  GetFlashCardsSetByIdResponse,
  CreateFlashCardsSetResponse,
  GetFlashCardsSetsByDocumentIdResponse,
} from "@shared/types/responses/flashcardsRoutes";
import { ServerSuccessResponse } from "@shared/types/responses/general";
import {
  CreateFlashCardsDTO,
  CreateManualFlashCardsDTO,
} from "@shared/validation/flashcardSchemas";

export const flashcardEndpoints = (builder: ApiBuilder) => ({
  getFlashCardsSet: builder.query<GetFlashCardsSetByIdResponse, string>({
    query: (id) => ({
      url: `flashcards/${id}`,
      method: "GET",
    }),
    transformResponse: (
      response: ServerSuccessResponse<GetFlashCardsSetByIdResponse>
    ) => {
      if (!response.data) {
        throw new Error("Flashcard set not found");
      }
      return response.data;
    },
    providesTags: (_result, _error, id) => [{ type: "Flashcard", id }],
  }),

  getAllFlashCardsSets: builder.query<GetAllFlashCardsSetsResponse, void>({
    query: () => ({
      url: "flashcards",
      method: "GET",
    }),
    transformResponse: (
      response: ServerSuccessResponse<GetAllFlashCardsSetsResponse>
    ) => {
      return response.data || [];
    },
    providesTags: (result) => [
      { type: "Flashcard", id: "LIST" },
      ...(result?.map((set) => ({ type: "Flashcard" as const, id: set.id })) ||
        []),
    ],
  }),

  getFlashCardsSetsByDocumentId: builder.query<
    GetFlashCardsSetsByDocumentIdResponse,
    string
  >({
    query: (documentId) => ({
      url: `flashcards/document/${documentId}`,
      method: "GET",
    }),
    transformResponse: (
      response: ServerSuccessResponse<GetFlashCardsSetsByDocumentIdResponse>
    ) => {
      return response.data || [];
    },
    providesTags: (result, _error, documentId) => [
      { type: "Flashcard", id: `DOCUMENT_${documentId}` },
      ...(result?.map((set) => ({ type: "Flashcard" as const, id: set.id })) ||
        []),
    ],
  }),

  createFlashCardsSet: builder.mutation<
    CreateFlashCardsSetResponse,
    CreateManualFlashCardsDTO
  >({
    query: (data) => ({
      url: "flashcards",
      method: "POST",
      body: data,
    }),
    transformResponse: (
      response: ServerSuccessResponse<CreateFlashCardsSetResponse>
    ) => {
      if (!response.data) {
        throw new Error("Failed to create flashcard set");
      }
      return response.data;
    },
    invalidatesTags: [{ type: "Flashcard", id: "LIST" }],
  }),

  generateFlashCardsSet: builder.mutation<
    CreateFlashCardsSetResponse,
    CreateFlashCardsDTO
  >({
    query: (data) => ({
      url: "flashcards/generate-from-document",
      method: "POST",
      body: data,
    }),
    transformResponse: (
      response: ServerSuccessResponse<CreateFlashCardsSetResponse>
    ) => {
      if (!response.data) {
        throw new Error("Failed to generate flashcard set");
      }
      return response.data;
    },
    invalidatesTags: [{ type: "Flashcard", id: "LIST" }],
  }),

  deleteFlashCardsSet: builder.mutation<null, string>({
    query: (id) => ({
      url: `flashcards/${id}`,
      method: "DELETE",
    }),
    transformResponse: (response: ServerSuccessResponse<null>) => response.data,
    invalidatesTags: (_result, _error, id) => [
      { type: "Flashcard", id: "LIST" },
      { type: "Flashcard", id },
    ],
  }),
});
