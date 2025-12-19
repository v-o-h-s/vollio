"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useGetPDFsQuery } from "@/lib/store/apiSlice";
import { useGetNotesQuery } from "@/lib/store/apiSlice";

export interface PageStatistics {
  totalItems: number;
  recentItems: number;
  storageUsed: string;
  completionRate?: number;
  averageScore?: number;
  studyStreak?: number;
  loading: boolean;
  error?: string;
}

export function usePageStatistics(): PageStatistics {
  const pathname = usePathname();
  const [statistics, setStatistics] = useState<PageStatistics>({
    totalItems: 0,
    recentItems: 0,
    storageUsed: "0 MB",
    loading: true,
  });

  // API queries
  const { data: pdfData, isLoading: pdfsLoading, error: pdfsError } = useGetPDFsQuery();
  const { data: notes, isLoading: notesLoading, error: notesError } = useGetNotesQuery({});

  useEffect(() => {
    const basePath = pathname.split("/").slice(0, 3).join("/");
    
    const calculateStatistics = () => {
      switch (basePath) {
        case "/dashboard/pdfs":
          if (pdfData?.pdfs) {
            const pdfs = pdfData.pdfs;
            const totalFiles = pdfs.length;
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            
            const recentFiles = pdfs.filter(pdf => 
              new Date(pdf.uploadedAt) > oneWeekAgo
            ).length;
            
            const totalSize = pdfs.reduce((sum, pdf) => sum + (pdf.fileSize || 0), 0);
            const sizeInMB = (totalSize / (1024 * 1024)).toFixed(1);
            
            setStatistics({
              totalItems: totalFiles,
              recentItems: recentFiles,
              storageUsed: `${sizeInMB} MB`,
              loading: pdfsLoading,
              error: pdfsError ? "Failed to load PDF statistics" : undefined,
            });
          }
          break;

        case "/dashboard/notes":
          if (notes) {
            const totalNotes = notes.length;
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            
            const recentNotes = notes.filter(note => 
              new Date(note.createdAt) > oneWeekAgo
            ).length;
            
            // Estimate storage based on content length
            const totalChars = notes.reduce((sum, note) => 
              sum + (note.content?.length || 0) + (note.title?.length || 0), 0
            );
            const sizeInKB = (totalChars / 1024).toFixed(1);
            
            setStatistics({
              totalItems: totalNotes,
              recentItems: recentNotes,
              storageUsed: `${sizeInKB} KB`,
              loading: notesLoading,
              error: notesError ? "Failed to load notes statistics" : undefined,
            });
          }
          break;

        case "/dashboard/quizzes":
        case "/dashboard/knowledge-test":
          // Mock quiz statistics - replace with real API when available
          setStatistics({
            totalItems: 6, // From dummy data
            recentItems: 2,
            storageUsed: "1.2 MB",
            completionRate: 67,
            averageScore: 85,
            studyStreak: 7,
            loading: false,
          });
          break;

        case "/dashboard/flashcards":
          // Mock flashcards statistics - replace with real API when available
          setStatistics({
            totalItems: 4, // From dummy data
            recentItems: 1,
            storageUsed: "0.8 MB",
            completionRate: 75,
            averageScore: 82,
            studyStreak: 5,
            loading: false,
          });
          break;

        case "/dashboard/summarize":
          // Summarize statistics based on available documents
          if (pdfData?.pdfs) {
            const pdfs = pdfData.pdfs;
            const processedDocs = pdfs.filter(pdf => pdf.processingStatus === 'completed').length;
            
            setStatistics({
              totalItems: processedDocs,
              recentItems: Math.floor(processedDocs * 0.3), // Estimate recent summaries
              storageUsed: "0.5 MB", // Summaries are typically small
              loading: pdfsLoading,
              error: pdfsError ? "Failed to load document statistics" : undefined,
            });
          }
          break;

        case "/dashboard":
        default:
          // Dashboard overview statistics
          const pdfs = pdfData?.pdfs || [];
          const totalFiles = pdfs.length;
          const totalNotes = notes?.length || 0;
          const totalItems = totalFiles + totalNotes;
          
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          
          const recentFiles = pdfs.filter(pdf => 
            new Date(pdf.uploadedAt) > oneWeekAgo
          ).length;
          
          const recentNotes = notes?.filter(note => 
            new Date(note.createdAt) > oneWeekAgo
          ).length || 0;
          
          const totalFileSize = pdfs.reduce((sum, pdf) => sum + (pdf.fileSize || 0), 0);
          const totalNoteSize = notes?.reduce((sum, note) => 
            sum + (note.content?.length || 0) + (note.title?.length || 0), 0
          ) || 0;
          
          const totalSizeInMB = ((totalFileSize + totalNoteSize) / (1024 * 1024)).toFixed(1);
          
          setStatistics({
            totalItems,
            recentItems: recentFiles + recentNotes,
            storageUsed: `${totalSizeInMB} MB`,
            studyStreak: 7, // Mock data
            loading: pdfsLoading || notesLoading,
            error: (pdfsError || notesError) ? "Failed to load statistics" : undefined,
          });
          break;
      }
    };

    calculateStatistics();
  }, [pathname, pdfData, notes, pdfsLoading, notesLoading, pdfsError, notesError]);

  return statistics;
}