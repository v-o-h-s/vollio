"use client";

import React from "react";
import {
  FileText,
  BookOpen,
  Zap,
  TrendingUp,
  Clock,
  Plus,
  Upload,
  AlertTriangle,
  RefreshCw,
  Edit3,
} from "lucide-react";
import { useGetPDFsQuery, useGetNotesQuery } from "@/lib/store/apiSlice";
import { useRouter } from "next/navigation";
import { RecentActivityDisplay } from "@/components/dashboard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppError } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useNoteSync } from "@/hooks/use-note-sync";

// Simple time formatting function
const formatTimeAgo = (date: string | Date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInMinutes = Math.floor(
    (now.getTime() - past.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return past.toLocaleDateString();
};

export default function DashboardPage() {
  const router = useRouter();

  // Fetch user's PDFs using RTK Query
  const {
    data: pdfData,
    isLoading: isLoadingPDFs,
    error: pdfError,
    refetch,
  } = useGetPDFsQuery();

  // Fetch user's notes
  const {
    data: notes = [],
    isLoading: isLoadingNotes,
    error: notesError,
  } = useGetNotesQuery({});

  const pdfs = pdfData?.pdfs || [];
  const recentActivity = pdfData?.recentActivity;
  const totalCount = pdfData?.totalCount || 0;

  // Cross-tab synchronization
  useNoteSync({
    enableAutoNavigation: false, // Don't auto-navigate from dashboard
    enableAutoUpdate: true,
  });

  const handleUploadClick = () => {
    // TODO: Create upload page or modal
    console.log("Upload functionality to be implemented");
  };

  const handlePDFClick = (pdfId: string) => {
    router.push(`/dashboard/pdf/${pdfId}`);
  };

  const handleCreateNote = () => {
    router.push("/dashboard/notes/new");
  };

  const handleViewNotes = () => {
    router.push("/dashboard/notes");
  };

  return (
    <ErrorBoundary context="DashboardPage">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-gray-600">
            Welcome back to your Noto workspace
          </p>
        </div>

        {/* Enhanced Error State */}
        {pdfError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-red-500 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-red-900 mb-1 text-sm">
                  Failed to Load Dashboard Data
                </h4>
                <p className="text-red-700 text-sm mb-3">
                  {(() => {
                    const appError = pdfError as AppError;
                    const message =
                      appError?.userMessage ||
                      "There was an error loading your dashboard. Please try again.";
                    return message;
                  })()}
                </p>

                <div className="flex gap-2">
                  <Button
                    onClick={() => window.location.reload()}
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 h-8"
                  >
                    <RefreshCw size={12} />
                    Refresh Page
                  </Button>

                  <Button
                    onClick={() => {
                      // Clear cache and refetch
                      window.location.href = "/dashboard";
                    }}
                    size="sm"
                    variant="outline"
                    className="h-8"
                  >
                    Clear Cache
                  </Button>
                </div>

                {/* Show technical details in development */}
                {process.env.NODE_ENV === "development" && (
                  <details className="mt-3">
                    <summary className="text-xs text-red-600 cursor-pointer">
                      Technical Details (Dev)
                    </summary>
                    <pre className="text-xs text-red-600 mt-2 p-2 bg-red-100 rounded overflow-auto max-h-32">
                      {JSON.stringify(pdfError, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="group bg-white border border-gray-200 p-4 rounded-xl hover:shadow-md hover:border-gray-300 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <FileText size={16} className="text-white" />
              </div>
              <div className="text-right">
                <div className="text-xl font-semibold text-gray-900">
                  {isLoadingPDFs ? "..." : totalCount}
                </div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
            </div>
            <h3 className="font-medium text-sm text-gray-900 mb-1">
              PDFs
            </h3>
            <p className="text-gray-600 text-xs">
              {isLoadingPDFs
                ? "Loading..."
                : totalCount === 0
                ? "No PDFs uploaded yet"
                : `${totalCount} PDF${totalCount === 1 ? "" : "s"} uploaded`}
            </p>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <button
                onClick={handleUploadClick}
                className="text-blue-600 text-xs font-medium hover:text-blue-700 transition-colors"
              >
                {totalCount === 0
                  ? "Upload your first PDF"
                  : "Upload another PDF"}{" "}
                →
              </button>
            </div>
          </div>

          <div className="group bg-white border border-gray-200 p-4 rounded-xl hover:shadow-md hover:border-gray-300 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <BookOpen size={16} className="text-white" />
              </div>
              <div className="text-right">
                <div className="text-xl font-semibold text-gray-900">
                  {isLoadingNotes ? "..." : notes.length}
                </div>
                <div className="text-xs text-gray-500">Created</div>
              </div>
            </div>
            <h3 className="font-medium text-sm text-gray-900 mb-1">
              Notes
            </h3>
            <p className="text-gray-600 text-xs">
              {isLoadingNotes
                ? "Loading..."
                : notes.length === 0
                ? "Start taking notes on your PDFs"
                : `${notes.length} note${notes.length === 1 ? "" : "s"} created`}
            </p>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <button 
                onClick={notes.length === 0 ? handleCreateNote : handleViewNotes}
                className="text-green-600 text-xs font-medium hover:text-green-700 transition-colors"
              >
                {notes.length === 0
                  ? "Create your first note"
                  : "View all notes"} →
              </button>
            </div>
          </div>

          <div className="group bg-white border border-gray-200 p-4 rounded-xl hover:shadow-md hover:border-gray-300 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <div className="text-right">
                <div className="text-xl font-semibold text-gray-900">0</div>
                <div className="text-xs text-gray-500">Actions</div>
              </div>
            </div>
            <h3 className="font-medium text-sm text-gray-900 mb-1">
              Quick Actions
            </h3>
            <p className="text-gray-600 text-xs">
              Streamline your workflow
            </p>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <button className="text-purple-600 text-xs font-medium hover:text-purple-700 transition-colors">
                Explore features →
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              Quick Actions
            </h2>
            <button className="text-blue-600 text-sm hover:text-blue-700 transition-colors">
              View all →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/30 p-4 rounded-xl border border-blue-200/40">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Plus size={14} className="text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-900">
                    Upload PDF
                  </h3>
                  <p className="text-blue-700 text-xs">
                    Start your productivity journey
                  </p>
                </div>
              </div>
              <button
                onClick={handleUploadClick}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
              >
                {totalCount === 0
                  ? "Upload Your First PDF"
                  : "Upload Another PDF"}
              </button>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100/30 p-4 rounded-xl border border-green-200/40">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center">
                  <Edit3 size={14} className="text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-900">
                    Create Note
                  </h3>
                  <p className="text-green-700 text-xs">
                    Rich text editor with PDF linking
                  </p>
                </div>
              </div>
              <button
                onClick={handleCreateNote}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
              >
                Create New Note
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              Recent Activity
            </h2>
          </div>
          <RecentActivityDisplay />
        </div>

        {/* Recent Notes Section */}
        {!isLoadingNotes && notes.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                Recent Notes
              </h2>
              <button
                onClick={handleViewNotes}
                className="text-green-600 text-sm hover:text-green-700 transition-colors"
              >
                View All Notes →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.slice(0, 6).map((note) => (
                <div
                  key={note.id}
                  onClick={() => router.push(`/dashboard/notes/${note.id}`)}
                  className="group bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Edit3 size={16} className="text-white" />
                  </div>

                  <div className="space-y-2 mb-3">
                    <h3 className="font-medium text-sm text-gray-900 truncate group-hover:text-green-600 transition-colors">
                      {note.title}
                    </h3>
                    <div className="text-xs text-gray-500 line-clamp-2">
                      {note.content?.content?.[0]?.content?.[0]?.text || "Empty note"}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{formatTimeAgo(note.updatedAt)}</span>
                      {note.pdfAnnotationId && (
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                          Linked to PDF
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <button className="flex items-center gap-2 text-green-600 text-xs hover:text-green-700 transition-colors">
                      <Edit3 size={12} />
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PDF List Section */}
        {!isLoadingPDFs && totalCount > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                Your PDFs
              </h2>
              <button
                onClick={handleUploadClick}
                className="text-blue-600 text-sm hover:text-blue-700 transition-colors"
              >
                Upload PDF →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pdfs.slice(0, 6).map((pdf) => (
                <div
                  key={pdf.id}
                  onClick={() => handlePDFClick(pdf.id)}
                  className="group bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <FileText size={16} className="text-white" />
                  </div>

                  <div className="space-y-2 mb-3">
                    <h3 className="font-medium text-sm text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                      {pdf.filename}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>
                        {(pdf.fileSize / (1024 * 1024)).toFixed(1)} MB
                      </span>
                      <span>{formatTimeAgo(pdf.uploadedAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <button className="flex items-center gap-2 text-blue-600 text-xs hover:text-blue-700 transition-colors">
                      <BookOpen size={12} />
                      Open
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
