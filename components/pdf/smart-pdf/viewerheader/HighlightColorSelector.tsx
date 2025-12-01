"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const HIGHLIGHT_COLORS = [
  { name: "Yellow", value: "#FFEB3B", rgb: "255, 235, 59" },
  { name: "Green", value: "#4CAF50", rgb: "76, 175, 80" },
  { name: "Blue", value: "#2196F3", rgb: "33, 150, 243" },
  { name: "Pink", value: "#E91E63", rgb: "233, 30, 99" },
  { name: "Orange", value: "#FF9800", rgb: "255, 152, 0" },
];

interface HighlightColorSelectorProps {
  currentColor: string;
  onColorChange: (color: string) => void;
}

export function HighlightColorSelector({
  currentColor,
  onColorChange,
}: HighlightColorSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 cursor-pointer">
          <div
            className="w-4 h-4 rounded border border-white/30"
            style={{ backgroundColor: currentColor }}
          />
          <span className="text-xs">Highlight</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="p-2">
          <p className="text-xs font-medium mb-2 text-muted-foreground">
            Select Highlight Color
          </p>
          <div className="grid grid-cols-5 gap-2">
            {HIGHLIGHT_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => onColorChange(color.value)}
                className={`w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform cursor-pointer ${
                  currentColor === color.value
                    ? "border-primary ring-2 ring-primary ring-offset-2"
                    : "border-border"
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
