import React, { useState, useMemo } from "react";
import { MyHighlight } from "@/features/document-view/types/highlight";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X, Tag as TagIcon, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useGetSettingsQuery } from "@/lib/store/apiSlice";

interface TagSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  highlights: MyHighlight[];
  onScrollToHighlight: (highlight: MyHighlight) => void;
}

export const TagSidebar = ({
  isOpen,
  onClose,
  highlights,
  onScrollToHighlight,
}: TagSidebarProps) => {
  const [expandedTags, setExpandedTags] = useState<string[]>([]);
  
  const { data: settings } = useGetSettingsQuery();
  const tags = settings?.tags || [];

  // Create a map for quick color lookup
  const tagColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    tags.forEach(t => {
      map[t.label] = t.color;
    });
    return map;
  }, [tags]);

  // Group highlights by tag
  const highlightsByTag = useMemo(() => {
    const grouped: Record<string, MyHighlight[]> = {};
    const untagged: MyHighlight[] = [];

    highlights.forEach((h) => {
      if (h.tags && h.tags.length > 0) {
        h.tags.forEach((tag) => {
          if (!grouped[tag]) {
            grouped[tag] = [];
          }
          grouped[tag].push(h);
        });
      } else {
        untagged.push(h);
      }
    });

    return { grouped, untagged };
  }, [highlights]);

  const sortedTags = useMemo(() => {
    return Object.keys(highlightsByTag.grouped).sort();
  }, [highlightsByTag]);

  if (!isOpen) return null;

  return (
    <div className="absolute top-20 right-4 w-80 max-h-[calc(100vh-8rem)] z-30 flex flex-col bg-background/80 backdrop-blur-md border border-border rounded-xl shadow-2xl animate-in slide-in-from-right-10 fade-in duration-300">
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <TagIcon className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Tags Overview</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-full hover:bg-muted"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <Accordion
          type="multiple"
          className="w-full space-y-2"
          value={expandedTags}
          onValueChange={setExpandedTags}
        >
          {sortedTags.map((tag) => {
            const tagColor = tagColorMap[tag] || "#3b82f6";
            return (
              <AccordionItem
                key={tag}
                value={tag}
                className="border border-border/50 rounded-lg overflow-hidden bg-card/50"
              >
                <AccordionTrigger className="px-3 py-2 hover:no-underline hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-xs font-normal"
                      style={{
                        borderColor: tagColor,
                        color: tagColor,
                        backgroundColor: `${tagColor}10`,
                      }}
                    >
                      {tag}
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-auto mr-2">
                      {highlightsByTag.grouped[tag].length}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3 pt-1">
                  <div className="space-y-2">
                    {highlightsByTag.grouped[tag].map((highlight) => (
                      <div
                        key={highlight.id}
                        className="group flex flex-col gap-2 p-2 rounded-md hover:bg-accent/50 border border-transparent hover:border-border/50 transition-all cursor-pointer"
                        onClick={() => onScrollToHighlight(highlight)}
                      >
                        {highlight.content?.text && (
                          <p className="text-xs text-muted-foreground line-clamp-3 italic border-l-2 pl-2 border-primary/20">
                            "{highlight.content.text}"
                          </p>
                        )}
                        {highlight.content?.image && (
                          <div className="relative h-16 w-full overflow-hidden rounded-md bg-muted">
                            <span className="absolute inset-0 flex items-center justify-center text-[10px] text-muted-foreground">
                              Image Content
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] text-primary flex items-center gap-0.5">
                            Go to <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}

          {sortedTags.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <TagIcon className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-sm">No tagged highlights yet</p>
            </div>
          )}
        </Accordion>
      </ScrollArea>
    </div>
  );
};
