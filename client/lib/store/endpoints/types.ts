import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
} from "@reduxjs/toolkit/query";
import type { EndpointBuilder } from "@reduxjs/toolkit/query";

export type ApiTag =
  | "Annotation"
  | "Highlight"
  | "Flashcard"
  | "Note"
  | "Folder"
  | "Summary"
  | "GoogleClassroom"
  | "Document"
  | "Quiz";

export type ApiBuilder = EndpointBuilder<
  BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError,
    Record<string, unknown>,
    FetchBaseQueryMeta
  >,
  ApiTag,
  "api"
>;
