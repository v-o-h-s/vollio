import { ApiBuilder } from "./types";
import { transformRTKQueryError } from "@/lib/utils/rtk-error-transform";
import {
  GetHighlightsResponse,
  CreateHighlightResponse,
  UpdateHighlightResponse,
  DeleteHighlightResponse,
  HighlightData,
} from "@vollio/shared";
import { CreateHighlightDTO, UpdateHighlightDTO } from "@vollio/shared";
import { ServerSuccessResponse } from "@vollio/shared";
import { apiSlice } from "../apiSlice";

export const highlightEndpoints = (builder: ApiBuilder) => ({
  getHighlights: builder.query<HighlightData[], void>({
    query: () => "highlights/",
    transformResponse: (response: GetHighlightsResponse) => response.data || [],
    providesTags: (result) =>
      result
        ? [
            ...result.map(({ id }) => ({ type: "Highlight" as const, id })),
            { type: "Highlight", id: "LIST" },
          ]
        : [{ type: "Highlight", id: "LIST" }],
    transformErrorResponse: (response) =>
      transformRTKQueryError(response, { context: "loading highlights" }),
  }),

  getDocumentHighlights: builder.query<HighlightData[], string>({
    query: (documentId) => `highlights?documentId=${documentId}`,
    transformResponse: (response: GetHighlightsResponse) => response.data || [],
    providesTags: (result) =>
      result
        ? [
            ...result.map(({ id }) => ({ type: "Highlight" as const, id })),
            { type: "Highlight", id: "LIST" },
          ]
        : [{ type: "Highlight", id: "LIST" }],
    transformErrorResponse: (response) =>
      transformRTKQueryError(response, {
        context: "loading document highlights",
      }),
  }),

  createHighlight: builder.mutation<HighlightData, CreateHighlightDTO>({
    query: (highlight) => ({
      url: "highlights/",
      method: "POST",
      body: highlight,
    }),
    async onQueryStarted(highlight, { dispatch, queryFulfilled }) {
      const newHighlight: HighlightData = {
        ...highlight,
        userId: "", // Will be filled by server, or we can omit/mock
        type: highlight.type || "text",
        hasNote: highlight.hasNote || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        position: {
          ...highlight.position,
          rects: highlight.position.rects.map((r) => ({ ...r })),
          boundingRect: { ...highlight.position.boundingRect },
        },
      };

      const patchResultGlobal = dispatch(
        apiSlice.util.updateQueryData(
          "getHighlights" as any,
          undefined,
          (draft: any) => {
            draft.push(newHighlight);
          },
        ),
      );

      const patchResultDoc = dispatch(
        apiSlice.util.updateQueryData(
          "getDocumentHighlights" as any,
          highlight.documentId,
          (draft: any) => {
            draft.push(newHighlight);
          },
        ),
      );

      try {
        const { data: createdHighlight } = await queryFulfilled;
        // Success: sync with server data
        dispatch(
          apiSlice.util.updateQueryData(
            "getHighlights" as any,
            undefined,
            (draft: any) => {
              const index = draft.findIndex((h: any) => h.id === highlight.id);
              if (index !== -1) draft[index] = createdHighlight;
            },
          ),
        );
        dispatch(
          apiSlice.util.updateQueryData(
            "getDocumentHighlights" as any,
            highlight.documentId,
            (draft: any) => {
              const index = draft.findIndex((h: any) => h.id === highlight.id);
              if (index !== -1) draft[index] = createdHighlight;
            },
          ),
        );
      } catch {
        patchResultGlobal.undo();
        patchResultDoc.undo();
      }
    },
    transformResponse: (response: CreateHighlightResponse) => {
      if (!response.data) {
        throw new Error("Failed to create highlight: No data returned");
      }
      return response.data;
    },
    transformErrorResponse: (response) =>
      transformRTKQueryError(response, { context: "creating highlight" }),
    invalidatesTags: [{ type: "Highlight", id: "LIST" }],
  }),

  updateHighlight: builder.mutation<
    HighlightData,
    { id: string; highlight: UpdateHighlightDTO }
  >({
    query: ({ id, highlight }) => ({
      url: `highlights/${id}`,
      method: "PATCH",
      body: highlight,
    }),
    async onQueryStarted({ id, highlight }, { dispatch, queryFulfilled }) {
      const updateCache = (draft: any) => {
        const index = draft.findIndex((h: any) => h.id === id);
        if (index !== -1) {
          const item = draft[index];
          if (highlight.color !== undefined) item.color = highlight.color;
          if (highlight.content !== undefined) item.content = highlight.content;
          if (highlight.hasNote !== undefined) item.hasNote = highlight.hasNote;
          if (highlight.noteId !== undefined) item.noteId = highlight.noteId;
          if (highlight.noteContent !== undefined)
            item.noteContent = highlight.noteContent;
          if (highlight.position !== undefined)
            item.position = highlight.position as any;
          if (highlight.type !== undefined) item.type = highlight.type;
          if (highlight.tags !== undefined) item.tags = highlight.tags;
          if (highlight.style !== undefined) item.style = highlight.style;
          item.updatedAt = new Date().toISOString();
        }
      };

      const patchResultGlobal = dispatch(
        apiSlice.util.updateQueryData(
          "getHighlights" as any,
          undefined,
          updateCache,
        ),
      );

      let patchResultDoc: any = null;
      if (highlight.documentId) {
        patchResultDoc = dispatch(
          apiSlice.util.updateQueryData(
            "getDocumentHighlights" as any,
            highlight.documentId,
            updateCache,
          ),
        );
      }

      try {
        const { data: updatedHighlight } = await queryFulfilled;
        // Success: sync with server data
        dispatch(
          apiSlice.util.updateQueryData(
            "getHighlights" as any,
            undefined,
            (draft: any) => {
              const index = draft.findIndex((h: any) => h.id === id);
              if (index !== -1) draft[index] = updatedHighlight;
            },
          ),
        );
        if (highlight.documentId || updatedHighlight.documentId) {
          const docId = highlight.documentId || updatedHighlight.documentId;
          dispatch(
            apiSlice.util.updateQueryData(
              "getDocumentHighlights" as any,
              docId,
              (draft: any) => {
                const index = draft.findIndex((h: any) => h.id === id);
                if (index !== -1) draft[index] = updatedHighlight;
              },
            ),
          );
        }
      } catch {
        patchResultGlobal.undo();
        if (patchResultDoc) patchResultDoc.undo();
      }
    },
    transformResponse: (response: UpdateHighlightResponse) => {
      if (!response.data) {
        throw new Error("Failed to update highlight: No data returned");
      }
      return response.data;
    },
    transformErrorResponse: (response) =>
      transformRTKQueryError(response, { context: "updating highlight" }),
    invalidatesTags: (_result, _error, { id }) => [
      { type: "Highlight", id },
      { type: "Highlight", id: "LIST" },
    ],
  }),

  deleteHighlight: builder.mutation<null, string>({
    query: (id) => ({
      url: `highlights/${id}`,
      method: "DELETE",
    }),
    async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
      // For delete, we might not know the documentId directly from the argument.
      // We'll remove it from the global cache, and we can try to find it to know which doc cache to update.
      const state = getState() as any;
      const globalHighlights = state.api.queries["getHighlights(undefined)"]
        ?.data as HighlightData[];
      const highlightToDelete = globalHighlights?.find((h) => h.id === id);
      const documentId = highlightToDelete?.documentId;

      const patchResultGlobal = dispatch(
        apiSlice.util.updateQueryData(
          "getHighlights" as any,
          undefined,
          (draft: any) => {
            const index = draft.findIndex((h: any) => h.id === id);
            if (index !== -1) draft.splice(index, 1);
          },
        ),
      );

      let patchResultDoc: any = null;
      if (documentId) {
        patchResultDoc = dispatch(
          apiSlice.util.updateQueryData(
            "getDocumentHighlights" as any,
            documentId,
            (draft: any) => {
              const index = draft.findIndex((h: any) => h.id === id);
              if (index !== -1) draft.splice(index, 1);
            },
          ),
        );
      }

      try {
        await queryFulfilled;
      } catch {
        patchResultGlobal.undo();
        if (patchResultDoc) patchResultDoc.undo();
      }
    },
    transformResponse: (response: DeleteHighlightResponse) => response.data,
    transformErrorResponse: (response) =>
      transformRTKQueryError(response, { context: "deleting highlight" }),
    invalidatesTags: (_result, _error, id) => [
      { type: "Highlight", id },
      { type: "Highlight", id: "LIST" },
    ],
  }),

  countHighlightsByTag: builder.query<{ count: number }, string>({
    query: (tagName) => `highlights/tags/${encodeURIComponent(tagName)}/count`,
    transformResponse: (response: ServerSuccessResponse<{ count: number }>) =>
      response.data || { count: 0 },
  }),

  deleteHighlightsByTag: builder.mutation<null, string>({
    query: (tagName) => ({
      url: `highlights/tags/${encodeURIComponent(tagName)}`,
      method: "DELETE",
    }),
    transformResponse: (response: ServerSuccessResponse<null>) => response.data,
    transformErrorResponse: (response) =>
      transformRTKQueryError(response, {
        context: "deleting highlights by tag",
      }),
    invalidatesTags: [{ type: "Highlight", id: "LIST" }],
  }),
});
