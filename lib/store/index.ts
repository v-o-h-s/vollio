import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./apiSlice";

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types that may contain non-serializable data
        ignoredActions: [
          // RTK Query actions
          "api/executeQuery/pending",
          "api/executeQuery/fulfilled",
          "api/executeQuery/rejected",
          "api/executeMutation/pending",
          "api/executeMutation/fulfilled",
          "api/executeMutation/rejected",
          // Ignore all RTK Query internal actions
          "/^api//",
        ],
        // Ignore these field paths in all actions
        ignoredActionsPaths: [
          "payload.createdAt",
          "payload.updatedAt",
          "payload.uploadedAt",
          "payload.accessedAt",
          "meta.arg.originalArgs",
          "meta.baseQueryMeta",
          "meta.arg",
          "meta.requestId",
          "meta.requestStatus",
          "payload.meta",
          "error.meta",
        ],
        // Ignore these paths in the state
        ignoredPaths: [
          "api.queries",
          "api.mutations",
          "api.provided",
          "api.subscriptions",
          "api.config",
        ],
      },
    }).concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Re-export API slice and hooks for convenience
export { apiSlice } from "./apiSlice";
export * from "./hooks";
