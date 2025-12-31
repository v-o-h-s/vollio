"use client";

import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onDelete: () => void;
}

export function ContextMenu({ x, y, onClose, onDelete }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: y, left: x });

  useLayoutEffect(() => {
    if (menuRef.current) {
      const { innerWidth, innerHeight } = window;
      const { offsetWidth, offsetHeight } = menuRef.current;

      let adjustedX = x;
      let adjustedY = y;

      // Ensure menu stays within viewport
      if (x + offsetWidth > innerWidth) {
        adjustedX = innerWidth - offsetWidth - 8;
      }
      if (adjustedX < 8) adjustedX = 8;

      if (y + offsetHeight > innerHeight) {
        adjustedY = innerHeight - offsetHeight - 8;
      }
      if (adjustedY < 8) adjustedY = 8;

      setPosition({ top: adjustedY, left: adjustedX });
    }
  }, [x, y]);

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
      className="fixed z-[1000] min-w-[180px] rounded-md border border-border bg-white dark:bg-black p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-100"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <Button
        variant="ghost"
        className="w-full justify-start gap-3 h-10 px-3 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
          onClose();
        }}
      >
        <Trash2 className="h-4.5 w-4.5 text-red-600 dark:text-red-500" />
        <div className="text-[14px] font-semibold">Delete Highlight</div>
      </Button>
    </div>
  );
}
