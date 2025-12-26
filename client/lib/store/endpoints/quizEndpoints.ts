import { ApiBuilder } from "./types";
import {
  GetAllQuizzesResponse,
  GetQuizByIdResponse,
  CreateQuizResponse,
} from "@vollio/shared";
import { ServerSuccessResponse } from "@vollio/shared";
import { CreateQuizDTO } from "@vollio/shared";

export const quizEndpoints = (builder: ApiBuilder) => ({
  getQuiz: builder.query<GetQuizByIdResponse, string>({
    query: (id) => ({
      url: `quizzes/${id}`,
      method: "GET",
    }),
    transformResponse: (
      response: ServerSuccessResponse<GetQuizByIdResponse>
    ) => {
      if (!response.data) {
        throw new Error("Quiz not found");
      }
      return response.data;
    },
    providesTags: (_result, _error, id) => [{ type: "Quiz", id }],
  }),

  getAllQuizzes: builder.query<GetAllQuizzesResponse, void>({
    query: () => ({
      url: "quizzes",
      method: "GET",
    }),
    transformResponse: (
      response: ServerSuccessResponse<GetAllQuizzesResponse>
    ) => {
      return response.data || [];
    },
    providesTags: (result) => [
      { type: "Quiz", id: "LIST" },
      ...(result?.map((quiz) => ({ type: "Quiz" as const, id: quiz.id })) ||
        []),
    ],
  }),

  createQuiz: builder.mutation<CreateQuizResponse, CreateQuizDTO>({
    query: (data) => ({
      url: "quizzes",
      method: "POST",
      body: data,
    }),
    transformResponse: (
      response: ServerSuccessResponse<CreateQuizResponse>
    ) => {
      if (!response.data) {
        throw new Error("Failed to create quiz");
      }
      return response.data;
    },
    invalidatesTags: [{ type: "Quiz", id: "LIST" }],
  }),

  deleteQuiz: builder.mutation<null, string>({
    query: (id) => ({
      url: `quizzes/${id}`,
      method: "DELETE",
    }),
    transformResponse: (response: ServerSuccessResponse<null>) => response.data,
    invalidatesTags: (_result, _error, id) => [
      { type: "Quiz", id: "LIST" },
      { type: "Quiz", id },
    ],
  }),
});
