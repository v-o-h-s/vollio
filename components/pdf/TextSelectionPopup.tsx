import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { textBound } from "./Viewer";
interface TextSelectionPopupProps {
  x: number;
  y: number;
  textBounds: textBound[];
  pageIndex: number;
  onClose: () => void;
}

export function TextSelectionPopup({
  x,
  y,
  textBounds,
  pageIndex,
  onClose,
}: TextSelectionPopupProps) {
  return (
    <div
      className="absolute z-[1000] animate-in fade-in slide-in-from-top-2 duration-200"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: "translateY(-100%)",
      }}
    >
      <Card className="min-w-[250px] shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Text Selection Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-xs space-y-1.5 text-muted-foreground">
            <div className="flex justify-between">
              <span className="font-medium">Text Bounds Count:</span>
              <span className="text-foreground">{textBounds.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Page Index:</span>
              <span className="text-foreground">{pageIndex}</span>
            </div>
            <p className="text-[10px] text-muted-foreground/70 mt-2 pt-2 border-t">
              Temp data for testing - bounds count = number of word segments
            </p>
          </div>
          <Button
            onClick={onClose}
            variant="secondary"
            size="sm"
            className="w-full"
          >
            Close
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
