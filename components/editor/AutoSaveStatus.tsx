"use client";

import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  Check, 
  AlertCircle, 
  Clock,
  Wifi,
  WifiOff 
} from "lucide-react";
import { cn } from "@/lib/utils";

type AutoSaveStatus = "idle" | "typing" | "saving" | "saved" | "error";

interface AutoSaveStatusProps {
  status: AutoSaveStatus;
  lastSaved?: Date | null;
  error?: string | null;
  isCreating?: boolean;
  size?: "sm" | "default" | "lg";
  className?: string;
  showIcon?: boolean;
  showText?: boolean;
}

export function AutoSaveStatus({
  status,
  lastSaved,
  error,
  isCreating = false,
  size = "default",
  className,
  showIcon = true,
  showText = true,
}: AutoSaveStatusProps) {
  
  const getStatusIcon = () => {
    if (isCreating) {
      return <Loader2 className="h-3 w-3 animate-spin" />;
    }

    switch (status) {
      case "typing":
        return <Clock className="h-3 w-3" />;
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
    if (isCreating) {
      return "Creating...";
    }

    switch (status) {
      case "typing":
        return "Typing...";
      case "saving":
        return "Saving...";
      case "saved":
        if (lastSaved) {
          const now = new Date();
          const diff = now.getTime() - lastSaved.getTime();
          const seconds = Math.floor(diff / 1000);
          
          if (seconds < 10) {
            return "Saved just now";
          } else if (seconds < 60) {
            return `Saved ${seconds}s ago`;
          } else {
            const minutes = Math.floor(seconds / 60);
            if (minutes < 60) {
              return `Saved ${minutes}m ago`;
            } else {
              const hours = Math.floor(minutes / 60);
              return `Saved ${hours}h ago`;
            }
          }
        }
        return "Saved";
      case "error":
        return error || "Save failed";
      default:
        return lastSaved ? "Auto-save enabled" : "Start typing to save";
    }
  };

  const getStatusVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    if (isCreating) {
      return "secondary";
    }

    switch (status) {
      case "typing":
        return "outline";
      case "saving":
        return "secondary";
      case "saved":
        return "default";
      case "error":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "px-2 py-1 text-xs";
      case "lg":
        return "px-4 py-2 text-sm";
      default:
        return "px-3 py-1.5 text-xs";
    }
  };

  return (
    <Badge
      variant={getStatusVariant()}
      className={cn(
        "flex items-center gap-1.5 font-medium transition-all duration-200",
        getSizeClasses(),
        status === "saved" && "animate-pulse",
        status === "error" && "animate-bounce",
        className
      )}
    >
      {showIcon && getStatusIcon()}
      {showText && (
        <span className="whitespace-nowrap">
          {getStatusText()}
        </span>
      )}
    </Badge>
  );
}