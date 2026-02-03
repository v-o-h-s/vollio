"use strict";
"use client";

import React, { useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ListTodo, CheckCircle2, AlertCircle } from "lucide-react";

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
      0,
    );
  }, [distribution]);

  // Calculate remaining questions
  const remaining = totalQuestions - currentTotal;

  // Handle slider change safely
  const handleSliderChange = (key: string, value: number) => {
    onChange(key, value === 0 ? undefined : value);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Remaining Questions Indicator */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Questions Remaining
          </span>
          <span className="text-2xl font-bold">
            {remaining}
            <span className="text-sm font-normal text-muted-foreground ml-1">
              / {totalQuestions}
            </span>
          </span>
        </div>
        <div>
          {remaining === 0 ? (
            <div className="flex items-center gap-1.5 text-green-500">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-xs font-medium">All distributed</span>
            </div>
          ) : remaining < 0 ? (
            <div className="flex items-center gap-1.5 text-red-500">
              <AlertCircle className="w-5 h-5" />
              <span className="text-xs font-medium">Over limit</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-amber-500">
              <AlertCircle className="w-5 h-5" />
              <span className="text-xs font-medium">{remaining} left</span>
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
                  value={val}
                  onChange={(e) =>
                    onChange(
                      type.key,
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value),
                    )
                  }
                  className="w-14 h-7 text-right text-sm px-2"
                />
              </div>
              <Slider
                value={[val]}
                min={0}
                max={totalQuestions}
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
