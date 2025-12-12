import { ApiBuilder } from "./types";

export const testEndpoints = (builder: ApiBuilder) => ({
  processTest: builder.mutation<any, { link: string }>({
    query: (data) => ({
      url: "test",
      method: "POST",
      body: data,
    }),
  }),
});
