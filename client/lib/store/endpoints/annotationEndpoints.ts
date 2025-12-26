import type { Annotation } from "@/lib/types/document";
import type { ApiResponse } from "../types";
import type { ApiBuilder } from "./types";

export const annotationEndpoints = (builder: ApiBuilder) => ({
  getAnnotations: builder.query<Annotation[], string | void>({
    query: (documentId) => ({
      url: "annotations",
      params: documentId ? { documentId } : undefined,
    }),
    transformResponse: (response: ApiResponse<Annotation[]>) => {
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to fetch annotations");
      }
      return response.data;
    },
    providesTags: (result) => [
      { type: "Annotation", id: "LIST" },
      ...(result?.map((annotation) => ({
        type: "Annotation" as const,
        id: annotation.id,
      })) || []),
    ],
  }),

  createAnnotation: builder.mutation<
    Annotation,
    {
      documentId: string;
      noteId: string;
      selectedText: string;
      pageNumber: number;
      coordinates: { x: number; y: number; width: number; height: number };
      noteContent?: string;
    }
  >({
    query: (annotationData) => ({
      url: "annotations",
      method: "POST",
      body: annotationData,
    }),
    transformResponse: (response: ApiResponse<Annotation>) => {
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to create annotation");
      }
      return response.data;
    },
    invalidatesTags: [
      { type: "Annotation", id: "LIST" },
      { type: "Document", id: "LIST" },
    ],
  }),
});
