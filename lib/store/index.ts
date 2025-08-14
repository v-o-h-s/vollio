import { configureStore } from "@reduxjs/toolkit";
import annotationReducer from "./annotationSlice";
import { apiSlice } from "./apiSlice";

export const store = configureStore({
  reducer: {
    annotations: annotationReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types that may contain non-serializable data
        ignoredActions: [
          "annotations/setPdfDocument",
          "api/executeQuery/fulfilled",
          "api/executeMutation/fulfilled",
        ],
        // Ignore these field paths in all actions
        ignoredActionsPaths: [
          "payload.createdAt",
          "payload.updatedAt", 
          "payload.uploadedAt",
          "payload.accessedAt",
          "meta.arg.originalArgs",
          "meta.baseQueryMeta",
        ],
        // Ignore these paths in the state
        ignoredPaths: [
          "annotations.currentPdf",
          "api.queries",
          "api.mutations",
        ],
      },
    }).concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
