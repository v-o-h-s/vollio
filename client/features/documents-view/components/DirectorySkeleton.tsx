"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

export function DirectorySkeleton() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col h-[700px] overflow-hidden rounded-xl p-4"
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
      <div className="flex-1 rounded-lg overflow-hidden relative border bg-card/20 p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 xl:grid-cols-10 gap-4 auto-rows-max">
          {Array.from({ length: 18 }).map((_, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="flex flex-col items-center justify-center h-[140px] w-[140px] rounded-2xl bg-muted/5 border border-transparent gap-4"
            >
              <Skeleton className="h-12 w-12 rounded-lg opacity-40 shrink-0" />
              <div className="space-y-2 flex flex-col items-center w-full px-4">
                <Skeleton className="h-3 w-full rounded opacity-40" />
                {i % 3 === 0 && (
                  <Skeleton className="h-2 w-1/2 rounded opacity-20" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
