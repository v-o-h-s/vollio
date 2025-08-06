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
        // Ignore these action types for Date objects
        ignoredActions: ["annotations/setPdfDocument"],
        // Ignore these field paths in all actions
        ignoredActionsPaths: [
          "payload.createdAt",
          "payload.updatedAt",
          "payload.uploadedAt",
        ],
        // Ignore these paths in the state
        ignoredPaths: ["annotations.currentPdf"],
      },
    }).concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
