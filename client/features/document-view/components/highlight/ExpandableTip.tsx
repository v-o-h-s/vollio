import {
  LuHighlighter as Highlighter,
  LuTag as Tag,
  LuStickyNote as StickyNote,
  LuCopy as Copy,
} from "react-icons/lu";
import { RiRobot3Line as Bot } from "react-icons/ri";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useAppSelector } from "@/lib/store/hooks";

interface ExpandableTipProps {
  onHighlight: () => void;
  onCopy?: () => void;
  onAddTag?: () => void;
  onAddNote?: () => void;
  onExplain?: () => void;
  onAddInsight?: () => void;
}

export const ExpandableTip = ({
  onHighlight,
  onCopy,
  onAddTag,
  onAddNote,
  onExplain,
  onAddInsight,
}: ExpandableTipProps) => {
  return (
    <Card className="shadow-lg border-muted animate-in fade-in zoom-in duration-200">
      <CardContent className="p-1.5 flex items-center gap-1">
        {/* Copy Button */}
        {onCopy && (
          <Button
            onClick={onCopy}
            variant="ghost"
            size="sm"
            className="group h-8 px-2 gap-2 font-normal hover:bg-accent cursor-pointer transition-all duration-200 overflow-hidden"
          >
            <Copy className="h-4 w-4 shrink-0" />
            <span className="text-sm max-w-0 group-hover:max-w-[100px] overflow-hidden whitespace-nowrap transition-all duration-200">
              Copy
            </span>
          </Button>
        )}

        {/* Highlight Button */}
        <Button
          onClick={onHighlight}
          variant="ghost"
          size="sm"
          className="group h-8 px-2 gap-2 font-normal hover:bg-accent cursor-pointer transition-all duration-200 overflow-hidden"
        >
          <Highlighter className="h-4 w-4 shrink-0" />
          <span className="text-sm max-w-0 group-hover:max-w-[100px] overflow-hidden whitespace-nowrap transition-all duration-200">
            Highlight
          </span>
        </Button>

        {/* Add Tag Button */}
        {onAddTag && (
          <Button
            onClick={onAddTag}
            variant="ghost"
            size="sm"
            className="group h-8 px-2 gap-2 font-normal hover:bg-accent cursor-pointer transition-all duration-200 overflow-hidden"
          >
            <Tag className="h-4 w-4 shrink-0" />
            <span className="text-sm max-w-0 group-hover:max-w-[100px] overflow-hidden whitespace-nowrap transition-all duration-200">
              Add Tag
            </span>
          </Button>
        )}

        {/* Add Note Button */}
        {onAddNote && (
          <Button
            onClick={onAddNote}
            variant="ghost"
            size="sm"
            className="group h-8 px-2 gap-2 font-normal hover:bg-accent cursor-pointer transition-all duration-200 overflow-hidden"
          >
            <StickyNote className="h-4 w-4 shrink-0" />
            <span className="text-sm max-w-0 group-hover:max-w-[100px] overflow-hidden whitespace-nowrap transition-all duration-200">
              Note
            </span>
          </Button>
        )}

        {/* Explain Button */}
        {onExplain && (
          <Button
            onClick={onExplain}
            variant="ghost"
            size="sm"
            className="group h-8 px-2 gap-2 font-normal hover:bg-accent cursor-pointer transition-all duration-200 overflow-hidden"
          >
            <Bot className="h-4 w-4 shrink-0" />
            <span className="text-sm max-w-0 group-hover:max-w-[200px] overflow-hidden whitespace-nowrap transition-all duration-200">
              explain
            </span>
          </Button>
        )}

        {/* Add Insight Button */}
        {onAddInsight && (
          <Button
            onClick={onAddInsight}
            variant="ghost"
            size="sm"
            className="group h-8 px-2 gap-2 font-normal hover:bg-accent cursor-pointer transition-all duration-200 overflow-hidden"
          >
            <Bot className="h-4 w-4 shrink-0" />
            <span className="text-sm max-w-0 group-hover:max-w-[200px] overflow-hidden whitespace-nowrap transition-all duration-200">
              insight
            </span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
