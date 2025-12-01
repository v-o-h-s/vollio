import React, { useMemo, useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Tag as TagIcon, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MyHighlight } from "@/lib/types/highlight";
import { CreateHighlightDto } from "@/lib/dto/createHighLightDto";
import { TagSelectionDialog } from "./TagSelectionDialog";
import { Button } from "@/components/ui/button";

interface PageOffset {
  x: number;
  y: number;
}

interface TaggedHighlightProps {
  highlight: MyHighlight;
  isScrolledTo: boolean;
  color: string;
  scale?: number;
  pageOffset?: PageOffset;
  pageWidth?: number;
  updateHighlight: (
    highlightId: string,
    highlight: Partial<CreateHighlightDto>
  ) => any;
  deleteHighlight: (highlightId: string) => any;
}
// todo , in the future in the settings add color customization there and tags custom
const TAG_COLORS: Record<string, string> = {
  Definition: "#3b82f6", // blue-500
  Example: "#22c55e", // green-500
  "Important detail": "#ef4444", // red-500
  "Key idea": "#a855f7", // purple-500
  "To revisit": "#f97316", // orange-500
  "Step / Process": "#14b8a6", // teal-500
};

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

const rgbToHex = (r: number, g: number, b: number) => {
  return (
    "#" +
    ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
  );
};

const mixColors = (tags: string[]) => {
  if (!tags || tags.length === 0) return "#FFEB3B"; // Default yellow

  const validColors = tags
    .map((tag) => TAG_COLORS[tag])
    .filter((c) => c !== undefined);

  if (validColors.length === 0) return "#FFEB3B";
  if (validColors.length === 1) return validColors[0];

  let r = 0,
    g = 0,
    b = 0;

  validColors.forEach((hex) => {
    const rgb = hexToRgb(hex);
    if (rgb) {
      r += rgb.r;
      g += rgb.g;
      b += rgb.b;
    }
  });

  const count = validColors.length;
  return rgbToHex(
    Math.round(r / count),
    Math.round(g / count),
    Math.round(b / count)
  );
};

export const TaggedHighlight: React.FC<TaggedHighlightProps> = ({
  highlight,
  isScrolledTo,
  color: defaultColor, // We might ignore this if we use tag colors
  scale = 1,
  pageOffset = { x: 0, y: 0 },
  pageWidth,
  updateHighlight,
  deleteHighlight,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);

  // Calculate mixed color based on tags
  const displayColor = useMemo(() => {
    return mixColors(highlight.tags || []);
  }, [highlight.tags]);

  // normalize rects once and convert to DOM coordinates (scale + page offset)
  const rects = useMemo(() => {
    const raw = highlight.position?.rects ?? [];
    return raw.map((r: any) => {
      return {
        // convert to pixels in overlay coordinate space
        left: r.left * scale + (pageOffset?.x ?? 0),
        top: r.top * scale + (pageOffset?.y ?? 0),
        width: r.width * scale,
        height: r.height * scale,
      };
    });
  }, [highlight.position?.rects, scale, pageOffset?.x, pageOffset?.y]);

  if (!rects || rects.length === 0) return null;
  const lastRect = rects[rects.length - 1];

  // visual underline thickness
  const baseHeight = 2;
  const underlineHeight = isHovered ? Math.max(3, baseHeight + 1) : baseHeight;

  // tag button position (appear to the right of last rect)
  const tagGap = 2; // px gap from underline
  const tagSize = 20; // px (width/height of button)
  let tagLeft = lastRect.left + lastRect.width + tagGap;
  let tagTop = lastRect.top + lastRect.height;

  // clamp to page width if provided
  if (pageWidth) {
    const maxLeft = pageWidth - (tagSize + 8);
    tagLeft = Math.min(tagLeft, maxLeft);
  } else if (typeof window !== "undefined") {
    // fallback clamp to viewport
    const maxLeft = window.innerWidth - (tagSize + 8);
    tagLeft = Math.min(tagLeft, maxLeft);
  }

  // small upward adjustment so the button sits slightly above the underline
  tagTop = tagTop - Math.max(6, underlineHeight);

  const handleRemoveTag = async (tagToRemove: string) => {
    const currentTags = highlight.tags || [];
    const newTags = currentTags.filter((t) => t !== tagToRemove);

    if (newTags.length === 0) {
      await deleteHighlight(highlight.id);
    } else {
      await updateHighlight(highlight.id, { tags: newTags });
    }
  };

  const handleAddTags = async (newTags: string[]) => {
    // Merge new tags with existing ones, avoiding duplicates
    const currentTags = highlight.tags || [];
    const uniqueTags = Array.from(new Set([...currentTags, ...newTags]));
    await updateHighlight(highlight.id, { tags: uniqueTags });
  };

  return (
    <>
      {/* per-rect underlines */}
      {rects.map((r, idx) => {
        // adjust top so underline sits at bottom of rect
        const top = r.top + r.height - underlineHeight;
        return (
          <div
            key={idx}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              position: "absolute",
              left: `${r.left}px`,
              top: `${top}px`,
              width: `${r.width}px`,
              height: `${underlineHeight}px`,
              backgroundColor: displayColor,
              pointerEvents: "auto",
              transition:
                "height 0.12s ease, top 0.12s ease, transform 0.12s ease",
              cursor: "pointer",
              zIndex: 6,
              borderRadius: underlineHeight, // rounded ends
            }}
            // this prevents the popover from closing when clicking the underline
            onClick={(e) => e.stopPropagation()}
          />
        );
      })}

      {/* tag button anchored at the end of last rect */}
      {lastRect && (
        <Popover>
          <PopoverTrigger asChild>
            <button
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className={cn(
                "absolute z-20 flex items-center justify-center rounded-full border bg-background shadow transition-transform duration-150",
                isHovered ? "scale-105 shadow-lg" : "scale-100"
              )}
              style={{
                left: `${tagLeft}px`,
                top: `${tagTop}px`,
                width: `${tagSize}px`,
                height: `${tagSize}px`,
                borderColor: displayColor,
                color: displayColor,
                pointerEvents: "auto",
              }}
              onClick={(e) => {
                // don't let click bubble to PDF selection
                e.stopPropagation();
              }}
              aria-label="Open tags"
              title="Tags"
            >
              <TagIcon size={10} />
            </button>
          </PopoverTrigger>

          <PopoverContent className="w-auto max-w-xs p-3" align="start">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground">
                  Tags
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 rounded-full hover:bg-muted"
                  onClick={() => setIsTagDialogOpen(true)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(highlight.tags || []).length > 0 ? (
                  highlight.tags!.map((tag) => {
                    const tagColor = TAG_COLORS[tag] || defaultColor;
                    return (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs font-normal flex items-center gap-1 pr-1"
                        style={{ borderColor: tagColor, color: tagColor }}
                      >
                        {tag}
                        <div
                          role="button"
                          className="rounded-full hover:bg-muted p-0.5 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveTag(tag);
                          }}
                        >
                          <X size={10} />
                        </div>
                      </Badge>
                    );
                  })
                ) : (
                  <span className="text-xs text-muted-foreground">No tags</span>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}

      <TagSelectionDialog
        open={isTagDialogOpen}
        onOpenChange={setIsTagDialogOpen}
        onConfirm={handleAddTags}
        initialTags={highlight.tags || []}
      />
    </>
  );
};
