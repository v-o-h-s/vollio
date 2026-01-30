"use client";

import dynamic from "next/dynamic";
import { DirectorySkeleton } from "./DirectorySkeleton";
import React from "react";

const DocumentsDirectoryViewer = dynamic(
  () => import("./DocumentsDirectoryViewer"),
  {
    ssr: false,
    loading: () => <DirectorySkeleton />,
  }
);

export default function DocumentsDirectoryViewerWrapper() {
  return <DocumentsDirectoryViewer />;
}
