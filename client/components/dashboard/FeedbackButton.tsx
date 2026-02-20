"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const PHRASES = [
  "Suggest Feature",
  "Report Bug",
  "contact us",
  "Help us improve",
  "report a problem",
];

export function FeedbackButton() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const router = useRouter();
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

          <Sparkles className="text-white w-3.5 h-3.5  animate-pulse shrink-0" />
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

      <Button
        onClick={() => router.push("/support")}
        size="icon"
        className="w-14 h-14 rounded-[22px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] hover:shadow-primary/40 hover:scale-110 active:scale-95 transition-all duration-500 bg-primary text-primary-foreground relative group/btn overflow-hidden border border-white/10"
      >
        {/* Glossy/Glass effect */}
        <div className="absolute inset-0 bg-linear-to-tr from-white/20 via-transparent to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />

        <MessageSquare className="w-6 h-6 z-10 group-hover/btn:scale-110 transition-transform duration-500" />

        {/* Outer Glow */}
        <div className="absolute inset-0 rounded-[22px] shadow-[inset_0_0_20px_rgba(255,255,255,0.2)] opacity-0 group-hover/btn:opacity-100 transition-opacity" />
      </Button>
    </div>
  );
}
