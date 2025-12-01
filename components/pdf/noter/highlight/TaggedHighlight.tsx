// TaggedHighlight.tsx
import React, { useMemo, useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Tag as TagIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MyHighlight } from "@/lib/types/highlight";

interface PageOffset {
  x: number;
  y: number;
}

interface TaggedHighlightProps {
  highlight: MyHighlight;
  isScrolledTo: boolean;
  color: string;
  /** current viewer scale (1 = 100%) */
  scale?: number;
  /** page offset in viewer coordinates (defaults to 0,0) */
  pageOffset?: PageOffset;
  /** optional page container width for clamping tag button */
  pageWidth?: number;
}
// hhhh we figured out that the position returned by the hook is using like left and right instead of x1 x2 , crazy typeshit

export const TaggedHighlight: React.FC<TaggedHighlightProps> = ({
  highlight,
  isScrolledTo,
  color,
  scale = 1,
  pageOffset = { x: 0, y: 0 },
  pageWidth,
}) => {
  const [isHovered, setIsHovered] = useState(false);

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
  let tagTop = lastRect.top + lastRect.height - tagSize / 2;

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
              backgroundColor: color,
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
                borderColor: color,
                color: color,
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
              <p className="text-xs font-semibold text-muted-foreground">
                Tags:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(highlight.tags || []).length > 0 ? (
                  highlight.tags!.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-xs font-normal"
                      style={{ borderColor: color, color: color }}
                    >
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">No tags</span>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </>
  );
};
