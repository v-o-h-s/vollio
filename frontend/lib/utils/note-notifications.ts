/**
 * Toast notification utilities for note operations
 */

import toast from "react-hot-toast";

export const noteNotifications = {
  /**
   * Show success notification for note creation
   */
  createSuccess: (noteTitle: string) => {
    toast.success(`Note "${noteTitle}" created successfully`, {
      duration: 3000,
      icon: "📝",
    });
  },

  /**
   * Show error notification for note creation
   */
  createError: (message?: string) => {
    toast.error(message || "Failed to create note. Please try again.", {
      duration: 4000,
      icon: "❌",
    });
  },

  /**
   * Show success notification for note update
   */
  updateSuccess: (noteTitle: string) => {
    toast.success(`Note "${noteTitle}" saved successfully`, {
      duration: 2000,
      icon: "💾",
    });
  },

  /**
   * Show error notification for note update
   */
  updateError: (message?: string) => {
    toast.error(message || "Failed to save note. Please try again.", {
      duration: 4000,
      icon: "❌",
    });
  },

  /**
   * Show success notification for note deletion
   */
  deleteSuccess: (noteTitle: string) => {
    toast.success(`Note "${noteTitle}" deleted successfully`, {
      duration: 3000,
      icon: "🗑️",
    });
  },

  /**
   * Show error notification for note deletion
   */
  deleteError: (message?: string) => {
    toast.error(message || "Failed to delete note. Please try again.", {
      duration: 4000,
      icon: "❌",
    });
  },

  /**
   * Show auto-save success notification
   */
  autoSaveSuccess: () => {
    toast.success("Auto-saved", {
      duration: 1500,
      icon: "💾",
      position: "bottom-right",
    });
  },

  /**
   * Show auto-save error notification
   */
  autoSaveError: () => {
    toast.error("Auto-save failed", {
      duration: 3000,
      icon: "⚠️",
      position: "bottom-right",
    });
  },

  /**
   * Show sync notification when receiving updates from other tabs
   */
  syncUpdate: (noteTitle: string) => {
    toast(`Note "${noteTitle}" updated in another tab`, {
      duration: 2000,
      icon: "🔄",
      position: "bottom-left",
    });
  },

  /**
   * Show loading notification for long operations
   */
  loading: (message: string) => {
    return toast.loading(message, {
      duration: Infinity,
    });
  },

  /**
   * Dismiss a loading notification
   */
  dismiss: (toastId: string) => {
    toast.dismiss(toastId);
  },

  /**
   * Show offline notification
   */
  offline: () => {
    toast.error("You're offline. Changes will be saved when connection is restored.", {
      duration: 5000,
      icon: "📡",
    });
  },

  /**
   * Show online notification
   */
  online: () => {
    toast.success("Connection restored. Syncing changes...", {
      duration: 3000,
      icon: "📡",
    });
  },
};