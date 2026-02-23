"use client";

import { TransformedRTKError } from "@/lib/utils/rtk-error-transform";
import { FeatureErrorDialog } from "@/components/errors/FeatureErrorDialog";

interface UploadDocumentErrorProps {
  error: TransformedRTKError | null;
  isOpen: boolean;
  onClose: () => void;
  onRetry?: () => void;
}

/**
 * UploadDocumentError component displays a simple, clean modal for document upload errors.
 */
export function UploadDocumentError({
  error,
  isOpen,
  onClose,
  onRetry,
}: UploadDocumentErrorProps) {
  return (
    <FeatureErrorDialog
      error={error}
      isOpen={isOpen}
      onClose={onClose}
      onRetry={onRetry}
      title={
        error?.name === "QuotaExceededError"
          ? "Storage Limit Reached"
          : error?.name === "RateLimitingError"
            ? "Please Wait"
            : "Upload Failed"
      }
    />
  );
}
