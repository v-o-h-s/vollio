import type { ApiBuilder } from "./types";

export const folderEndpoints = (builder: ApiBuilder) => ({
  getFolders: builder.query<{ folders: any[]; totalCount: number }, void>({
    query: () => "folders",
    transformResponse: (response: any) => {
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to fetch folders");
      }
      return response.data;
    },
    providesTags: (result) => [
      { type: "Folder", id: "LIST" },
      ...(result?.folders.map((folder) => ({
        type: "Folder" as const,
        id: folder.id,
      })) || []),
    ],
  }),

  createFolder: builder.mutation<any, { name: string; parentId?: string | null }>({
    query: (folderData) => ({
      url: "folders",
      method: "POST",
      body: folderData,
    }),
    transformResponse: (response: any) => {
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to create folder");
      }
      return response.data;
    },
    invalidatesTags: [{ type: "Folder", id: "LIST" }],
  }),

  updateFolder: builder.mutation<
    any,
    { id: string; updates: { name?: string; parentId?: string | null } }
  >({
    query: ({ id, updates }) => ({
      url: `folders/${id}`,
      method: "PUT",
      body: updates,
    }),
    transformResponse: (response: any) => {
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to update folder");
      }
      return response.data;
    },
    invalidatesTags: (_result, _error, { id }) => [
      { type: "Folder", id: "LIST" },
      { type: "Folder", id },
    ],
  }),

  deleteFolder: builder.mutation<
    void,
    { id: string; moveContentsTo?: string | null }
  >({
    query: ({ id, moveContentsTo }) => ({
      url: `folders/${id}${
        moveContentsTo ? `?moveContentsTo=${moveContentsTo}` : ""
      }`,
      method: "DELETE",
    }),
    invalidatesTags: (_result, _error, { id }) => [
      { type: "Folder", id: "LIST" },
      { type: "Folder", id },
      { type: "PDF", id: "LIST" },
    ],
  }),
});

