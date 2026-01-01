import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button, Popover, PopoverContent, PopoverTrigger } from "./ui";
import { Info } from "lucide-react";
import { Switch } from "@radix-ui/react-switch";
import { FaHighlighter as Highlighter } from "react-icons/fa";
import { RiRobot3Fill as RobotIcon } from "react-icons/ri";
export const FeatureInfoDual = ({
  featureA,
  featureB,
  isInline = false,
}: {
  featureA: { title: string; description: string };
  featureB: { title: string; description: string };
  isInline?: boolean;
}) => {
  const [isSecond, setIsSecond] = useState(false);
  const current = isSecond ? featureB : featureA;

  return (
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
          <Info
            className={cn(
              isInline ? "h-3 w-3" : "h-2.5 w-2.5",
              "text-muted-foreground"
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 shadow-2xl border-muted/50 backdrop-blur-xl"
        side="top"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-muted/30 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-500/10">
                <Info className="h-4 w-4 text-purple-500" />
              </div>
              <h4 className="font-semibold leading-none">{current.title}</h4>
            </div>
            <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-full px-2 border border-muted/20">
              <span
                className={cn(
                  "text-[10px] font-bold transition-colors",
                  !isSecond ? "text-purple-500" : "text-muted-foreground"
                )}
              >
                V1
              </span>
              <Switch
                checked={isSecond}
                onCheckedChange={setIsSecond}
                className="scale-75 data-[state=checked]:bg-purple-500"
              />
              <span
                className={cn(
                  "text-[10px] font-bold transition-colors",
                  isSecond ? "text-purple-500" : "text-muted-foreground"
                )}
              >
                V2
              </span>
            </div>
          </div>

          <div className="space-y-2 px-1">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {current.description}
            </p>
          </div>

          <div className="aspect-video rounded-xl bg-muted/30 flex flex-col items-center justify-center text-sm text-muted-foreground border border-muted/50 transition-colors relative overflow-hidden group/video">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent" />
            <div className="mb-2 p-3 rounded-full bg-background/80 shadow-sm border border-muted/50 z-10">
              <RobotIcon className="h-5 w-5 text-purple-500" />
            </div>
            <span className="font-medium z-10">Interactive Demo</span>
            <span className="text-[10px] opacity-60 z-10">
              Previewing {current.title}
            </span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export const FeatureInfo = ({
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
        <Info
          className={cn(
            isInline ? "h-3 w-3" : "h-2.5 w-2.5",
            "text-muted-foreground"
          )}
        />
      </Button>
    </PopoverTrigger>
    <PopoverContent
      className="w-80 shadow-2xl border-muted/50 backdrop-blur-xl"
      side="top"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-semibold leading-none flex items-center gap-2">
            <Info className="h-4 w-4 text-purple-500" />
            {title}
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
        <div className="aspect-video rounded-lg bg-muted/50 flex flex-col items-center justify-center text-sm text-muted-foreground border-2 border-dashed border-muted-foreground/20 group-hover:border-purple-500/20 transition-colors">
          <div className="mb-2 p-2 rounded-full bg-background/50 shadow-inner">
            <RobotIcon className="h-5 w-5 text-purple-500/40" />
          </div>
          <span>Tutorial video coming soon</span>
        </div>
      </div>
    </PopoverContent>
  </Popover>
);