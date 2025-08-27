"use client";

import { useEffect, useState } from "react";
import { Loader2, Check, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AutoSaveStatus } from "@/hooks/use-auto-save";

interface AutoSaveStatusProps {
  status: AutoSaveStatus;
  lastSaved: Date | null;
  error: string | null;
  className?: string;
}

export function AutoSaveStatus({
  status,
  lastSaved,
  error,
  className,
}: AutoSaveStatusProps) {
  const [timeAgo, setTimeAgo] = useState<string>("");

  // Update time ago every minute
  useEffect(() => {
    if (!lastSaved) return;

    const updateTimeAgo = () => {
      const now = new Date();
      const diff = now.getTime() - lastSaved.getTime();
      const minutes = Math.floor(diff / 60000);
      
      if (minutes < 1) {
        setTimeAgo("just now");
      } else if (minutes === 1) {
        setTimeAgo("1 minute ago");
      } else if (minutes < 60) {
        setTimeAgo(`${minutes} minutes ago`);
      } else {
        const hours = Math.floor(minutes / 60);
        if (hours === 1) {
          setTimeAgo("1 hour ago");
        } else {
       
   setTimeAgo(`${hours} hours ago`);
        }
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [lastSaved]);

  const getStatusIcon = () => {
    switch (status) {
      case "saving":
        return <Loader2 className="h-3 w-3 animate-spin" />;
      case "saved":
        return <Check className="h-3 w-3" />;
      case "error":
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "saving":
        return "Saving...";
      case "saved":
        return "Saved";
      case "error":
        return error || "Save failed";
      default:
        return lastSaved ? `Saved ${timeAgo}` : "Not saved";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "saving":
        return "text-blue-600";
      case "saved":
        return "text-green-600";
      case "error":
        return "text-red-600";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs font-medium transition-colors",
        getStatusColor(),
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={getStatusText()}
    >
      {getStatusIcon()}
      <span>{getStatusText()}</span>
    </div>
  );
}