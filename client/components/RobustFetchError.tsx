"use client";

import { AlertTriangle, ArrowLeft, Bug, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
interface Extra {
  label: string;
  onClick: () => void;
  variant?:
    | "default"
    | "outline"
    | "ghost"
    | "secondary"
    | "destructive"
    | "link";
}
interface RobustFetchErrorProps {
  errorMessage: string;
  onRetry: () => void;
  onBack?: () => void;
  onReport?: () => void;
  extra?: Extra[];
}

export function RobustFetchError({
  errorMessage = "Something went wrong while loading your data.",
  onRetry,
  onBack,
  onReport,
  extra,
}: RobustFetchErrorProps) {
  return (
    <div className="flex items-start justify-center w-full h-screen pt-16 sm:pt-20 md:pt-24 px-4 sm:px-6 md:px-8">
      <div className="w-full max-w-md">
        {/* Header section */}
        <div className="flex flex-col space-y-4 p-6 pb-4 text-center">
          {/* Icon container with pulse animation */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-destructive/20 rounded-full blur-xl animate-pulse" />
              <div className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-destructive" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight">
              Oops! Something went wrong
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed px-2">
              {errorMessage}
            </p>
          </div>
        </div>

        {/* Footer section with actions */}
        <div className="flex flex-col gap-3 px-6 pb-6">
          {/* Primary actions - stack on mobile, row on larger screens */}
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            {onRetry && (
              <Button
                variant="default"
                onClick={onRetry}
                className="flex-1 gap-2 group"
              >
                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                Try Again
              </Button>
            )}
            {onBack && (
              <Button
                variant="outline"
                onClick={onBack}
                className="flex-1 gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </Button>
            )}
          </div>

          {/* Extra actions */}
          {extra && extra.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              {extra.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || "secondary"}
                  onClick={action.onClick}
                  className="flex-1"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}

          {/* Report button - secondary action */}
          {onReport && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReport}
              className="w-full text-muted-foreground hover:text-foreground gap-2"
            >
              <Bug className="w-4 h-4" />
              Report this issue
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
