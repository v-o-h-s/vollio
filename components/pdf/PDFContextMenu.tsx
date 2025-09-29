"use client";

import React, { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  Share, 
  Star, 
  Copy,
  FolderOpen,
  Info
} from "lucide-react";

interface PDFContextMenuProps {
  x: number;
  y: number;
  pdfId: string;
  onClose: () => void;
  onDelete: (pdfId: string) => void;
  onRename: (pdfId: string, currentName: string) => void;
  onOpen?: (pdfId: string) => void;
  onDownload?: (pdfId: string) => void;
  onShare?: (pdfId: string) => void;
  onToggleFavorite?: (pdfId: string) => void;
  onMoveToFolder?: (pdfId: string) => void;
  onShowInfo?: (pdfId: string) => void;
}

export function PDFContextMenu({
  x,
  y,
  pdfId,
  onClose,
  onDelete,
  onRename,
  onOpen,
  onDownload,
  onShare,
  onToggleFavorite,
  onMoveToFolder,
  onShowInfo
}: PDFContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Adjust position to keep menu within viewport
  const adjustedPosition = React.useMemo(() => {
    const menuWidth = 200;
    const menuHeight = 300;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    if (x + menuWidth > viewportWidth) {
      adjustedX = x - menuWidth;
    }

    if (y + menuHeight > viewportHeight) {
      adjustedY = y - menuHeight;
    }

    return { x: Math.max(0, adjustedX), y: Math.max(0, adjustedY) };
  }, [x, y]);

  const menuItems = [
    {
      icon: Eye,
      label: "Open",
      onClick: () => {
        onOpen?.(pdfId);
        onClose();
      },
      shortcut: "Enter"
    },
    {
      icon: Edit,
      label: "Rename",
      onClick: () => {
        onRename(pdfId, ""); // Current name will be fetched in parent
        onClose();
      },
      shortcut: "F2"
    },
    { type: "separator" },
    {
      icon: Download,
      label: "Download",
      onClick: () => {
        onDownload?.(pdfId);
        onClose();
      },
      shortcut: "Ctrl+D"
    },
    {
      icon: Share,
      label: "Share",
      onClick: () => {
        onShare?.(pdfId);
        onClose();
      }
    },
    {
      icon: Copy,
      label: "Copy Link",
      onClick: () => {
        navigator.clipboard.writeText(`${window.location.origin}/dashboard/pdfs/${pdfId}`);
        onClose();
      },
      shortcut: "Ctrl+C"
    },
    { type: "separator" },
    {
      icon: Star,
      label: "Add to Favorites",
      onClick: () => {
        onToggleFavorite?.(pdfId);
        onClose();
      }
    },
    {
      icon: FolderOpen,
      label: "Move to Folder",
      onClick: () => {
        onMoveToFolder?.(pdfId);
        onClose();
      }
    },
    { type: "separator" },
    {
      icon: Info,
      label: "Properties",
      onClick: () => {
        onShowInfo?.(pdfId);
        onClose();
      },
      shortcut: "Alt+Enter"
    },
    { type: "separator" },
    {
      icon: Trash2,
      label: "Delete",
      onClick: () => {
        onDelete(pdfId);
        onClose();
      },
      shortcut: "Delete",
      variant: "destructive" as const
    }
  ];

  return (
    <div
      className="fixed inset-0 z-50"
      style={{ pointerEvents: 'none' }}
    >
      <Card
        ref={menuRef}
        className="absolute w-48 shadow-lg border"
        style={{
          left: adjustedPosition.x,
          top: adjustedPosition.y,
          pointerEvents: 'auto'
        }}
      >
        <CardContent className="p-1">
          {menuItems.map((item, index) => {
            if (item.type === "separator") {
              return <Separator key={index} className="my-1" />;
            }

            const Icon = item.icon;
            return (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className={`w-full justify-start gap-2 h-8 px-2 ${
                  item.variant === "destructive" 
                    ? "text-destructive hover:text-destructive hover:bg-destructive/10" 
                    : ""
                }`}
                onClick={item.onClick}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.shortcut && (
                  <span className="text-xs text-muted-foreground">
                    {item.shortcut}
                  </span>
                )}
              </Button>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}