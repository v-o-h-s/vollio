"use client";

import { useEffect, useState } from "react";
import {
  MessageSquare,
  Bug,
  Lightbulb,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const PHRASES = [
  "Suggest Feature",
  "Report Bug",
  "Issue pls",
  "Help us improve",
];

export function FeedbackButton() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % PHRASES.length);
        setFade(true);
      }, 500);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3 group">
      {/* Premium Floating Sign - Always Visible & Rotating */}
      <div className="relative animate-in fade-in slide-in-from-bottom-2 duration-1000 pointer-events-none">
        <div className="relative px-4 py-2 rounded-2xl bg-zinc-900/90 backdrop-blur-xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex items-center gap-2 overflow-hidden min-w-[180px] justify-center">
          {/* Animated Gradient Border Overlay */}
          <div className="absolute inset-0 bg-linear-to-r from-primary/10 via-transparent to-primary/10 animate-pulse" />

          <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse shrink-0" />
          <span
            className={cn(
              "text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-100 relative z-10 transition-all duration-500",
              fade
                ? "opacity-100 blur-0 translate-y-0"
                : "opacity-0 blur-sm -translate-y-2",
            )}
          >
            {PHRASES[index]}
          </span>
        </div>

        {/* Triangle Pointer */}
        <div className="absolute -bottom-1 right-6 w-3 h-3 bg-zinc-900 border-r border-b border-white/10 transform rotate-45" />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            className="w-14 h-14 rounded-[22px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] hover:shadow-primary/40 hover:scale-110 active:scale-95 transition-all duration-500 bg-primary text-primary-foreground relative group/btn overflow-hidden border border-white/10"
          >
            {/* Glossy/Glass effect */}
            <div className="absolute inset-0 bg-linear-to-tr from-white/20 via-transparent to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />

            <MessageSquare className="w-6 h-6 z-10 group-hover/btn:scale-110 transition-transform duration-500" />

            {/* Outer Glow */}
            <div className="absolute inset-0 rounded-[22px] shadow-[inset_0_0_20px_rgba(255,255,255,0.2)] opacity-0 group-hover/btn:opacity-100 transition-opacity" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          side="top"
          sideOffset={16}
          className="w-64 p-2 bg-zinc-950/95 backdrop-blur-2xl border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] rounded-[28px] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        >
          <div className="px-4 py-3 mb-1 border-b border-white/5">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/80">
              Feedback Hub
            </p>
          </div>

          <DropdownMenuItem className="flex items-center gap-3 px-4 py-4 rounded-[20px] hover:bg-white/5 cursor-pointer transition-all duration-300 group/item outline-none focus:bg-white/5 text-slate-100">
            <div className="p-2.5 rounded-xl bg-amber-500/10 group-hover/item:bg-amber-500/20 transition-colors">
              <Lightbulb className="w-4 h-4 text-amber-500 group-hover/item:scale-110 group-hover/item:rotate-12 transition-all" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm">Suggest Feature</span>
              <span className="text-[10px] text-zinc-500 group-hover/item:text-zinc-400 transition-colors">
                Improve Vollio with your ideas
              </span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem className="flex items-center gap-3 px-4 py-4 rounded-[20px] hover:bg-white/5 cursor-pointer transition-all duration-300 group/item outline-none focus:bg-white/5 text-slate-100">
            <div className="p-2.5 rounded-xl bg-red-500/10 group-hover/item:bg-red-500/20 transition-colors">
              <Bug className="w-4 h-4 text-red-500 group-hover/item:scale-110 group-hover/item:rotate-12 transition-all" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm">Report Bug</span>
              <span className="text-[10px] text-zinc-500 group-hover/item:text-zinc-400 transition-colors">
                Help us squash bugs
              </span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem className="flex items-center gap-3 px-4 py-4 rounded-[20px] hover:bg-white/5 cursor-pointer transition-all duration-300 group/item outline-none focus:bg-white/5 text-slate-100">
            <div className="p-2.5 rounded-xl bg-blue-500/10 group-hover/item:bg-blue-500/20 transition-colors">
              <AlertCircle className="w-4 h-4 text-blue-500 group-hover/item:scale-110 group-hover/item:rotate-12 transition-all" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm">Issue</span>
              <span className="text-[10px] text-zinc-500 group-hover/item:text-zinc-400 transition-colors">
                Get help with an account issue
              </span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
