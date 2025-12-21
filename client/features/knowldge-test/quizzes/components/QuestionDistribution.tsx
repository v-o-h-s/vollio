"use strict";
"use client";

import React, { useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  ListTodo,
  CheckCircle2,
  MessageSquare,
  Type,
  AlertCircle,
} from "lucide-react";

interface QuestionType {
  key: string;
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const QUESTION_TYPES: QuestionType[] = [
  {
    key: "MCQ",
    label: "Multiple Choice",
    icon: ListTodo,
    color: "text-blue-500",
    bgColor: "bg-blue-500",
  },
  {
    key: "TRUE_FALSE",
    label: "True / False",
    icon: CheckCircle2,
    color: "text-green-500",
    bgColor: "bg-green-500",
  },
];

interface QuestionDistributionProps {
  totalQuestions: number;
  distribution: Record<string, number | undefined>;
  onChange: (key: string, value: number | undefined) => void;
  className?: string;
}

export function QuestionDistribution({
  totalQuestions,
  distribution,
  onChange,
  className,
}: QuestionDistributionProps) {
  // Calculate current total of all distributed questions
  const currentTotal = useMemo(() => {
    return Object.values(distribution).reduce(
      (acc: number, val) => acc + (val || 0),
      0
    );
  }, [distribution]);

  const chartData = useMemo(() => {
    let currentAngle = 0;
    const radius = 40;
    const circumference = 2 * Math.PI * radius;

    return QUESTION_TYPES.map((type) => {
      const count = distribution[type.key] || 0;
      const percentage = totalQuestions > 0 ? count / totalQuestions : 0;
      const strokeDasharray = `${percentage * circumference} ${circumference}`;
      const rotation = currentAngle;

      // Update for next segment (using 360 degrees)
      currentAngle += percentage * 360;

      return {
        ...type,
        count,
        percentage,
        strokeDasharray,
        rotation,
      };
    });
  }, [distribution, totalQuestions]);

  // Handle slider change safely
  const handleSliderChange = (key: string, value: number) => {
    onChange(key, value === 0 ? undefined : value);
  };

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-8", className)}>
      {/* Chart Section */}
      <div className="flex flex-col items-center justify-center relative">
        <div className="relative w-48 h-48">
          {/* Base Circle (Background) */}
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full transform -rotate-90"
          >
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="10"
              className="text-muted/20"
            />
            {/* Segments */}
            {chartData.map((segment) => (
              <circle
                key={segment.key}
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="10"
                strokeDasharray={segment.strokeDasharray}
                strokeDashoffset={0}
                className={cn(
                  "transition-all duration-500 ease-out",
                  segment.color
                )}
                style={{
                  transformBox: "fill-box",
                  transformOrigin: "center",
                  transform: `rotate(${segment.rotation}deg)`,
                }}
                strokeLinecap="round"
              />
            ))}
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold">{currentTotal}</span>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              / {totalQuestions}
            </span>
          </div>
        </div>

        {/* Status Message */}
        <div className="mt-4 text-center h-6">
          {currentTotal !== totalQuestions ? (
            <div className="text-xs text-amber-500 font-medium flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-3.5 h-3.5" />
              Adjust counts to match total
            </div>
          ) : (
            <div className="text-xs text-green-500 font-medium flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Perfectly distributed!
            </div>
          )}
        </div>
      </div>

      {/* Controls Section */}
      <div className="space-y-5">
        {QUESTION_TYPES.map((type) => {
          const val = distribution[type.key] || 0;
          return (
            <div key={type.key} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", type.bgColor)} />
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {type.label}
                  </Label>
                </div>
                <Input
                  type="number"
                  min={0}
                  max={totalQuestions}
                  value={val || ""}
                  onChange={(e) =>
                    onChange(
                      type.key,
                      e.target.value === "" ? undefined : Number(e.target.value)
                    )
                  }
                  className="w-12 h-6 text-right text-xs p-1"
                />
              </div>
              <Slider
                value={[val]}
                min={0}
                max={totalQuestions} // Allow going up to max individually, though user should balance
                step={1}
                onValueChange={(vals) => handleSliderChange(type.key, vals[0])}
                className={cn("py-1 [&>.absolute]:bg-primary/20")}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
