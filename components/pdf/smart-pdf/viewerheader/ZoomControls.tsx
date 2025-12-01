"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ZoomIn, ZoomOut } from "lucide-react";

interface ZoomControlsProps {
  pdfViewerRef?: React.RefObject<any>;
}

export function ZoomControls({ pdfViewerRef }: ZoomControlsProps) {
  const getMagnificationModule = () => {
    const viewer = pdfViewerRef?.current;
    return viewer?.magnification ?? viewer?.magnificationModule;
  };

  const [zoomLevel, setZoomLevel] = useState(100);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("100");
  const inputRef = useRef<HTMLInputElement>(null);

  // Update zoom level from PDF viewer
  useEffect(() => {
    if (pdfViewerRef?.current) {
      const viewer = pdfViewerRef.current;

      const updateZoomLevel = () => {
        try {
          const currentZoom = viewer.zoomPercentage || 100;
          setZoomLevel(Math.round(currentZoom));
        } catch (error) {
          console.warn("Could not get zoom level from PDF viewer:", error);
        }
      };

      // Update immediately
      updateZoomLevel();

      // Set up interval to keep zoom level updated
      const interval = setInterval(updateZoomLevel, 1000);
      return () => clearInterval(interval);
    }
  }, [pdfViewerRef]);

  const handleZoomIn = () => {
    const magnification = getMagnificationModule();
    if (!magnification) {
      console.warn("Magnification module is not available on the PDF viewer instance.");
      return;
    }

    try {
      magnification.zoomIn();
    } catch (error) {
      console.error("Error zooming in:", error);
    }
  };

  const handleZoomOut = () => {
    const magnification = getMagnificationModule();
    if (!magnification) {
      console.warn("Magnification module is not available on the PDF viewer instance.");
      return;
    }

    try {
      magnification.zoomOut();
    } catch (error) {
      console.error("Error zooming out:", error);
    }
  };

  const handleResetZoom = () => {
    const magnification = getMagnificationModule();
    if (!magnification) {
      console.warn("Magnification module is not available on the PDF viewer instance.");
      return;
    }

    try {
      magnification.fitToPage();
    } catch (error) {
      console.error("Error resetting zoom:", error);
    }
  };

  const handleZoomClick = () => {
    setIsEditing(true);
    setInputValue(zoomLevel.toString());
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleZoomInputSubmit = () => {
    const zoomValue = parseInt(inputValue);
    const magnification = getMagnificationModule();
    if (zoomValue >= 10 && zoomValue <= 400 && magnification) {
      try {
        magnification.zoomTo(zoomValue);
        setZoomLevel(zoomValue);
      } catch (error) {
        console.error("Error setting custom zoom:", error);
      }
    }
    setIsEditing(false);
  };

  const handleZoomInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleZoomInputSubmit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setInputValue(zoomLevel.toString());
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleZoomOut}
        className="h-6 w-6 p-0 hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-200 rounded cursor-pointer"
        title="Zoom Out (Ctrl+-)"
      >
        <ZoomOut size={12} />
      </Button>

      {isEditing ? (
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleZoomInputSubmit}
          onKeyDown={handleZoomInputKeyDown}
          className="w-14 h-6 text-xs text-center bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10 rounded px-1"
          placeholder="10-400"
        />
      ) : (
        <button
          onClick={handleZoomClick}
          onDoubleClick={handleResetZoom}
          className="text-xs font-medium text-foreground/80 hover:text-foreground transition-colors cursor-pointer px-2 py-0.5 rounded hover:bg-white/10 dark:hover:bg-white/5 min-w-[3rem] text-center"
          title="Click to edit zoom (10-400%), Double-click or Ctrl+0 to reset"
        >
          {zoomLevel}%
        </button>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={handleZoomIn}
        className="h-6 w-6 p-0 hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-200 rounded cursor-pointer"
        title="Zoom In (Ctrl+=)"
      >
        <ZoomIn size={12} />
      </Button>
    </div>
  );
}
