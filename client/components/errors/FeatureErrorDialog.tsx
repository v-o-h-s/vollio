"use client";

import { TransformedRTKError } from "@/lib/utils/rtk-error-transform";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LuZap, LuRefreshCw } from "react-icons/lu";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureErrorDialogProps {
  error: TransformedRTKError | null;
  isOpen: boolean;
  onClose: () => void;
  onRetry?: () => void;
  title?: string;
}

/**
 * FeatureErrorDialog component displays a simple, clean modal for various feature errors (AI, uploads, etc.).
 */
export function FeatureErrorDialog({
  error,
  isOpen,
  onClose,
  onRetry,
  title: customTitle,
}: FeatureErrorDialogProps) {
  if (!error) return null;

  const isQuota = error.name === "QuotaExceededError";
  const isRateLimit = error.name === "RateLimitingError";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader className="flex flex-col items-center justify-center space-y-4 pt-4">
          <div
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center shrink-0",
              isQuota
                ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                : isRateLimit
                  ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
                  : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
            )}
          >
            {isQuota ? (
              <LuZap className="w-8 h-8" />
            ) : isRateLimit ? (
              <LuRefreshCw className="w-8 h-8" />
            ) : (
              <AlertCircle className="w-8 h-8" />
            )}
          </div>

          <div className="space-y-2 text-center">
            <DialogTitle className="text-xl font-bold">
              {customTitle ||
                (isQuota
                  ? "Limit Reached"
                  : isRateLimit
                    ? "Please Wait"
                    : "Action Failed")}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground wrap-break-word">
              {error.message ||
                "Something went wrong while processing your request."}
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="sm:justify-center flex-col sm:flex-row gap-2 pt-4">
          {isQuota ? (
            <Button
              className="w-[80%] bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
              onClick={() =>
                window.open("https://vollio.xyz/pricing", "_blank")
              }
            >
              <LuZap className="w-4 h-4 mr-2" />
              Upgrade Plan
            </Button>
          ) : (
            <Button
              className={cn(
                "w-auto text-white",
                isRateLimit
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-red-600 hover:bg-red-700",
              )}
              onClick={() => {
                onRetry?.();
                onClose();
              }}
            >
              {isRateLimit ? "Try Again" : "Retry Action"}
            </Button>
          )}

          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={onClose}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
