import React from "react";
import { Highlighter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ExpandableTipProps {
  onHighlight: () => void;
}

export const ExpandableTip = ({ onHighlight }: ExpandableTipProps) => {
  return (
    <Card className="shadow-lg border-muted animate-in fade-in zoom-in duration-200">
      <CardContent className="p-1.5">
        <Button
          onClick={onHighlight}
          variant="ghost"
          size="sm"
          className="h-8 px-3 gap-2 font-normal hover:bg-accent cursor-pointer"
        >
          <Highlighter className="h-4 w-4" />
          <span className="text-sm">Highlight</span>
        </Button>
      </CardContent>
    </Card>
  );
};
