import { FileText, Loader2 } from "lucide-react";

export function DocumentLoadingState() {
  return (
    <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 h-[200px] w-[400px]">
      <div className="flex flex-col items-center space-y-4 overflow-x-auto max-w-full">
        <div className="relative">
          <div className="absolute inset-0 animate-ping">
            <FileText className="w-12 h-12 text-primary/20" />
          </div>
          <FileText className="w-12 h-12 text-primary relative z-10" />
        </div>

        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-lg font-medium text-foreground">
            Loading your document
          </span>
        </div>
        <p className="text-sm text-muted-foreground text-center wrap-break-word">
          Preparing your document for viewing
        </p>
      </div>
    </div>
  );
}
