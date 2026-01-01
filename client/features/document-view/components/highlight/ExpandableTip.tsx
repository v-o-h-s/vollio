import {
  LuCopy as Copy,
  LuInfo as Info,
  LuLightbulb as Lightbulb,
  LuFilePenLine as FilePenLine,
  LuNotebookPen as NotebookPen,
} from "react-icons/lu";
import { FaHighlighter as Highlighter } from "react-icons/fa";
import { RiRobot3Fill as RobotIcon } from "react-icons/ri";
import { HiTag as Tag } from "react-icons/hi2";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import MinimalEditor from "@/components/MinimalEditor";
interface ExpandableTipProps {
  onHighlight: () => void;
  onCopy?: () => void;
  onAddTag?: () => void;
  onAddNote?: () => void;
  onAddVNote?: () => void;
  onExplain?: () => void;
  onAddInsight?: () => void;
}

const FeatureInfo = ({
  title,
  description,
  isInline = false,
}: {
  title: string;
  description: string;
  isInline?: boolean;
}) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant="secondary"
        size="icon"
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "rounded-full shadow-sm z-10 transition-all duration-200",
          isInline
            ? "h-5 w-5 ml-2 opacity-70 hover:opacity-100 hover:bg-muted"
            : "absolute -top-1.5 -right-1.5 h-4 w-4 opacity-0 group-hover:opacity-100 hover:scale-110"
        )}
      >
        <Info
          className={cn(
            isInline ? "h-3 w-3" : "h-2.5 w-2.5",
            "text-muted-foreground"
          )}
        />
      </Button>
    </PopoverTrigger>
    <PopoverContent
      className="w-80 shadow-2xl border-muted/50 backdrop-blur-xl"
      side="top"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-semibold leading-none flex items-center gap-2">
            <Info className="h-4 w-4 text-purple-500" />
            {title}
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
        <div className="aspect-video rounded-lg bg-muted/50 flex flex-col items-center justify-center text-sm text-muted-foreground border-2 border-dashed border-muted-foreground/20 group-hover:border-purple-500/20 transition-colors">
          <div className="mb-2 p-2 rounded-full bg-background/50 shadow-inner">
            <RobotIcon className="h-5 w-5 text-purple-500/40" />
          </div>
          <span>Tutorial video coming soon</span>
        </div>
      </div>
    </PopoverContent>
  </Popover>
);

const NoteMenu = ({
  onAddNote,
  onAddVNote,
  onClose,
  setOpenVDocMenu,
}: {
  onAddNote?: (e: React.MouseEvent) => void;
  onAddVNote?: () => void;
  onClose: () => void;
  setOpenVDocMenu: (open: boolean) => void;
}) => {
  return (
    <div className="absolute rounded-[2rem] top-full mt-2 left-1/2 -translate-x-1/2 z-50 animate-in fade-in zoom-in slide-in-from-top-2 duration-200 bg-background/20 backdrop-blur-xl supports-[backdrop-filter]:bg-background/20">
      <Card className="rounded-[2rem] shadow-2xl border-white/10 overflow-hidden min-w-[180px] bg-background/70">
        <CardContent className="p-1.5 flex flex-col gap-1">
          {onAddNote && (
            <Button
              onClick={(e) => {
                onClose();
                setOpenVDocMenu(true);
              }}
              variant="ghost"
              className="w-full flex cursor-pointer items-center justify-start gap-3 px-3 py-2.5 h-auto rounded-full hover:bg-indigo-500/10 transition-all duration-200"
            >
              <div className="p-2 rounded-full bg-indigo-500/10">
                <FilePenLine className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-sm font-semibold leading-none text-foreground">
                  V-Doc
                </span>
              </div>
            </Button>
          )}
          {onAddVNote && (
            <Button
              onClick={() => {
                onAddVNote();
                onClose();
              }}
              variant="ghost"
              className="w-full flex cursor-pointer items-center justify-start gap-3 px-3 py-2.5 h-auto rounded-full hover:bg-purple-500/10 transition-all duration-200"
            >
              <div className="p-2 rounded-full bg-purple-500/10">
                <NotebookPen className="h-4.5 w-4.5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-sm font-semibold leading-none text-foreground">
                  V-Notes
                </span>
              </div>
            </Button>
          )}
        </CardContent>
      </Card>
      {/* Click outside to close invisible backdrop */}
      <div
        className="fixed inset-0 -z-10"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />
    </div>
  );
};

