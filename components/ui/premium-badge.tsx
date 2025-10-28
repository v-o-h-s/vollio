"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Crown, Star, Zap } from "lucide-react";

interface PremiumBadgeProps {
  variant?: "default" | "crown" | "star" | "zap";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PremiumBadge({ 
  variant = "default", 
  size = "md",
  className = "" 
}: PremiumBadgeProps) {
  const icons = {
    default: null,
    crown: Crown,
    star: Star,
    zap: Zap,
  };

  const sizes = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-xs px-2 py-1",
    lg: "text-sm px-3 py-1.5",
  };

  const iconSizes = {
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  const Icon = icons[variant];

  return (
    <Badge 
      className={`
        bg-gradient-to-r from-amber-500 to-orange-500 
        hover:from-amber-600 hover:to-orange-600 
        text-white border-0 font-medium
        ${sizes[size]} 
        ${className}
      `}
    >
      {Icon && <Icon className={`${iconSizes[size]} mr-1`} />}
      Premium
    </Badge>
  );
}