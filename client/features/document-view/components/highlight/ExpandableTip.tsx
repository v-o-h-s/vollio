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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

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
        <Info className={cn(isInline ? "h-3 w-3" : "h-2.5 w-2.5", "text-muted-foreground")} />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-80 shadow-2xl border-muted/50 backdrop-blur-xl" side="top">
      <div className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-semibold leading-none flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            {title}
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
        <div className="aspect-video rounded-lg bg-muted/50 flex flex-col items-center justify-center text-sm text-muted-foreground border-2 border-dashed border-muted-foreground/20 group-hover:border-primary/20 transition-colors">
          <div className="mb-2 p-2 rounded-full bg-background/50 shadow-inner">
            <RobotIcon className="h-5 w-5 text-primary/40" />
          </div>
          <span>Tutorial video coming soon</span>
        </div>
      </div>
    </PopoverContent>
  </Popover>
);

export const ExpandableTip = ({
  onHighlight,
  onCopy,
  onAddTag,
  onAddNote,
  onAddVNote,
  onExplain,
  onAddInsight,
}: ExpandableTipProps) => {
  return (
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
                className="cursor-pointer h-10 w-10 rounded-full hover:bg-neutral-500/10 hover:text-neutral-600 transition-all duration-200 hover:scale-105 active:scale-95"
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer h-10 w-10 rounded-full hover:bg-green-500/10 hover:text-green-600 transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    <NotebookPen className="h-4.5 w-4.5" />
                    <span className="sr-only">Note</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="min-w-[180px] rounded-xl p-1.5 shadow-2xl backdrop-blur-xl">
                  {onAddNote && (
                    <DropdownMenuItem 
                      onClick={onAddNote}
                      className="flex items-center justify-between rounded-lg py-2 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <FilePenLine className="h-4 w-4 text-green-600" />
                        <span>Add to V-Doc</span>
                      </div>
                      <FeatureInfo 
                        isInline 
                        title="V-Doc Note" 
                        description="Attach a note directly to this document's context."
                      />
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={onAddVNote}
                    disabled={!onAddVNote}
                    className="flex items-center justify-between rounded-lg py-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <NotebookPen className="h-4 w-4 text-purple-600" />
                      <span>Add to V-Notes</span>
                    </div>
                    <FeatureInfo 
                      isInline 
                      title="V-Notes Library" 
                      description="Save this insight to your global knowledge base for cross-document reference."
                    />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                className="h-10 w-10 rounded-full hover:bg-purple-500/10 hover:text-purple-600 transition-all duration-200 hover:scale-105 active:scale-95"
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
  );
};