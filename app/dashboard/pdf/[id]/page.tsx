"use client";

/**
 * PDF Viewer Page
 *
 * Dynamic route for viewing individual PDFs with annotation functionality.
 * Uses the PDFAnnotationViewer component to handle PDF display and interactions.
 */

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetPDFQuery } from "@/lib/store/apiSlice";
import PDFAnnotationViewer from "@/components/pdf/PDFAnnotationViewer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, AlertCircle, RefreshCw } from "lucide-react";

export default function PDFViewerPage() {
  const params = useParams();
  const router = useRouter();
  const pdfId = params.id as string;

  // Fetch PDF data
  const {
    data: pdfDocument,
    error,
    isLoading,
    refetch,
  } = useGetPDFQuery(pdfId, {
    skip: !pdfId,
  });

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw
            size={48}
            className="text-blue-500 mx-auto mb-4 animate-spin"
          />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading PDF...
          </h2>
          <p className="text-gray-600">
            Please wait while we load your document
          </p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error || !pdfDocument) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            PDF Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The PDF you're looking for could not be found or you don't have
            permission to view it.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Button>
            <Button
              onClick={() => refetch()}
              className="flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-1 sm:gap-2 flex-shrink-0"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <FileText size={18} className="text-gray-500 flex-shrink-0" />
              <h1 className="text-sm sm:text-lg font-semibold text-gray-900 truncate">
                {pdfDocument.filename}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="h-[calc(100vh-57px)] sm:h-[calc(100vh-65px)] w-full overflow-hidden">
        <PDFAnnotationViewer
          pdfDocument={pdfDocument}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
