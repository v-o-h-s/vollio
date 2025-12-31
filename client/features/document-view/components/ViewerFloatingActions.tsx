import React from "react";
import { LuNotebookPen as NotebookPen, LuX as X } from "react-icons/lu";
import { RiRobot3Fill as Bot } from "react-icons/ri";
import { cn } from "@/lib/utils";

interface ViewerFloatingActionsProps {
  onToggleNoter?: () => void;
  onToggleAssistant?: () => void;
  isNoterOpen?: boolean;
  isAssistantOpen?: boolean;
}

export const ViewerFloatingActions = ({
  onToggleNoter,
  onToggleAssistant,
  isNoterOpen,
  isAssistantOpen,
}: ViewerFloatingActionsProps) => {
  return (
  <div className=" absolute bottom-8 right-8 z-50 flex flex-col gap-3 pointer-events-auto">
      {onToggleAssistant && (
        <button
          onClick={onToggleAssistant}
          className={cn(
            "w-12 h-12 rounded-2xl",
            "flex items-center justify-center",
            "shadow-lg hover:shadow-xl transition-all duration-300",
            "border border-white/20 dark:border-white/10",
            "backdrop-blur-xl",
            "cursor-pointer active:scale-95",
            isAssistantOpen
              ? "bg-purple-500 text-white scale-110"
              : "bg-white/90 dark:bg-black text-foreground hover:bg-gray-50 dark:hover:bg-black/50 hover:scale-110"
          )}
          title="Toggle Assistant"
        >
          <Bot
            size={20}
            className={cn(
              "transition-transform",
              isAssistantOpen && "scale-110"
            )}
          />
          {isAssistantOpen && (
            <span className="absolute -left-1 top-0 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
            </span>
          )}
        </button>
      )}

      {onToggleNoter && (
        <button
          onClick={onToggleNoter}
          className={cn(
            "w-12 h-12 rounded-2xl",
            "flex items-center justify-center",
            "shadow-lg hover:shadow-xl transition-all duration-300",
            "border border-white/20 dark:border-white/10",
            "backdrop-blur-xl",
            "cursor-pointer active:scale-95",
            isNoterOpen
              ? "bg-indigo-500 text-white scale-110"
              : "bg-white/90 dark:bg-black text-foreground hover:bg-gray-50 dark:hover:bg-black/50 hover:scale-110"
          )}
          title="Toggle Notes"
        >
          <NotebookPen
            size={20}
            className={cn("transition-transform", isNoterOpen && "scale-110")}
          />
          {isNoterOpen && (
            <span className="absolute -left-1 top-0 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
            </span>
          )}
        </button>
      )}
    </div>
  );
};
