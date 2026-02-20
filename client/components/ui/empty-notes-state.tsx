"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
  FileText,
  Plus,
  Search,
  Sparkles,
  BookOpen,
  Layers,
  MousePointer2,
} from "lucide-react";
import { Button } from "./button";

interface EmptyNotesStateProps {
  onCreateNote: () => void;
  isSearch?: boolean;
  searchQuery?: string;
  onClearSearch?: () => void;
}

/**
 * Premium Empty State using GSAP
 * Replaces Framer Motion with High Performance GSAP animations
 */
export function EmptyNotesState({
  onCreateNote,
  isSearch = false,
  searchQuery = "",
  onClearSearch,
}: EmptyNotesStateProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const ripplesRef = useRef<(HTMLDivElement | null)[]>([]);
  const featuresRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Ripples Animation
      ripplesRef.current.forEach((ripple, i) => {
        if (!ripple) return;
        gsap.to(ripple, {
          scale: 2.5,
          opacity: 0,
          duration: 3,
          delay: i * 1,
          repeat: -1,
          ease: "power2.out",
        });
      });

      // 2. Main Entrance
      const tl = gsap.timeline();

      tl.fromTo(
        iconRef.current,
        { scale: 0, opacity: 0, rotate: -20 },
        {
          scale: 1,
          opacity: 1,
          rotate: 0,
          duration: 0.8,
          ease: "back.out(1.7)",
        },
      )
        .fromTo(
          [titleRef.current, textRef.current, actionsRef.current],
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" },
          "-=0.4",
        )
        .fromTo(
          ".feature-item",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" },
          "-=0.2",
        );

      // 3. Subtle floating on icon
      gsap.to(iconRef.current, {
        y: "-=10",
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  if (isSearch) {
    return (
      <div
        ref={containerRef}
        className="flex flex-col items-center justify-center py-20 px-4 text-center"
      >
        <div ref={iconRef} className="relative mb-6">
          <div className="w-24 h-24 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent" />
            <Search size={40} className="text-zinc-500 relative z-10" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary border border-primary/30 flex items-center justify-center shadow-lg">
            <Sparkles size={14} className="text-primary-foreground" />
          </div>
        </div>

        <h3 ref={titleRef} className="text-2xl font-bold text-foreground mb-2">
          No results for "{searchQuery}"
        </h3>
        <p ref={textRef} className="text-muted-foreground max-w-sm mb-8">
          We couldn't find any notes matching your search. Try different
          keywords or clear the filter.
        </p>

        <div
          ref={actionsRef}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <Button
            variant="outline"
            onClick={onClearSearch}
            className="h-11 px-6 rounded-xl border-zinc-800 hover:bg-zinc-900 transition-all duration-300"
          >
            Clear Search
          </Button>
          <Button
            onClick={onCreateNote}
            className="h-11 px-6 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
          >
            <Plus size={18} className="mr-2" />
            Create New Note
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-zinc-900/20 backdrop-blur-md p-8 md:p-20"
    >
      {/* Decorative Ripples */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            ref={(el) => {
              ripplesRef.current[i] = el;
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/20 w-full h-full scale-0 opacity-0"
          />
        ))}
      </div>

      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
        <div ref={iconRef} className="mb-10">
          <div className="relative group">
            <div className="absolute -inset-8 bg-linear-to-tr from-primary/20 via-blue-500/20 to-purple-500/20 rounded-[40px] blur-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-700 pointer-events-none" />
            <div className="relative w-32 h-40 bg-zinc-950 border border-white/10 rounded-3xl flex items-center justify-center shadow-2xl overflow-hidden transform group-hover:rotate-3 transition-transform duration-500">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-primary to-blue-500" />
              <FileText
                size={56}
                className="text-white group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-6 right-6">
                <Sparkles size={18} className="text-primary opacity-50" />
              </div>
              <div className="absolute bottom-6 left-6 right-6 space-y-2">
                <div className="h-1 w-full bg-white/5 rounded-full" />
                <div className="h-1 w-2/3 bg-white/5 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        <h3
          ref={titleRef}
          className="text-5xl font-black tracking-tighter text-white mb-6 leading-tight"
        >
          Your knowledge, <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-blue-400 to-purple-500">
            unlocked.
          </span>
        </h3>

        <p
          ref={textRef}
          className="text-zinc-400 text-xl leading-relaxed mb-12 max-w-lg mx-auto"
        >
          Convert your static thoughts into a dynamic AI-powered second brain.
          Start building your personal research library today.
        </p>

        <div
          ref={actionsRef}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <Button
            onClick={onCreateNote}
            size="lg"
            className="h-16 px-10 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-bold shadow-xl hover:-translate-y-1.5 transition-all duration-300"
          >
            <Plus size={24} className="mr-2" />
            Create First Note
          </Button>

          <Button
            variant="outline"
            className="h-16 px-10 rounded-2xl border-white/10 text-white hover:bg-white/5 text-lg font-semibold transition-all duration-300"
          >
            <BookOpen size={20} className="mr-3 text-primary" />
            Quick Guide
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mt-20 w-full pt-16 border-t border-white/5">
          {[
            {
              Icon: Layers,
              color: "primary",
              title: "Clean Structure",
              text: "Organize notes with nested folders and tags.",
            },
            {
              Icon: MousePointer2,
              color: "blue-500",
              title: "Live Linking",
              text: "Tag documents and other notes instantly.",
            },
            {
              Icon: Sparkles,
              color: "purple-500",
              title: "AI Context",
              text: "Smart suggestions based on your library.",
            },
          ].map((feat, i) => (
            <div
              key={i}
              className="feature-item group flex flex-col items-center gap-4 transition-all duration-300 hover:scale-105"
            >
              <div
                className={`w-14 h-14 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center shadow-lg group-hover:border-${feat.color}/50 group-hover:shadow-${feat.color}/10 transition-all duration-500`}
              >
                <feat.Icon size={24} className={`text-${feat.color}`} />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-zinc-100">{feat.title}</h4>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  {feat.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
