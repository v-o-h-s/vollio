"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

export interface ContextMenuAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "destructive";
}

export interface ContextMenuSection {
  actions: ContextMenuAction[];
}

interface ContextMenuProps {
  x: number;
  y: number;
  sections: ContextMenuSection[];
  onClose: () => void;
}

export function ContextMenu({ x, y, sections, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[200px] rounded-md border bg-popover p-1 shadow-md"
      style={{
        top: `${y}px`,
        left: `${x}px`,
      }}
    >
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex}>
          {sectionIndex > 0 && <div className="my-1 h-px bg-border" />}
          {section.actions.map((action, actionIndex) => (
            <Button
              key={actionIndex}
              variant="ghost"
              className={`w-full justify-start gap-2 h-9 px-2 ${
                action.variant === "destructive" ? "text-destructive hover:text-destructive" : ""
              }`}
              onClick={() => {
                action.onClick();
                onClose();
              }}
            >
              {action.icon}
              <span>{action.label}</span>
            </Button>
          ))}
        </div>
      ))}
    </div>
  );
}
