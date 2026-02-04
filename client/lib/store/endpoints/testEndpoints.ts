import { ApiBuilder } from "./types";
import { transformRTKQueryError } from "@/lib/utils/rtk-error-transform";

export const testEndpoints = (builder: ApiBuilder) => ({
  processTest: builder.mutation<any, { link: string }>({
    query: (data) => ({
      url: "test",
      method: "POST",
      body: data,
    }),
    transformErrorResponse: (response) =>
      transformRTKQueryError(response, { context: "processing test" }),
  }),
});
