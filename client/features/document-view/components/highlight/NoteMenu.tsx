import {
  LuCopy as Copy,
  LuInfo as Info,
  LuLightbulb as Lightbulb,
  LuFilePenLine as FilePenLine,
  LuNotebookPen as NotebookPen,
} from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import React, { useState } from "react";

export const NoteMenu = ({
  onAddVDocNote,
  onAddVNote,
  onClose,
  setOpenVDocMenu,
}: {
  onAddVDocNote?: (e: React.MouseEvent) => void;
  onClose: () => void;
  setOpenVDocMenu: (open: boolean) => void;
  onAddVNote?: () => void;
}) => {
  return (
    <div className="absolute rounded-[2rem] top-full mt-2 left-1/2 -translate-x-1/2 z-50 animate-in fade-in zoom-in slide-in-from-top-2 duration-200 bg-background/20 backdrop-blur-xl supports-[backdrop-filter]:bg-background/20">
      <Card className="rounded-[2rem] shadow-2xl border-white/10 overflow-hidden min-w-[180px] bg-background/70">
        <CardContent className="p-1.5 flex flex-col gap-1">
          {onAddVDocNote && (
            <Button
              onClick={(e) => {
                onClose();
                setOpenVDocMenu(true);
              }}
              variant="ghost"
              className="group w-full flex cursor-pointer items-center justify-start gap-3 px-3 py-2.5 h-auto rounded-full hover:bg-indigo-500/10 transition-all duration-200"
            >
              <div className="p-2 rounded-full rounded-full border group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-all duration-200">
                <FilePenLine className="h-4.5 w-4.5 text-white hover:text-indigo-600 dark:hover:text-indigo-400" />
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
              className="group w-full flex cursor-pointer items-center justify-start gap-3 px-3 py-2.5 h-auto rounded-full hover:bg-purple-500/10 transition-all duration-200"
            >
              <div className="p-2 rounded-full  shadow-sm border  group-hover:bg-purple-500/10 group-hover:border-purple-500/20 transition-all duration-200">
                <NotebookPen className="h-4.5 w-4.5 text-white hover:text-purple-600 dark:hover:text-purple-400" />
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