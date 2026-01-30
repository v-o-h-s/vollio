"use client";

import { Skeleton } from "@/components/ui/skeleton";
import React, { useRef, useEffect } from "react";
import gsap from "gsap";

export function FilesSkeleton() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".skeleton-item",
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.05,
          ease: "power2.out",
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="grid bg-card/20 overflow-y-hidden overflow-x-hidden h-[550px] grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 xl:grid-cols-10 gap-4 p-4 auto-rows-max shadow-xs border rounded-xl"
    >
      {Array.from({ length: 18 }).map((_, i) => (
        <div
          key={i}
          className="skeleton-item flex flex-col items-center justify-center h-[140px] w-full rounded-2xl bg-muted/5 border border-transparent gap-4 opacity-0"
        >
          <Skeleton className="h-12 w-12 rounded-lg opacity-40 shrink-0" />
          <div className="space-y-2 flex flex-col items-center w-full px-4">
            <Skeleton className="h-3 w-full rounded opacity-40" />
            {i % 3 === 0 && (
              <Skeleton className="h-2 w-1/2 rounded opacity-20" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function DirectorySkeleton() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-[700px] overflow-hidden rounded-xl p-4 opacity-0"
    >
      {/* Toolbar Skeleton */}
      <div className="flex-none pb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Skeleton className="h-10 w-full max-w-md rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
      </div>

      {/* Breadcrumb Skeleton */}
      <div className="flex-none pb-2">
        <Skeleton className="h-6 w-48 rounded" />
      </div>

      {/* Grid Skeleton */}
      <div className="flex-1 rounded-lg overflow-hidden relative">
        <FilesSkeleton />
      </div>
    </div>
  );
}
