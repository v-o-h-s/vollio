import { ApiBuilder } from "./types";
import { transformRTKQueryError } from "@/lib/utils/rtk-error-transform";
import {
  GetAllQuizzesResponse,
  GetQuizByIdResponse,
  CreateQuizResponse,
} from "@/lib/shared";
import { ServerSuccessResponse } from "@/lib/shared";
import { CreateQuizDTO } from "@/lib/shared";

export const quizEndpoints = (builder: ApiBuilder) => ({
  getQuiz: builder.query<GetQuizByIdResponse, string>({
    query: (id) => ({
      url: `quizzes/${id}`,
      method: "GET",
    }),
    transformResponse: (
      response: ServerSuccessResponse<GetQuizByIdResponse>,
    ) => {
      if (!response.data) {
        throw new Error("Quiz not found");
      }
      return response.data;
    },
    transformErrorResponse: (response) =>
      transformRTKQueryError(response, { notFoundMessage: "Quiz not found" }),
    providesTags: (_result, _error, id) => [{ type: "Quiz", id }],
  }),

  getAllQuizzes: builder.query<GetAllQuizzesResponse, void>({
    query: () => ({
      url: "quizzes",
      method: "GET",
    }),
    transformResponse: (
      response: ServerSuccessResponse<GetAllQuizzesResponse>,
    ) => {
      return response.data || [];
    },
    transformErrorResponse: (response) =>
      transformRTKQueryError(response, { context: "loading quizzes" }),
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
      response: ServerSuccessResponse<CreateQuizResponse>,
    ) => {
      if (!response.data) {
        throw new Error("Failed to create quiz");
      }
      return response.data;
    },
    transformErrorResponse: (response) =>
      transformRTKQueryError(response, { context: "creating quiz" }),
    invalidatesTags: [{ type: "Quiz", id: "LIST" }],
  }),

  deleteQuiz: builder.mutation<null, string>({
    query: (id) => ({
      url: `quizzes/${id}`,
      method: "DELETE",
    }),
    transformResponse: (response: ServerSuccessResponse<null>) => response.data,
    transformErrorResponse: (response) =>
      transformRTKQueryError(response, { context: "deleting quiz" }),
    invalidatesTags: (_result, _error, id) => [
      { type: "Quiz", id: "LIST" },
      { type: "Quiz", id },
    ],
  }),
});
