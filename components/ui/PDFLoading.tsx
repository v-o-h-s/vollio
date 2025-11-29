import React from "react";
import { Progress } from "@/components/ui/progress";

export const PDFLoading = ({
  progress,
}: {
  progress: { loaded: number; total: number };
}) => {
  const percentage =
    progress && progress.total
      ? Math.round((progress.loaded / progress.total) * 100)
      : 0;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-background/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 p-8 rounded-2xl bg-card border border-border shadow-2xl animate-in fade-in zoom-in duration-300 w-[300px]">
        <div className="flex flex-col items-center gap-2 w-full">
          <h3 className="text-lg font-semibold text-foreground">Loading PDF</h3>
          <Progress
            value={percentage}
            className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-blue-600 [&>div]:to-cyan-500"
          />
          <p className="text-xs text-muted-foreground self-center">
            {percentage}%
          </p>
        </div>
      </div>
    </div>
  );
};
