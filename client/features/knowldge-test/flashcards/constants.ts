import { Brain } from "lucide-react";

// Local enum-like constants mirroring server enums
export const difficulties = [
  {
    key: "easy",
    label: "Easy",
    description: "Focus on basics",
    icon: Brain,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    key: "medium",
    label: "Medium",
    description: "Standard level",
    icon: Brain,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    key: "hard",
    label: "Hard",
    description: "Challenging",
    icon: Brain,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  },
] as const;

export const explanationLevels = [
  {
    key: "none",
    label: "None",
    description: "Answers only",
  },
  {
    key: "brief",
    label: "Brief",
    description: "Key points",
  },
  {
    key: "detailed",
    label: "Detailed",
    description: "Full explanation",
  },
] as const;
