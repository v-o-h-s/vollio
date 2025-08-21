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
      <div className="space-y-8">
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-lg text-gray-600 font-medium">
            Welcome back to your Noto productivity workspace
          </p>
        </div>

        {/* Enhanced Error State */}
        {pdfError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-red-500 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-900 mb-1">
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
                    className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                  >
                    <RefreshCw size={14} />
                    Refresh Page
                  </Button>

                  <Button
                    onClick={() => {
                      // Clear cache and refetch
                      window.location.href = "/dashboard";
                    }}
                    size="sm"
                    variant="outline"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/60 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText size={24} className="text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {isLoadingPDFs ? "..." : totalCount}
                </div>
                <div className="text-xs text-gray-500 font-medium">Total</div>
              </div>
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-1">
              Recent PDFs
            </h3>
            <p className="text-gray-600 text-sm font-medium">
              {isLoadingPDFs
                ? "Loading..."
                : totalCount === 0
                ? "No PDFs uploaded yet"
                : `${totalCount} PDF${totalCount === 1 ? "" : "s"} uploaded`}
            </p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={handleUploadClick}
                className="text-blue-600 text-sm font-semibold hover:text-blue-700 transition-colors"
              >
                {totalCount === 0
                  ? "Upload your first PDF"
                  : "Upload another PDF"}{" "}
                →
              </button>
            </div>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/60 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen size={24} className="text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {isLoadingNotes ? "..." : notes.length}
                </div>
                <div className="text-xs text-gray-500 font-medium">Created</div>
              </div>
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-1">
              Notes Created
            </h3>
            <p className="text-gray-600 text-sm font-medium">
              {isLoadingNotes
                ? "Loading..."
                : notes.length === 0
                ? "Start taking notes on your PDFs"
                : `${notes.length} note${notes.length === 1 ? "" : "s"} created`}
            </p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button 
                onClick={notes.length === 0 ? handleCreateNote : handleViewNotes}
                className="text-green-600 text-sm font-semibold hover:text-green-700 transition-colors"
              >
                {notes.length === 0
                  ? "Create your first note"
                  : "View all notes"} →
              </button>
            </div>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/60 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Zap size={24} className="text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">0</div>
                <div className="text-xs text-gray-500 font-medium">Actions</div>
              </div>
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-1">
              Quick Actions
            </h3>
            <p className="text-gray-600 text-sm font-medium">
              Streamline your workflow
            </p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button className="text-purple-600 text-sm font-semibold hover:text-purple-700 transition-colors">
                Explore features →
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Quick Actions
            </h2>
            <button className="text-blue-600 text-sm font-semibold hover:text-blue-700 transition-colors">
              View all →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 rounded-2xl border border-blue-200/60">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Plus size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    Upload PDF
                  </h3>
                  <p className="text-blue-700 text-sm font-medium">
                    Start your productivity journey
                  </p>
                </div>
              </div>
              <button
                onClick={handleUploadClick}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-blue-500/25"
              >
                {totalCount === 0
                  ? "Upload Your First PDF"
                  : "Upload Another PDF"}
              </button>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-6 rounded-2xl border border-green-200/60">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                  <Edit3 size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    Create Note
                  </h3>
                  <p className="text-green-700 text-sm font-medium">
                    Rich text editor with PDF linking
                  </p>
                </div>
              </div>
              <button
                onClick={handleCreateNote}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-green-500/25"
              >
                Create New Note
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Recent Activity
            </h2>
          </div>
          <RecentActivityDisplay />
        </div>

        {/* Recent Notes Section */}
        {!isLoadingNotes && notes.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                Recent Notes
              </h2>
              <button
                onClick={handleViewNotes}
                className="text-green-600 text-sm font-semibold hover:text-green-700 transition-colors"
              >
                View All Notes →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.slice(0, 6).map((note) => (
                <div
                  key={note.id}
                  onClick={() => router.push(`/dashboard/notes/${note.id}`)}
                  className="group bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:shadow-green-500/10 hover:border-green-200 transition-all duration-300 cursor-pointer"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Edit3 size={24} className="text-white" />
                  </div>

                  <div className="space-y-2 mb-4">
                    <h3 className="font-bold text-lg text-gray-900 truncate group-hover:text-green-600 transition-colors">
                      {note.title}
                    </h3>
                    <div className="text-sm text-gray-500 line-clamp-2">
                      {note.content?.content?.[0]?.content?.[0]?.text || "Empty note"}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{formatTimeAgo(note.updatedAt)}</span>
                      {note.pdfAnnotationId && (
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                          Linked to PDF
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <button className="flex items-center gap-2 text-green-600 text-sm font-semibold hover:text-green-700 transition-colors">
                      <Edit3 size={16} />
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
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                Your PDFs
              </h2>
              <button
                onClick={handleUploadClick}
                className="text-blue-600 text-sm font-semibold hover:text-blue-700 transition-colors"
              >
                Upload PDF →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pdfs.slice(0, 6).map((pdf) => (
                <div
                  key={pdf.id}
                  onClick={() => handlePDFClick(pdf.id)}
                  className="group bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-200 transition-all duration-300 cursor-pointer"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <FileText size={24} className="text-white" />
                  </div>

                  <div className="space-y-2 mb-4">
                    <h3 className="font-bold text-lg text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                      {pdf.filename}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>
                        {(pdf.fileSize / (1024 * 1024)).toFixed(1)} MB
                      </span>
                      <span>{formatTimeAgo(pdf.uploadedAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <button className="flex items-center gap-2 text-blue-600 text-sm font-semibold hover:text-blue-700 transition-colors">
                      <BookOpen size={16} />
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
