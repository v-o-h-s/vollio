import { ApiBuilder } from "./types";
import { transformRTKQueryError } from "@/lib/utils/rtk-error-transform";
import {
  ApiResponse,
  AssistantDTO,
  AssistantResponseData,
} from "@vollio/shared";

export const assistantEndpoints = (builder: ApiBuilder) => ({
  assistantChat: builder.mutation<AssistantResponseData, AssistantDTO>({
    query: (data) => ({
      url: "assistant/",
      method: "POST",
      body: data,
    }),
    transformResponse: (response: ApiResponse<AssistantResponseData>) => {
      if (!response.success || !response.data) {
        throw new Error(
          (response.error as any)?.message ||
            "Failed to get assistant response",
        );
      }
      console.log("AssistantResponseData", response.data);
      return response.data;
    },
    transformErrorResponse: (response) =>
      transformRTKQueryError(response, {
        context: "getting assistant response",
      }),
  }),
});