export const ExpandableTip = ({
  onHighlight,
  onCopy,
  onAddTag,
  onAddNote,
  onAddVNote,
  onExplain,
  onAddInsight,
}: ExpandableTipProps) => {
  const [openNoteMenu, setOpenNoteMenu] = useState(false);
  const [openVDocMenu, setOpenVDocMenu] = useState(false);
  return (
    <div className="relative">
      <Card className="rounded-full shadow-2xl border-white/10 animate-in fade-in zoom-in duration-300 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 overflow-visible">
        <CardContent className="p-1.5 flex items-center gap-1">
          {/* Basic Tools Group */}
          <div className="flex items-center gap-1 px-1">
            {onCopy && (
              <div className="relative group">
                <Button
                  onClick={onCopy}
                  variant="ghost"
                  size="icon"
                  className="cursor-pointer h-10 w-10 rounded-full bg-white text-neutral-900 shadow-sm border border-neutral-200 hover:bg-neutral-50 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <Copy className="h-4.5 w-4.5" />
                  <span className="sr-only">Copy</span>
                </Button>
                <FeatureInfo
                  title="Copy Text"
                  description="Instantly copy the selected text to your clipboard for use elsewhere."
                />
              </div>
            )}

            <div className="relative group">
              <Button
                onClick={onHighlight}
                variant="ghost"
                size="icon"
                className="cursor-pointer h-10 w-10 rounded-full hover:bg-yellow-500/10 hover:text-yellow-600 dark:hover:text-yellow-400 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <Highlighter className="h-4.5 w-4.5" />
                <span className="sr-only">Highlight</span>
              </Button>
              <FeatureInfo
                title="Highlight"
                description="Mark important passages with color to easily find them later during review."
              />
            </div>

            {onAddTag && (
              <div className="relative group">
                <Button
                  onClick={onAddTag}
                  variant="ghost"
                  size="icon"
                  className="cursor-pointer h-10 w-10 rounded-full hover:bg-neutral-500/10 dark:hover:text-white/70 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <Tag className="h-4.5 w-4.5" />
                  <span className="sr-only">Add Tag</span>
                </Button>
                <FeatureInfo
                  title="Categorize"
                  description="Apply tags to organize your highlights by topic, project, or priority."
                />
              </div>
            )}

            {(onAddNote || onAddVNote) && (
              <div className="relative group">
                <Button
                  onClick={() => setOpenNoteMenu(!openNoteMenu)}
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "cursor-pointer h-10 w-10 rounded-full transition-all duration-200 hover:scale-105 active:scale-95",
                    openNoteMenu
                      ? "bg-indigo-500 text-white hover:bg-indigo-600"
                      : "hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400"
                  )}
                >
                  <NotebookPen className="h-4.5 w-4.5 " />
                  <span className="sr-only">Note</span>
                </Button>

                <FeatureInfo
                  title="Annotate"
                  description="Add your own thoughts, questions, or summaries to the selected passage."
                />
              </div>
            )}
          </div>

          {/* Separator */}
          {(onExplain || onAddInsight) && (
            <div className="h-6 w-px bg-muted-foreground/20 mx-1" />
          )}

          {/* AI Tools Group */}
          <div className="flex items-center gap-1 px-1">
            {onExplain && (
              <div className="relative group">
                <Button
                  onClick={onExplain}
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <RobotIcon className="h-4.5 w-4.5" />
                  <span className="sr-only">Explain</span>
                </Button>
                <FeatureInfo
                  title="AI Explain"
                  description="Get a simplified, context-aware explanation of complex concepts using AI."
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {openNoteMenu && (
        <NoteMenu
          onAddNote={onAddNote}
          onAddVNote={onAddVNote}
          onClose={() => setOpenNoteMenu(false)}
          setOpenVDocMenu={setOpenVDocMenu}
        />
      )}
      {openVDocMenu && <MinimalEditor />}
    </div>
  );
};
