"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  FileText,
  Palette,
  ChevronDown,
  Highlighter,
  MessageSquare,
  FileEdit,
  Circle,
  CircleSlash2,
  Maximize,
  Minimize,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PDFDocument } from "@/lib/types/pdf";

export interface PDFViewerHeaderProps {
  /** PDF document being viewed */
  pdfDocument: PDFDocument;
  /** Whether the header is visible */
  isHeaderVisible: boolean;
  /** Function to set header visibility */
  setIsHeaderVisible: (visible: boolean) => void;
  /** Whether focus mode is active */
  isFocusMode: boolean;
  /** Function to toggle focus mode */
  setIsFocusMode: (focusMode: boolean) => void;
  /** Currently selected tool */
  selectedTool: "highlight" | "nothing" | "comment" | "note" | "delete";
  /** Function to set selected tool */
  setSelectedTool: (tool: "highlight" | "nothing" | "comment" | "note" | "delete") => void;
  /** Current highlight mode */
  highlightMode: "quick" | "comment" | "note";
  /** Function to set highlight mode */
  setHighlightMode: (mode: "quick" | "comment" | "note") => void;
}

export function PDFViewerHeader({
  pdfDocument,
  isHeaderVisible,
  setIsHeaderVisible,
  isFocusMode,
  setIsFocusMode,
  selectedTool,
  setSelectedTool,
  highlightMode,
  setHighlightMode,
}: PDFViewerHeaderProps) {
  const router = useRouter();

  return (
    <div
      className={`fixed top-4 left-4 right-4 z-20 transition-all duration-500 ease-in-out ${
        !isHeaderVisible
          ? "-translate-y-full opacity-0"
          : "translate-y-0 opacity-100"
      }`}
    >
      {/* Enhanced stylish header with glassmorphism effect */}
      <div className="bg-white dark:bg-black backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/30">
        <div className="bg-gradient-to-r from-white/5 to-transparent dark:from-white/5 dark:to-transparent rounded-2xl">
          <div className="flex items-center justify-between px-4 sm:px-6 py-2">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              {/* Back Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-2 flex-shrink-0 hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-200 h-7 px-2 rounded-lg backdrop-blur-sm"
              >
                <ArrowLeft size={14} />
                <span className="hidden sm:inline text-xs font-medium">
                  Back
                </span>
              </Button>

              {/* Separator */}
              <div className="w-px h-5 bg-white/20 dark:bg-white/10 flex-shrink-0" />

              {/* PDF Info */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-7 h-7 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                  <FileText size={14} className="text-white" />
                </div>
                <h1 className="text-xs font-semibold text-foreground truncate">
                  {pdfDocument.filename}
                </h1>
              </div>

              {/* Separator */}
              <div className="w-px h-5 bg-white/20 dark:bg-white/10 flex-shrink-0" />

              {/* Tools Section */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 flex-shrink-0 hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-200 h-7 px-2 rounded-lg backdrop-blur-sm"
                  >
                    <Palette size={14} />
                    <span className="hidden sm:inline text-xs font-medium">
                      Tools
                    </span>
                    {selectedTool && (
                      <div className="flex items-center gap-1">
                        {selectedTool === "highlight" && (
                          <div
                            className={`w-2 h-2 rounded-full ${
                              highlightMode === "quick"
                                ? "bg-yellow-400"
                                : highlightMode === "comment"
                                ? "bg-orange-400"
                                : "bg-blue-400"
                            }`}
                          />
                        )}
                        {selectedTool === "comment" && (
                          <div className="w-2 h-2 rounded-full bg-green-400" />
                        )}
                        {selectedTool === "note" && (
                          <div className="w-2 h-2 rounded-full bg-purple-400" />
                        )}
                        {selectedTool === "delete" && (
                          <div className="w-2 h-2 rounded-full bg-red-400" />
                        )}
                        {selectedTool === "nothing" && (
                          <div className="w-2 h-2 rounded-full bg-black/50" />
                        )}
                      </div>
                    )}
                    <ChevronDown size={14} className="opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="center"
                  side="bottom"
                  sideOffset={8}
                  className="w-56 dark:bg-black bg-white mt-1 order border-white/20 dark:border-white/10   rounded-lg z-[9999]"
                >
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="flex items-center gap-3 hover:bg-black/10 dark:hover:bg-white/10 focus:bg-black/10 dark:focus:bg-white/10 data-[state=open]:bg-black/10 dark:data-[state=open]:bg-white/10 transition-colors duration-200">
                      <Highlighter size={16} className="text-yellow-500" />
                      <span className="font-medium">Highlighting</span>
                      {selectedTool === "highlight" && (
                        <Circle
                          size={6}
                          className="ml-auto text-blue-500 fill-current"
                        />
                      )}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent
                      className="w-64 bg-white dark:bg-black backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl shadow-black/10 dark:shadow-black/30 rounded-xl z-[99999]"
                      sideOffset={8}
                    >
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedTool("highlight");
                          setHighlightMode("quick");
                          console.log(
                            "Quick highlight selected - Tool:",
                            "highlight",
                            "Mode:",
                            "quick"
                          );
                        }}
                        className="flex items-center gap-3 cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 focus:bg-black/10 dark:focus:bg-white/10 transition-colors duration-200"
                      >
                        <div className="w-4 h-4 bg-yellow-400 rounded-full shadow-sm" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            Quick Highlight
                          </div>
                          <div className="text-xs text-muted-foreground">
                            No note, just color
                          </div>
                        </div>
                        {highlightMode === "quick" &&
                          selectedTool === "highlight" && (
                            <Circle
                              size={6}
                              className="text-blue-500 fill-current"
                            />
                          )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedTool("highlight");
                          setHighlightMode("comment");
                          console.log(
                            "Comment highlight selected - Tool:",
                            "highlight",
                            "Mode:",
                            "comment"
                          );
                        }}
                        className="flex items-center gap-3 cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 focus:bg-black/10 dark:focus:bg-white/10 transition-colors duration-200"
                      >
                        <div className="w-4 h-4 bg-orange-400 rounded-full shadow-sm" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            Inline Comment
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Small text on hover
                          </div>
                        </div>
                        {highlightMode === "comment" &&
                          selectedTool === "highlight" && (
                            <Circle
                              size={6}
                              className="text-blue-500 fill-current"
                            />
                          )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedTool("highlight");
                          setHighlightMode("note");
                          console.log(
                            "Note highlight selected - Tool:",
                            "highlight",
                            "Mode:",
                            "note"
                          );
                        }}
                        className="flex items-center gap-3 cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 focus:bg-black/10 dark:focus:bg-white/10 transition-colors duration-200"
                      >
                        <div className="w-4 h-4 bg-blue-400 rounded-full shadow-sm" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            Linked Note
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Expands to full note
                          </div>
                        </div>
                        {highlightMode === "note" &&
                          selectedTool === "highlight" && (
                            <Circle
                              size={6}
                              className="text-blue-500 fill-current"
                            />
                          )}
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedTool("comment");
                      console.log(
                        "Comment tool selected - Tool:",
                        "comment"
                      );
                    }}
                    className="flex items-center gap-3 cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 focus:bg-black/10 dark:focus:bg-white/10 transition-colors duration-200"
                  >
                    <MessageSquare size={16} className="text-green-500" />
                    <span className="font-medium">Comments</span>
                    {selectedTool === "comment" && (
                      <Circle
                        size={6}
                        className="ml-auto text-blue-500 fill-current"
                      />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedTool("note");
                      console.log("Note tool selected - Tool:", "note");
                    }}
                    className="flex items-center gap-3 cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 focus:bg-black/10 dark:focus:bg-white/10 transition-colors duration-200"
                  >
                    <FileEdit size={16} className="text-purple-500" />
                    <span className="font-medium">Notes</span>
                    {selectedTool === "note" && (
                      <Circle
                        size={6}
                        className="ml-auto text-blue-500 fill-current"
                      />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedTool("delete");
                      console.log("Delete tool selected - Tool:", "delete");
                    }}
                    className="flex items-center gap-3 cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/20 focus:bg-red-50 dark:focus:bg-red-950/20 transition-colors duration-200"
                  >
                    <Trash2 size={16} className="text-red-500" />
                    <span className="font-medium text-red-600 dark:text-red-400">Delete Highlights</span>
                    {selectedTool === "delete" && (
                      <Circle
                        size={6}
                        className="ml-auto text-blue-500 fill-current"
                      />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedTool("nothing");
                      console.log(
                        "Nothing tool selected - Tool:",
                        "nothing"
                      );
                    }}
                    className="flex items-center gap-3 cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 focus:bg-black/10 dark:focus:bg-white/10 transition-colors duration-200"
                  >
                    <CircleSlash2 size={16} />
                    <span className="font-medium">Nothing</span>
                    {selectedTool === "nothing" && (
                      <Circle
                        size={6}
                        className="ml-auto text-blue-500 fill-current"
                      />
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Current Tool Indicator */}
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/10 dark:bg-white/5 rounded-md backdrop-blur-sm border border-white/20 dark:border-white/10">
                {selectedTool === "highlight" && (
                  <>
                    <div
                      className={`w-2.5 h-2.5 rounded-full shadow-sm ${
                        highlightMode === "quick"
                          ? "bg-yellow-400"
                          : highlightMode === "comment"
                          ? "bg-orange-400"
                          : "bg-blue-400"
                      }`}
                    />
                    <span className="text-xs font-medium text-foreground/80">
                      {highlightMode === "quick"
                        ? "Quick"
                        : highlightMode === "comment"
                        ? "Comment"
                        : "Note"}
                    </span>
                  </>
                )}
                {selectedTool === "comment" && (
                  <>
                    <MessageSquare size={10} className="text-green-500" />
                    <span className="text-xs font-medium text-foreground/80">
                      Comment
                    </span>
                  </>
                )}
                {selectedTool === "note" && (
                  <>
                    <FileEdit size={10} className="text-purple-500" />
                    <span className="text-xs font-medium text-foreground/80">
                      Note
                    </span>
                  </>
                )}
                {selectedTool === "delete" && (
                  <>
                    <Trash2 size={10} className="text-red-500" />
                    <span className="text-xs font-medium text-red-600 dark:text-red-400">
                      Delete
                    </span>
                  </>
                )}
                {selectedTool === "nothing" && (
                  <>
                    <CircleSlash2 size={10} />
                    <span className="text-xs font-medium text-foreground/80">
                      Nothing
                    </span>
                  </>
                )}
              </div>

              {/* Separator */}
              <div className="w-px h-5 bg-white/20 dark:bg-white/10 flex-shrink-0" />

              {/* Focus Mode Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsFocusMode(!isFocusMode);
                  setIsHeaderVisible(false);
                }}
                className="flex items-center gap-2 flex-shrink-0 hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-200 h-7 px-2 rounded-lg backdrop-blur-sm"
                title={
                  isFocusMode
                    ? "Exit Focus Mode (Esc)"
                    : "Enter Focus Mode (F)"
                }
              >
                {isFocusMode ? (
                  <>
                    <Minimize size={14} />
                    <span className="hidden sm:inline text-xs font-medium">
                      Exit Focus
                    </span>
                  </>
                ) : (
                  <>
                    <Maximize size={14} />
                    <span className="hidden sm:inline text-xs font-medium">
                      Focus Mode
                    </span>
                  </>
                )}
              </Button>

              {/* Hide Header Button (only show in focus mode when header is visible) */}
              {isFocusMode && (
                <>
                  <div className="w-px h-5 bg-white/20 dark:bg-white/10 flex-shrink-0" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsHeaderVisible(false)}
                    className="flex items-center gap-2 flex-shrink-0 hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-200 h-7 px-2 rounded-lg backdrop-blur-sm"
                    title="Hide Header"
                  >
                    <ArrowLeft size={14} className="-rotate-90" />
                    <span className="hidden sm:inline text-xs font-medium">
                      Hide
                    </span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}