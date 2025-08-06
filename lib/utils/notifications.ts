import toast from "react-hot-toast";
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export interface NotificationOptions {
  duration?: number;
  position?:
    | "top-left"
    | "top-center"
    | "top-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Success notifications
export const showSuccess = (
  message: string,
  options: NotificationOptions = {}
) => {
  return toast.success(message, {
    duration: options.duration || 4000,
    position: options.position || "top-right",
    style: {
      background: "#10B981",
      color: "#FFFFFF",
      borderRadius: "8px",
      padding: "12px 16px",
      fontSize: "14px",
      fontWeight: "500",
    },
    iconTheme: {
      primary: "#FFFFFF",
      secondary: "#10B981",
    },
  });
};

// Error notifications
export const showError = (
  message: string,
  options: NotificationOptions = {}
) => {
  return toast.error(message, {
    duration: options.duration || 6000,
    position: options.position || "top-right",
    style: {
      background: "#EF4444",
      color: "#FFFFFF",
      borderRadius: "8px",
      padding: "12px 16px",
      fontSize: "14px",
      fontWeight: "500",
    },
    iconTheme: {
      primary: "#FFFFFF",
      secondary: "#EF4444",
    },
  });
};

// Warning notifications
export const showWarning = (
  message: string,
  options: NotificationOptions = {}
) => {
  return toast(message, {
    duration: options.duration || 5000,
    position: options.position || "top-right",
    icon: "⚠️",
    style: {
      background: "#F59E0B",
      color: "#FFFFFF",
      borderRadius: "8px",
      padding: "12px 16px",
      fontSize: "14px",
      fontWeight: "500",
    },
  });
};

// Info notifications
export const showInfo = (
  message: string,
  options: NotificationOptions = {}
) => {
  return toast(message, {
    duration: options.duration || 4000,
    position: options.position || "top-right",
    icon: "ℹ️",
    style: {
      background: "#3B82F6",
      color: "#FFFFFF",
      borderRadius: "8px",
      padding: "12px 16px",
      fontSize: "14px",
      fontWeight: "500",
    },
  });
};

// Loading notifications
export const showLoading = (
  message: string,
  options: NotificationOptions = {}
) => {
  return toast.loading(message, {
    position: options.position || "top-right",
    style: {
      background: "#6B7280",
      color: "#FFFFFF",
      borderRadius: "8px",
      padding: "12px 16px",
      fontSize: "14px",
      fontWeight: "500",
    },
  });
};

// PDF-specific notifications
export const pdfNotifications = {
  uploadStart: (fileName: string) => showLoading(`Uploading ${fileName}...`),

  uploadSuccess: (fileName: string) =>
    showSuccess(`${fileName} uploaded successfully!`),

  uploadError: (error: string) => showError(`Upload failed: ${error}`),

  loadingStart: () => showLoading("Loading PDF viewer..."),

  loadingSuccess: () => showSuccess("PDF loaded successfully!"),

  loadingError: (error: string) => showError(`Failed to load PDF: ${error}`),

  fileSizeError: (size: string) =>
    showError(`File too large (${size}). Maximum size is 50MB.`),

  fileTypeError: () =>
    showError("Invalid file type. Please select a PDF file."),

  processingError: () =>
    showError(
      "Error processing PDF. The file may be corrupted or password-protected."
    ),
};

// Annotation-specific notifications
export const annotationNotifications = {
  createStart: () => showLoading("Creating annotation..."),

  createSuccess: () => showSuccess("Annotation created successfully!"),

  createError: (error: string) =>
    showError(`Failed to create annotation: ${error}`),

  updateStart: () => showLoading("Updating annotation..."),

  updateSuccess: () => showSuccess("Annotation updated successfully!"),

  updateError: (error: string) =>
    showError(`Failed to update annotation: ${error}`),

  deleteStart: () => showLoading("Deleting annotation..."),

  deleteSuccess: () => showSuccess("Annotation deleted successfully!"),

  deleteError: (error: string) =>
    showError(`Failed to delete annotation: ${error}`),

  loadError: (error: string) =>
    showError(`Failed to load annotations: ${error}`),

  selectionError: () =>
    showWarning(
      "Unable to capture text selection. Please try selecting the text again."
    ),

  coordinateError: () =>
    showWarning(
      "Unable to determine text coordinates. The annotation may not display correctly."
    ),
};

// Text selection notifications
export const selectionNotifications = {
  noTextSelected: () =>
    showWarning("Please select some text to create an annotation."),

  selectionTooShort: () =>
    showWarning("Please select at least a few words to create an annotation."),

  selectionTooLong: () =>
    showWarning("Selected text is too long. Please select a shorter passage."),

  selectionOutsidePdf: () =>
    showWarning("Please select text within the PDF document."),

  coordinateCalculationFailed: () =>
    showError(
      "Unable to determine text location. Please try selecting the text again."
    ),
};

// Navigation notifications
export const navigationNotifications = {
  crossTabSuccess: () => showInfo("Navigated to PDF location"),

  crossTabFailed: () =>
    showWarning("Could not navigate to PDF. Opening in current tab."),

  invalidLocation: () => showError("Invalid PDF location. Unable to navigate."),

  pdfNotFound: () =>
    showError("PDF not found. Please upload the document first."),
};

// Utility functions
export const dismissNotification = (toastId: string) => {
  toast.dismiss(toastId);
};

export const dismissAllNotifications = () => {
  toast.dismiss();
};

// Promise-based notifications for async operations
export const notifyPromise = <T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: any) => string);
  },
  options: NotificationOptions = {}
): Promise<T> => {
  return toast.promise(
    promise,
    {
      loading: messages.loading,
      success: (data) =>
        typeof messages.success === "function"
          ? messages.success(data)
          : messages.success,
      error: (error) =>
        typeof messages.error === "function"
          ? messages.error(error)
          : messages.error,
    },
    {
      position: options.position || "top-right",
      style: {
        borderRadius: "8px",
        padding: "12px 16px",
        fontSize: "14px",
        fontWeight: "500",
      },
    }
  );
};
