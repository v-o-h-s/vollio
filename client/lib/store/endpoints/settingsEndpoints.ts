import { UserSettings } from "@vollio/shared";
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
    invalidatesTags: ["Settings"],
  }),
});
