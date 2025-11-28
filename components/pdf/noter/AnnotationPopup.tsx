import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trash2, X } from "lucide-react";

interface AnnotationPopupProps {
  x: number;
  y: number;
  annotationId: string;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export function AnnotationPopup({
  x,
  y,
  annotationId,
  onClose,
  onDelete,
}: AnnotationPopupProps) {
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
              Annotation
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
              onClick={() => onDelete(annotationId)}
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 h-9 font-normal hover:bg-accent text-destructive hover:text-destructive cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
