"use client";

import { LucideIcon } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface SimpleEmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function SimpleEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: SimpleEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-20 text-center",
        className,
      )}
    >
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mb-6 border border-border/50">
          <Icon className="w-8 h-8 text-muted-foreground/50" />
        </div>
      )}
      <div className="space-y-2 mb-8">
        <h3 className="text-xl font-bold tracking-tight text-foreground">
          {title}
        </h3>
        <p className="text-muted-foreground max-w-[280px] mx-auto text-sm leading-relaxed">
          {description}
        </p>
      </div>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          size="lg"
          className="rounded-xl shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all font-semibold"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
