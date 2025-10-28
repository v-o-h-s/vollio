import { useEffect, useCallback } from 'react';

/**
 * Hook to integrate with FloatingSidebar events
 * Allows pages to listen for and respond to sidebar action triggers
 */
export function useFloatingSidebar() {
  // PDF page event handlers
  const onUploadPDF = useCallback((handler: () => void) => {
    const handleEvent = () => handler();
    window.addEventListener('trigger-pdf-upload', handleEvent);
    return () => window.removeEventListener('trigger-pdf-upload', handleEvent);
  }, []);

  const onCreateFolder = useCallback((handler: () => void) => {
    const handleEvent = () => handler();
    window.addEventListener('trigger-folder-create', handleEvent);
    return () => window.removeEventListener('trigger-folder-create', handleEvent);
  }, []);

  const onSearchFiles = useCallback((handler: () => void) => {
    const handleEvent = () => handler();
    window.addEventListener('trigger-file-search', handleEvent);
    return () => window.removeEventListener('trigger-file-search', handleEvent);
  }, []);

  const onFilterFiles = useCallback((handler: () => void) => {
    const handleEvent = () => handler();
    window.addEventListener('trigger-file-filter', handleEvent);
    return () => window.removeEventListener('trigger-file-filter', handleEvent);
  }, []);

  const onToggleView = useCallback((handler: () => void) => {
    const handleEvent = () => handler();
    window.addEventListener('trigger-view-toggle', handleEvent);
    return () => window.removeEventListener('trigger-view-toggle', handleEvent);
  }, []);

  // Notes page event handlers
  const onSearchNotes = useCallback((handler: () => void) => {
    const handleEvent = () => handler();
    window.addEventListener('trigger-notes-search', handleEvent);
    return () => window.removeEventListener('trigger-notes-search', handleEvent);
  }, []);

  const onFilterNotes = useCallback((handler: () => void) => {
    const handleEvent = () => handler();
    window.addEventListener('trigger-notes-filter', handleEvent);
    return () => window.removeEventListener('trigger-notes-filter', handleEvent);
  }, []);

  const onSortNotes = useCallback((handler: () => void) => {
    const handleEvent = () => handler();
    window.addEventListener('trigger-notes-sort', handleEvent);
    return () => window.removeEventListener('trigger-notes-sort', handleEvent);
  }, []);

  const onToggleNotesView = useCallback((handler: () => void) => {
    const handleEvent = () => handler();
    window.addEventListener('trigger-notes-view-toggle', handleEvent);
    return () => window.removeEventListener('trigger-notes-view-toggle', handleEvent);
  }, []);

  const onFilterStarred = useCallback((handler: () => void) => {
    const handleEvent = () => handler();
    window.addEventListener('trigger-starred-filter', handleEvent);
    return () => window.removeEventListener('trigger-starred-filter', handleEvent);
  }, []);

  // Quiz page event handlers
  const onSearchQuizzes = useCallback((handler: () => void) => {
    const handleEvent = () => handler();
    window.addEventListener('trigger-quiz-search', handleEvent);
    return () => window.removeEventListener('trigger-quiz-search', handleEvent);
  }, []);

  const onFilterCategory = useCallback((handler: () => void) => {
    const handleEvent = () => handler();
    window.addEventListener('trigger-category-filter', handleEvent);
    return () => window.removeEventListener('trigger-category-filter', handleEvent);
  }, []);

  const onFilterDifficulty = useCallback((handler: () => void) => {
    const handleEvent = () => handler();
    window.addEventListener('trigger-difficulty-filter', handleEvent);
    return () => window.removeEventListener('trigger-difficulty-filter', handleEvent);
  }, []);

  const onFilterBookmarked = useCallback((handler: () => void) => {
    const handleEvent = () => handler();
    window.addEventListener('trigger-bookmark-filter', handleEvent);
    return () => window.removeEventListener('trigger-bookmark-filter', handleEvent);
  }, []);

  const onShowQuizStats = useCallback((handler: () => void) => {
    const handleEvent = () => handler();
    window.addEventListener('trigger-quiz-stats', handleEvent);
    return () => window.removeEventListener('trigger-quiz-stats', handleEvent);
  }, []);

  // Flashcard page event handlers
  const onSearchFlashcards = useCallback((handler: () => void) => {
    const handleEvent = () => handler();
    window.addEventListener('trigger-flashcard-search', handleEvent);
    return () => window.removeEventListener('trigger-flashcard-search', handleEvent);
  }, []);

  const onShowDueCards = useCallback((handler: () => void) => {
    const handleEvent = () => handler();
    window.addEventListener('trigger-due-cards', handleEvent);
    return () => window.removeEventListener('trigger-due-cards', handleEvent);
  }, []);

  // Utility function to register multiple handlers at once
  const registerHandlers = useCallback((handlers: Record<string, () => void>) => {
    const cleanupFunctions: (() => void)[] = [];

    Object.entries(handlers).forEach(([eventType, handler]) => {
      const cleanup = (() => {
        switch (eventType) {
          case 'uploadPDF': return onUploadPDF(handler);
          case 'createFolder': return onCreateFolder(handler);
          case 'searchFiles': return onSearchFiles(handler);
          case 'filterFiles': return onFilterFiles(handler);
          case 'toggleView': return onToggleView(handler);
          case 'searchNotes': return onSearchNotes(handler);
          case 'filterNotes': return onFilterNotes(handler);
          case 'sortNotes': return onSortNotes(handler);
          case 'toggleNotesView': return onToggleNotesView(handler);
          case 'filterStarred': return onFilterStarred(handler);
          case 'searchQuizzes': return onSearchQuizzes(handler);
          case 'filterCategory': return onFilterCategory(handler);
          case 'filterDifficulty': return onFilterDifficulty(handler);
          case 'filterBookmarked': return onFilterBookmarked(handler);
          case 'showQuizStats': return onShowQuizStats(handler);
          case 'searchFlashcards': return onSearchFlashcards(handler);
          case 'showDueCards': return onShowDueCards(handler);
          default: return () => {};
        }
      })();
      
      if (cleanup) {
        cleanupFunctions.push(cleanup);
      }
    });

    // Return cleanup function that removes all listeners
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [
    onUploadPDF, onCreateFolder, onSearchFiles, onFilterFiles, onToggleView,
    onSearchNotes, onFilterNotes, onSortNotes, onToggleNotesView, onFilterStarred,
    onSearchQuizzes, onFilterCategory, onFilterDifficulty, onFilterBookmarked, onShowQuizStats,
    onSearchFlashcards, onShowDueCards
  ]);

  return {
    // PDF page handlers
    onUploadPDF,
    onCreateFolder,
    onSearchFiles,
    onFilterFiles,
    onToggleView,
    
    // Notes page handlers
    onSearchNotes,
    onFilterNotes,
    onSortNotes,
    onToggleNotesView,
    onFilterStarred,
    
    // Quiz page handlers
    onSearchQuizzes,
    onFilterCategory,
    onFilterDifficulty,
    onFilterBookmarked,
    onShowQuizStats,
    
    // Flashcard page handlers
    onSearchFlashcards,
    onShowDueCards,
    
    // Utility
    registerHandlers,
  };
}

/**
 * Hook for pages to easily integrate with floating sidebar
 * Usage example:
 * 
 * const { registerHandlers } = useFloatingSidebar();
 * 
 * useEffect(() => {
 *   return registerHandlers({
 *     uploadPDF: () => setShowUploadDialog(true),
 *     searchFiles: () => focusSearchInput(),
 *     filterFiles: () => setShowFilters(true),
 *   });
 * }, []);
 */
export function useFloatingSidebarIntegration(handlers: Record<string, () => void>) {
  const { registerHandlers } = useFloatingSidebar();

  useEffect(() => {
    return registerHandlers(handlers);
  }, [registerHandlers, handlers]);
}