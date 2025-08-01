import { configureStore } from "@reduxjs/toolkit";
import annotationReducer  from "./annotationSlice";

export const store = configureStore({
  reducer: {
    annotations: annotationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for Date objects
        ignoredActions: [
          "annotations/loadAnnotations",
          "annotations/createAnnotation",
          "annotations/updateAnnotation",
        ],
        // Ignore these field paths in all actions
        ignoredActionsPaths: [
          "payload.createdAt",
          "payload.updatedAt",
          "payload.uploadedAt",
        ],
        // Ignore these paths in the state
        ignoredPaths: ["annotations.annotations", "annotations.currentPdf"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
