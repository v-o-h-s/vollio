"use client";
import React, { useState, useRef } from "react";

export default function ResizableBox() {
  const [size, setSize] = useState({ width: 300, height: 200 });
  const boxRef = useRef<HTMLDivElement | null>(null);
  const isResizing = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = size.width;
    const startHeight = size.height;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const newWidth = startWidth + (e.clientX - startX);
      const newHeight = startHeight + (e.clientY - startY);
      setSize({
        width: Math.max(100, newWidth),
        height: Math.max(100, newHeight),
      });
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      ref={boxRef}
      className="relative bg-gray-200 border border-gray-400"
      style={{ width: size.width, height: size.height }}
    >
      <div className="p-2">
        Resizable Box ({size.width}×{size.height})
      </div>

      {/* Resize Handle */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute bottom-0 right-0 w-3 h-3 bg-gray-600 cursor-se-resize"
      />
    </div>
  );
}
