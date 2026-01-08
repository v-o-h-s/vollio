import { ApiBuilder } from "@/lib/store/endpoints/types";
import { GetAllFoldersResponse } from "@vollio/shared";
import { ServerErrorResponse } from "@vollio/shared";
import { apiSlice } from "../apiSlice";

interface TransformedFolder {
  id: string;
  user_id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  document_count?: number;
}

interface FolderQueryResponse {
  folders: TransformedFolder[];
  count: number;
}

export const folderEndpoints = (builder: ApiBuilder) => ({
  getAllFolders: builder.query<FolderQueryResponse, void>({
    query: () => ({
      url: "folders/",
      method: "GET",
    }),
    transformResponse: (response: GetAllFoldersResponse) => {
      if (!response.data) return { folders: [], count: 0 };

      const count = response.data.totalCount;
      const folders = response.data.folders.map((folder) => ({
        id: folder.id,
        user_id: folder.user_id,
        name: folder.name,
        parent_id: folder.parent_id,
        created_at: folder.created_at,
        updated_at: folder.updated_at,
        document_count: folder.document_count,
      }));
      return { folders, count };
    },

    providesTags: ["Folder"],
  }),

  getFolderById: builder.query<TransformedFolder, string>({
    query: (id) => ({
      url: `folders/${id}`,
      method: "GET",
    }),
    transformResponse: (response: any) => {
      if (!response.data) throw new Error("Folder not found");
      const folder = response.data;
      return {
        id: folder.id,
        user_id: folder.user_id,
        name: folder.name,
        parent_id: folder.parent_id,
        created_at: folder.created_at,
        updated_at: folder.updated_at,
        document_count: folder.document_count,
      };
    },
    providesTags: (_result, _error, id) => [{ type: "Folder", id }],
  }),

  createFolder: builder.mutation<
    TransformedFolder,
    { name: string; parentId?: string | null }
  >({
    query: (data) => ({
      url: "folders/",
      method: "POST",
      body: data,
    }),
    async onQueryStarted(newFolder, { dispatch, queryFulfilled }) {
      const tempId = "temp-" + Date.now();
      const patchResult = dispatch(
        apiSlice.util.updateQueryData(
          "getAllFolders" as any,
          undefined,
          (draft: any) => {
            draft.folders.unshift({
              id: tempId,
              name: newFolder.name,
              parent_id: newFolder.parentId ?? null,
              user_id: "", // Temporary placeholder
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              document_count: 0,
            });
            draft.count += 1;
          }
        )
      );
      try {
        const { data: createdFolder } = await queryFulfilled;
        dispatch(
          apiSlice.util.updateQueryData(
            "getAllFolders" as any,
            undefined,
            (draft: any) => {
              const index = draft.folders.findIndex(
                (f: any) => f.id === tempId
              );
              if (index !== -1) {
                draft.folders[index] = createdFolder;
              }
            }
          )
        );
      } catch {
        patchResult.undo();
      }
    },
    invalidatesTags: ["Folder"],
  }),

  updateFolder: builder.mutation<
    TransformedFolder,
    { id: string; name?: string; parentId?: string | null }
  >({
    query: ({ id, ...data }) => ({
      url: `folders/${id}`,
      method: "PUT",
      body: data,
    }),
    async onQueryStarted({ id, ...updates }, { dispatch, queryFulfilled }) {
      const patchResultList = dispatch(
        apiSlice.util.updateQueryData(
          "getAllFolders" as any,
          undefined,
          (draft: any) => {
            const folder = draft.folders.find((f: any) => f.id === id);
            if (folder) {
              if (updates.name !== undefined) folder.name = updates.name;
              if (updates.parentId !== undefined)
                folder.parent_id = updates.parentId;
            }
          }
        )
      );
      const patchResultDetail = dispatch(
        apiSlice.util.updateQueryData(
          "getFolderById" as any,
          id,
          (draft: any) => {
            if (updates.name !== undefined) draft.name = updates.name;
            if (updates.parentId !== undefined)
              draft.parent_id = updates.parentId;
          }
        )
      );
      try {
        const { data: updatedFolder } = await queryFulfilled;
        // Update with full server data (ensure timestamps are correct)
        dispatch(
          apiSlice.util.updateQueryData(
            "getAllFolders" as any,
            undefined,
            (draft: any) => {
              const index = draft.folders.findIndex((f: any) => f.id === id);
              if (index !== -1) {
                draft.folders[index] = updatedFolder;
              }
            }
          )
        );
        dispatch(
          apiSlice.util.updateQueryData(
            "getFolderById" as any,
            id,
            (draft: any) => {
              Object.assign(draft, updatedFolder);
            }
          )
        );
      } catch {
        patchResultList.undo();
        patchResultDetail.undo();
      }
    },
    transformResponse: (response: any) => {
      if (!response.data) throw new Error("Failed to update folder");
      const folder = response.data;
      return {
        id: folder.id,
        user_id: folder.user_id,
        name: folder.name,
        parent_id: folder.parent_id,
        created_at: folder.created_at,
        updated_at: folder.updated_at,
      };
    },
    invalidatesTags: (_result, _error, { id }) => [
      { type: "Folder", id: "LIST" },
      { type: "Folder", id },
    ],
  }),

  deleteFolder: builder.mutation<
    { success: boolean },
    { id: string; cascade?: boolean }
  >({
    query: ({ id, cascade }) => ({
      url: `folders/${id}${cascade !== undefined ? `?cascade=${cascade}` : ""}`,
      method: "DELETE",
      body: undefined,
      headers: {
        "Content-Type": undefined,
      },
    }),
    async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
      const patchResult = dispatch(
        apiSlice.util.updateQueryData(
          "getAllFolders" as any,
          undefined,
          (draft: any) => {
            const index = draft.folders.findIndex((f: any) => f.id === id);
            if (index !== -1) {
              draft.folders.splice(index, 1);
              draft.count -= 1;
            }
          }
        )
      );
      try {
        await queryFulfilled;
      } catch {
        patchResult.undo();
      }
    },
    invalidatesTags: (_result, _error, { id }) => [
      { type: "Folder", id: "LIST" },
      { type: "Folder", id },
      { type: "Document", id: "LIST" },
    ],
  }),
});
