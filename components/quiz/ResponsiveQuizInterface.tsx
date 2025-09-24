"use client";

import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { QuizGeneratorInterface } from "./QuizGeneratorInterface";
import { MobileQuizGeneratorInterface } from "./MobileQuizGeneratorInterface";

interface ResponsiveQuizInterfaceProps {
  className?: string;
}

/**
 * Responsive wrapper that automatically switches between desktop and mobile quiz interfaces
 * Uses device detection to provide optimal experience for each screen size
 */
export function ResponsiveQuizInterface({ className }: ResponsiveQuizInterfaceProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileQuizGeneratorInterface className={className} />;
  }

  return <QuizGeneratorInterface className={className} />;
}