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
import { useAutoSaveStatus } from "./AutoSaveStatusProvider";

export function FloatingAutoSaveStatus() {
  const { status, lastSaved, error, isCreating } = useAutoSaveStatus();

  const getStatusIcon = () => {
    switch (status) {
      case "saving":
        return <Loader2 className="h-3 w-3 animate-spin" />;
      case "saved":
        return <Check className="h-3 w-3" />;
      case "error":
        return <AlertCircle className="h-3 w-3" />;
      case "typing":
        return <Clock className="h-3 w-3" />;
      default:
        return <Wifi className="h-3 w-3" />;
    }
  };

  const getStatusText = () => {
    if (isCreating && status === "saving") {
      return "Creating note...";
    }
    
    switch (status) {
      case "saving":
        return "Saving...";
      case "saved":
        if (lastSaved) {
          const now = new Date();
          const diffMs = now.getTime() - lastSaved.getTime();
          const diffSeconds = Math.floor(diffMs / 1000);
          const diffMinutes = Math.floor(diffSeconds / 60);
          
          if (diffSeconds < 60) {
            return "Saved just now";
          } else if (diffMinutes < 60) {
            return `Saved ${diffMinutes}m ago`;
          } else {
            return `Saved at ${lastSaved.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}`;
          }
        }
        return "Saved";
      case "error":
        return error || "Save failed";
      case "typing":
        return "Unsaved changes";
      default:
        return "Ready";
    }
  };

  const getStatusVariant = () => {
    switch (status) {
      case "saving":
        return "default";
      case "saved":
        return "default";
      case "error":
        return "destructive";
      case "typing":
        return "secondary";
      default:
        return "outline";
    }
  };

  // Don't show the status if we're in idle state and haven't saved anything
  if (status === "idle" && !lastSaved) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 ml-64"> {/* ml-64 to account for sidebar width */}
      <Badge 
        variant={getStatusVariant()}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 shadow-lg border",
          status === "error" && "border-red-200 bg-red-50 text-red-700",
          status === "saved" && "border-green-200 bg-green-50 text-green-700",
          status === "saving" && "border-blue-200 bg-blue-50 text-blue-700",
          status === "typing" && "border-orange-200 bg-orange-50 text-orange-700"
        )}
      >
        {getStatusIcon()}
        <span className="text-xs font-medium">
          {getStatusText()}
        </span>
      </Badge>
    </div>
  );
}
