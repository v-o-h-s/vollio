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

import { cn } from "@/lib/utils";
import React, { useState } from "react";
import MinimalEditor from "@/features/document-view/components/highlight/MinimalEditor";
import { FeatureInfo, FeatureInfoDual } from "@/components/FeatureExplanation";
import { NoteMenu } from "./NoteMenu";
import { Check } from "lucide-react";

interface ExpandableTipProps {
  onHighlight: () => void;
  onCopy?: () => void;
  onAddTag?: () => void;
  onAddNote?: () => void;
  onExplain?: () => void;
  onAddInsight?: () => void;
  onSaveVDocNote?: (html: string) => void;
  onAddVNote?: () => void;
  onAddVDocNote?: () => void;
}

export const ExpandableTip = ({
  onHighlight,
  onCopy,
  onAddTag,
  onAddNote,
  onExplain,
  onAddInsight,
  onSaveVDocNote,
  onAddVDocNote,
  onAddVNote,
}: ExpandableTipProps) => {
  const [openNoteMenu, setOpenNoteMenu] = useState(false);
  const [openVDocMenu, setOpenVDocMenu] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  return (
    <div className="relative">
      <Card className="rounded-full shadow-2xl border-white/10 animate-in fade-in zoom-in duration-300 bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60 overflow-visible">
        <CardContent className="p-1.5 flex items-center gap-1">
          {/* Basic Tools Group */}
          <div className="flex items-center gap-1 px-1">
            {onCopy && (
              <div className="relative group">
                <Button
                  onClick={() => {
                    onCopy();
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 4000);
                  }}
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "cursor-pointer h-10 w-10 rounded-full bg-white text-neutral-900 shadow-sm border border-neutral-200 hover:bg-neutral-50 transition-all duration-200 hover:scale-105 active:scale-95",
                    isCopied && "bg-green-500 text-white hover:bg-green-600"
                  )}
                >
                  {isCopied ? (
                    <Check className="h-4.5 w-4.5 " />
                  ) : (
                    <Copy className="h-4.5 w-4.5" />
                  )}
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

                <FeatureInfoDual
                  featureA={{
                    title: "V-Doc",
                    description:
                      "Create a rich document linked to this highlight for detailed analysis.",
                  }}
                  featureB={{
                    title: "V-Notes",
                    description:
                      "Quickly jot down brief notes and thoughts without leaving the page.",
                  }}
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
          onAddVDocNote={onAddVDocNote}
          onAddVNote={onAddVNote}
          onClose={() => setOpenNoteMenu(false)}
          setOpenVDocMenu={setOpenVDocMenu}
        />
      )}
      {openVDocMenu && (
        <MinimalEditor
          className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-999"
          onClose={() => setOpenVDocMenu(false)}
          onSave={async (html) => {
            onSaveVDocNote?.(html);
            setOpenVDocMenu(false);
          }}
        />
      )}
    </div>
  );
};
