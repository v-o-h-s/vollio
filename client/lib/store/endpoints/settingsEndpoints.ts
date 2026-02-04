import { UserSettings } from "@vollio/shared";
import { transformRTKQueryError } from "@/lib/utils/rtk-error-transform";
import type { ApiBuilder } from "./types";

interface BackendResponse<T> {
  success: boolean;
  data: T;
  error?: { message: string };
}

export const settingsEndpoints = (builder: ApiBuilder) => ({
  getSettings: builder.query<UserSettings, void>({
    query: () => "settings",
    transformResponse: (response: BackendResponse<UserSettings>) => {
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || "Failed to fetch settings");
      }
      return response.data;
    },
    transformErrorResponse: (response) =>
      transformRTKQueryError(response, { context: "loading settings" }),
    providesTags: ["Settings"],
  }),

  updateSettings: builder.mutation<UserSettings, UserSettings>({
    query: (settings) => ({
      url: "settings",
      method: "PATCH",
      body: settings,
    }),
    transformResponse: (response: BackendResponse<UserSettings>) => {
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || "Failed to update settings");
      }
      return response.data;
    },
    transformErrorResponse: (response) =>
      transformRTKQueryError(response, { context: "updating settings" }),
    invalidatesTags: ["Settings"],
  }),
});
