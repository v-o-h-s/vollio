"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Save,
  Undo,
  Redo,
  Strikethrough,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface MinimalEditorProps {
  initialValue?: string;
  onSave: (html: string) => Promise<void>;
  onClose: () => void;
  className?: string;
  placeholder?: string;
}

export default function MinimalEditor({
  initialValue = "",
  onSave,
  onClose,
  className,
  placeholder = "Start typing your note...",
}: MinimalEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);
  const [activeStates, setActiveStates] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    insertUnorderedList: false,
    insertOrderedList: false,
  });

  const updateActiveStates = useCallback(() => {
    if (typeof document === "undefined") return;
    setActiveStates({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strikethrough: document.queryCommandState("strikethrough"),
      insertUnorderedList: document.queryCommandState("insertUnorderedList"),
      insertOrderedList: document.queryCommandState("insertOrderedList"),
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    if (editorRef.current && !hasLoadedInitial) {
      editorRef.current.innerHTML = initialValue;
      setHasLoadedInitial(true);
    }
  }, [initialValue, hasLoadedInitial]);

  const format = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    updateActiveStates();
    editorRef.current?.focus();
  };

  const handleSave = async () => {
    if (editorRef.current && !isSaving) {
      setIsSaving(true);
      try {
        await onSave(editorRef.current.innerHTML);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "s") {
        e.preventDefault();
        await handleSave();
      }
    }
    setTimeout(updateActiveStates, 0);
  };

  return (
    <Card
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "w-[500px] border-white/20 shadow-2xl transition-all duration-300 overflow-hidden bg-black",
        className
      )}
    >
      {/* Toolbar - Only visible on hover or focus */}
      <div
        className={cn(
          "flex items-center gap-0.5 p-1.5 border-b-[1px] border-white/20 transition-all duration-300",
          isHovered || isFocused
            ? "opacity-100 h-auto"
            : "opacity-0 h-0 p-0 border-0 pointer-events-none"
        )}
      >
        <div className="flex items-center gap-0.5 px-1">
          <ToolbarButton
            onClick={() => format("undo")}
            icon={<Undo className="h-4 w-4" />}
            tooltip="Undo"
          />
          <ToolbarButton
            onClick={() => format("redo")}
            icon={<Redo className="h-4 w-4" />}
            tooltip="Redo"
          />
        </div>

        <Separator orientation="vertical" className="h-6 bg-white/10 mx-1" />

        <div className="flex items-center gap-0.5 px-1">
          <ToolbarButton
            onClick={() => format("bold")}
            icon={<Bold className="h-4 w-4" />}
            tooltip="Bold"
            active={activeStates.bold}
          />
          <ToolbarButton
            onClick={() => format("italic")}
            icon={<Italic className="h-4 w-4" />}
            tooltip="Italic"
            active={activeStates.italic}
          />
          <ToolbarButton
            onClick={() => format("underline")}
            icon={<Underline className="h-4 w-4" />}
            tooltip="Underline"
            active={activeStates.underline}
          />
          <ToolbarButton
            onClick={() => format("strikethrough")}
            icon={<Strikethrough className="h-4 w-4" />}
            tooltip="Strikethrough"
            active={activeStates.strikethrough}
          />
        </div>

        <Separator orientation="vertical" className="h-6 bg-white/10 mx-1" />

        <div className="flex items-center gap-0.5 px-1">
          <ToolbarButton
            onClick={() => format("insertUnorderedList")}
            icon={<List className="h-4 w-4" />}
            tooltip="Bullet List"
            active={activeStates.insertUnorderedList}
          />
          <ToolbarButton
            onClick={() => format("insertOrderedList")}
            icon={<ListOrdered className="h-4 w-4" />}
            tooltip="Numbered List"
            active={activeStates.insertOrderedList}
          />
        </div>

        <div className="ml-auto px-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="h-8 gap-2 bg-white hover:bg-zinc-200 text-black border-none font-bold shadow-lg min-w-[80px]"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <p className="text-xs">{isSaving ? "Saving..." : "Save"}</p>
          </Button>

          <ToolbarButton
            onClick={onClose}
            icon={<X className="h-4 w-4" />}
            tooltip="Close"
          />
        </div>
      </div>

      {/* Editable area */}
      <CardContent className="p-0">
        <div
          ref={editorRef}
          contentEditable
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          onKeyUp={updateActiveStates}
          onMouseUp={updateActiveStates}
          className={cn(
            "prose prose-sm prose-invert max-w-none p-4 min-h-[150px] focus:outline-none overflow-y-auto max-h-[400px] text-white",
            "minimal-editor-content",
            "empty:before:content-[attr(data-placeholder)] empty:before:text-white/30 empty:before:pointer-events-none"
          )}
          data-placeholder={placeholder}
        />
      </CardContent>
    </Card>
  );
}

function ToolbarButton({
  onClick,
  icon,
  tooltip,
  active = false,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  tooltip: string;
  active?: boolean;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={cn(
        "h-8 w-8 rounded-lg transition-all duration-200",
        active
          ? "bg-white text-black scale-105 shadow-sm"
          : "text-white/60 hover:bg-white/10 hover:text-white"
      )}
      title={tooltip}
    >
      {icon}
    </Button>
  );
}
