import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { HiTag as TagIcon } from "react-icons/hi2";
import { cn } from "@/lib/utils";
import type { MyHighlight } from "@/features/document-view/types/highlight";
import { CreateHighlightDTO, Tag } from "@vollio/shared";
import { TagSelectionDialog } from "../tags/TagSelectionDialog";
import { Button } from "@/components/ui/button";
import gsap from "gsap";

interface TaggedHighlightProps {
  highlight: MyHighlight;
  isScrolledTo: boolean;
  color: string;
  updateHighlight: (
    highlightId: string,
    highlight: Partial<CreateHighlightDTO>
  ) => any;
  deleteHighlight: (highlightId: string) => any;
  userTags?: Tag[];
}

// Helper function to convert hex to rgba
const hexToRgba = (hex: string, alpha: number = 0.4): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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

export const TaggedHighlight: React.FC<TaggedHighlightProps> = ({
  highlight,
  isScrolledTo,
  color: defaultColor,
  updateHighlight,
  deleteHighlight,
  userTags = [],
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const badgeRef = useRef<HTMLButtonElement>(null);

  // Create a map for quick color lookup
  const tagColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    userTags.forEach(t => {
      map[t.label] = t.color;
    });
    return map;
  }, [userTags]);

  // Calculate mixed color based on tags
  const displayColor = useMemo(() => {
    const highlightTags = highlight.tags || [];
    if (highlightTags.length === 0) return "#FFEB3B"; // Default yellow

    const validColors = highlightTags
      .map((tagLabel) => tagColorMap[tagLabel])
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
  }, [highlight.tags, tagColorMap]);

  // Normalize rects once and convert to DOM coordinates
  const rects = useMemo(() => {
    const raw = highlight.position?.rects ?? [];
    return raw.map((r: any) => {
      return {
        left: r.left,
        top: r.top,
        width: r.width,
        height: r.height,
      };
    });
  }, [highlight.position?.rects]);

  // Calculate badge position at the end of the last rect
  const badgePosition = useMemo(() => {
    if (!rects || rects.length === 0) return null;

    const lastRect = rects[rects.length - 1];
    const badgeSize = 20;
    const gap = 4;

    let left = lastRect.left + lastRect.width + gap;
    let top = lastRect.top - gap;

    // Clamp to page width if provided
    if (typeof window !== "undefined") {
      const maxLeft = window.innerWidth - (badgeSize + 8);
      left = Math.min(left, maxLeft);
    }

    return { left, top, size: badgeSize };
  }, [rects]);

  // GSAP animation for badge hover
  useEffect(() => {
    if (!badgeRef.current) return;

    if (isHovered) {
      gsap.to(badgeRef.current, {
        scale: 1.25,
        rotation: 12,
        duration: 0.3,
        ease: "back.out(1.7)",
      });
    } else {
      gsap.to(badgeRef.current, {
        scale: 1,
        rotation: 0,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }, [isHovered]);

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
    const currentTags = highlight.tags || [];
    const uniqueTags = Array.from(new Set([...currentTags, ...newTags]));
    await updateHighlight(highlight.id, { tags: uniqueTags });
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPopoverOpen((prev) => !prev);
  };

  if (!rects || rects.length === 0) return null;

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      {/* Render highlight overlays for each rect */}
      {rects.map((rect, idx) => (
        <div
          key={`overlay-${idx}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleClick}
          style={{
            position: "absolute",
            left: `${rect.left}px`,
            top: `${rect.top}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            backgroundColor: hexToRgba(displayColor, 0.25),
            mixBlendMode: "multiply",
            borderRadius: "3px",
            cursor: "pointer",
            pointerEvents: "auto",
            zIndex: 5,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {/* Animated gradient overlay */}
          <div
            className={cn(
              "absolute inset-0 rounded-[3px] pointer-events-none transition-opacity duration-300",
              isHovered ? "opacity-100" : "opacity-0"
            )}
            style={{
              background: `linear-gradient(to right, ${hexToRgba(
                displayColor,
                0.2
              )}, ${hexToRgba(displayColor, 0.2)})`,
              mixBlendMode: "screen",
            }}
          />

          {/* Glow effect on hover */}
          <div
            className={cn(
              "absolute inset-0 rounded-[3px] pointer-events-none transition-all duration-300",
              isHovered ? "opacity-100" : "opacity-0"
            )}
            style={{
              boxShadow: `0 0 20px ${hexToRgba(
                displayColor,
                0.6
              )}, 0 0 40px ${hexToRgba(displayColor, 0.3)}`,
              border: `1px solid ${hexToRgba(displayColor, 0.8)}`,
              transform: isHovered ? "scale(1.02)" : "scale(1)",
            }}
          />

          {/* Shimmer effect */}
          {isHovered && (
            <div
              className="absolute inset-0 rounded-[3px] pointer-events-none overflow-hidden"
              style={{ mixBlendMode: "overlay" }}
            >
              <div
                className="absolute inset-0 animate-shimmer"
                style={{
                  background:
                    "linear-gradient(to right, transparent, rgba(255, 255, 255, 0.3), transparent)",
                  transform: "translateX(-100%)",
                }}
              />
            </div>
          )}

          {/* Pulse animation ring when scrolled to */}
          {isScrolledTo && (
            <div
              className="absolute inset-0 rounded-[3px] animate-ping pointer-events-none"
              style={{
                border: `2px solid ${hexToRgba(displayColor, 0.6)}`,
                animationDuration: "2s",
                animationIterationCount: "3",
              }}
            />
          )}
        </div>
      ))}

      {/* Tag button anchored at the end of last rect */}
      {badgePosition && (
        <PopoverTrigger asChild>
          <button
            ref={badgeRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="absolute rounded-full flex items-center justify-center cursor-pointer border-2 border-white dark:border-gray-900 shadow-lg"
            style={{
              left: `${badgePosition.left}px`,
              top: `${badgePosition.top}px`,
              width: `${badgePosition.size}px`,
              height: `${badgePosition.size}px`,
              background: `linear-gradient(to bottom right, ${displayColor}, ${hexToRgba(
                displayColor,
                0.8
              )})`,
              pointerEvents: "auto",
              zIndex: 20,
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
            aria-label="Open tags"
            title="Tags"
          >
            <TagIcon size={10} className="text-white drop-shadow-sm" />
          </button>
        </PopoverTrigger>
      )}

      <PopoverContent className="w-auto max-w-xs p-3" align="start">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground">Tags</p>
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
              highlight.tags!.map((tagName) => {
                const tagColor = tagColorMap[tagName] || defaultColor;
                return (
                  <Badge
                    key={tagName}
                    variant="outline"
                    className="text-xs font-normal flex items-center gap-1 pr-1"
                    style={{ borderColor: tagColor, color: tagColor }}
                  >
                    {tagName}
                    <div
                      role="button"
                      className="rounded-full hover:bg-muted p-0.5 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTag(tagName);
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

      <TagSelectionDialog
        open={isTagDialogOpen}
        onOpenChange={setIsTagDialogOpen}
        onConfirm={handleAddTags}
        initialTags={highlight.tags || []}
        userTags={userTags}
      />
    </Popover>
  );
};
