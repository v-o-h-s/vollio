import { ApiBuilder } from "./types";
import {
  ApiResponse,
  ExplainTextResponseData,
  AssistantDTO,
  AssistantResponseData,
} from "@vollio/shared";

export const aiEndpoints = (builder: ApiBuilder) => ({
  explainText: builder.query<ExplainTextResponseData, string>({
    query: (selection) => ({
      url: "ai/explain",
      method: "POST",
      body: {
        text: selection,
      },
    }),
    transformResponse: (response: ApiResponse<ExplainTextResponseData>) => {
      if (!response.success || !response.data) {
        throw new Error(
          (response.error as any)?.message || "Failed to explain text"
        );
      }
      return response.data;
    },
  }),

  assistantChat: builder.mutation<AssistantResponseData, AssistantDTO>({
    query: (data) => ({
      url: "ai/assistant",
      method: "POST",
      body: data,
    }),
    transformResponse: (response: ApiResponse<AssistantResponseData>) => {
      if (!response.success || !response.data) {
        throw new Error(
          (response.error as any)?.message || "Failed to get assistant response"
        );
      }
      console.log("AssistantResponseData", response.data)
      return response.data ;
    },
  }),
});
