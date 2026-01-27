"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useGetAllDocumentsQuery } from "@/lib/store/apiSlice";
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
  const { data: documents, isLoading: documentsLoading, error: documentsError } = useGetAllDocumentsQuery();
  const { data: notes, isLoading: notesLoading, error: notesError } = useGetNotesQuery({});

  useEffect(() => {
    const basePath = pathname.split("/").slice(0, 3).join("/");
    
    const calculateStatistics = () => {
      switch (basePath) {
        case "/documents":
          if (documents) {
            const totalDocuments = documents.length;
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            
            const recentDocuments = documents.filter(document => 
              document.uploadedAt && new Date(document.uploadedAt) > oneWeekAgo
            ).length;
            
            const totalSize = documents.reduce((sum, document) => sum + (document.size || 0), 0);
            const sizeInMB = (totalSize / (1024 * 1024)).toFixed(1);
            
            setStatistics({
              totalItems: totalDocuments,
              recentItems: recentDocuments,
              storageUsed: `${sizeInMB} MB`,
              loading: documentsLoading,
              error: documentsError ? "Failed to load Document statistics" : undefined,
            });
          }
          break;

        case "/notes":
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

        case "/quizzes":
        case "/knowledge-test":
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

        case "/flashcards":
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

        case "/summarize":
          // Summarize statistics based on available documents
          if (documents) {
            const processedDocs = documents.length; // All documents can be summarized
            
            setStatistics({
              totalItems: processedDocs,
              recentItems: Math.floor(processedDocs * 0.3), // Estimate recent summaries
              storageUsed: "0.5 MB", // Summaries are typically small
              loading: documentsLoading,
              error: documentsError ? "Failed to load document statistics" : undefined,
            });
          }
          break;

        case "/":
        default:
          // Dashboard overview statistics
          const allDocuments = documents || [];
          const totalDocuments = allDocuments.length;
          const totalNotes = notes?.length || 0;
          const totalItems = totalDocuments + totalNotes;
          
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          
          const recentDocuments = allDocuments.filter(document => 
            document.uploadedAt && new Date(document.uploadedAt) > oneWeekAgo
          ).length;
          
          const recentNotes = notes?.filter(note => 
            new Date(note.createdAt) > oneWeekAgo
          ).length || 0;
          
          const totalDocumentSize = allDocuments.reduce((sum, document) => sum + (document.size || 0), 0);
          const totalNoteSize = notes?.reduce((sum, note) => 
            sum + (note.content?.length || 0) + (note.title?.length || 0), 0
          ) || 0;
          
          const totalSizeInMB = ((totalDocumentSize + totalNoteSize) / (1024 * 1024)).toFixed(1);
          
          setStatistics({
            totalItems,
            recentItems: recentDocuments + recentNotes,
            storageUsed: `${totalSizeInMB} MB`,
            studyStreak: 7, // Mock data
            loading: documentsLoading || notesLoading,
            error: (documentsError || notesError) ? "Failed to load statistics" : undefined,
          });
          break;
      }
    };

    calculateStatistics();
  }, [pathname, documents, notes, documentsLoading, notesLoading, documentsError, notesError]);

  return statistics;
}