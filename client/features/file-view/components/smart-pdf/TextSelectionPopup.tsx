import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { textBound } from "./Viewer";
import { Sparkles, NotebookPen, X, Highlighter } from "lucide-react";


interface TextSelectionPopupProps {
  x: number;
  y: number;
  textBounds: textBound[];
  pageIndex: number;
  onClose: () => void;
  onHighlight: () => void;
}

export function TextSelectionPopup({
  x,
  y,
  textBounds,
  pageIndex,
  onClose,
  onHighlight,
}: TextSelectionPopupProps) {
  // Placeholder handlers for future implementation
  const handleExplain = () => {
    console.log("Explain feature - AI implementation coming soon", {
      textBounds,
      pageIndex,
    });
    // TODO: Implement AI explanation feature
  };


  const handleAddToNotes = () => {
    console.log("Add to notes - will trigger TipTap extension", {
      textBounds,
      pageIndex,
    });
    // TODO: Change focus to notes section and trigger TipTap extension
  };

  return (
    <div
      className="absolute z-[1000] w-[200px] animate-in fade-in slide-in-from-top-2 duration-200"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: "translateY(-100%)",
      }}
    >
      <Card className="shadow-lg border-muted">
        <CardContent className="p-2">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-medium text-muted-foreground">
              Quick Actions
            </span>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-muted cursor-pointer"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          <Separator className="mb-2" />

          <div className="space-y-1">
            <Button
              onClick={handleExplain}
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 h-9 font-normal hover:bg-accent cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <span>Explain with AI</span>
            </Button>

            <div className="relative">
              <Button
                onClick={onHighlight}
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 h-9 font-normal hover:bg-accent cursor-pointer"
              >
                <Highlighter className="h-4 w-4 text-muted-foreground" />
                <span>Highlight</span>
              </Button>

              
            </div>

            <Button
              onClick={handleAddToNotes}
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 h-9 font-normal hover:bg-accent cursor-pointer"
            >
              <NotebookPen className="h-4 w-4 text-muted-foreground" />
              <span>show in notes</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
