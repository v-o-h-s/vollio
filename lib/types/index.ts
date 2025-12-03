/**
 * Main types index file - exports all type definitions
 */

// Re-export all types from individual modules
export * from "./api";
export * from "./auth";
export * from "./dashboard";
export * from "./database";
export * from "./document-processing";
export * from "./editor";
export * from "../error-handling/errors";
export * from "./pdf";
export * from "./theme";

// Re-export JSONContent from TipTap for convenience
export type { JSONContent } from "@tiptap/core";
