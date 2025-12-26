/**
 * Main types index document - exports all type definitions
 */

// Re-export all types from individual modules
export * from "./api";
export * from "./auth";
export * from "./dashboard";
export * from "./database";
export * from "./editor";
export * from "./document";
export * from "./theme";

// Re-export JSONContent from TipTap for convenience
export type { JSONContent } from "@tiptap/core";