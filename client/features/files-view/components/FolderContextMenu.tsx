"use client";

import React, { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  FolderOpen, 
  Edit, 
  Trash2, 
  Copy,
  FolderPlus,
  Move,
  Info,
  Share
} from "lucide-react";

interface FolderContextMenuProps {
  x: number;
  y: number;
  folderId: string;
  onClose: () => void;
  onDelete: (folderId: string) => void;
  onRename: (folderId: string, currentName: string) => void;
  onOpen?: (folderId: string) => void;
  onCreateSubfolder?: (parentId: string) => void;
  onMoveToFolder?: (folderId: string) => void;
  onShare?: (folderId: string) => void;
  onShowInfo?: (folderId: string) => void;
  currentName?: string;
}

export function FolderContextMenu({
  x,
  y,
  folderId,
  onClose,
  onDelete,
  onRename,
  onOpen,
  onCreateSubfolder,
  onMoveToFolder,
  onShare,
  onShowInfo,
  currentName = ""
}: FolderContextMenuProps) {
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
    const menuHeight = 280;
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
      icon: FolderOpen,
      label: "Open",
      onClick: () => {
        onOpen?.(folderId);
        onClose();
      },
      shortcut: "Enter"
    },
    {
      icon: Edit,
      label: "Rename",
      onClick: () => {
        onRename(folderId, currentName);
        onClose();
      },
      shortcut: "F2"
    },
    { type: "separator" },
    {
      icon: FolderPlus,
      label: "New Subfolder",
      onClick: () => {
        onCreateSubfolder?.(folderId);
        onClose();
      },
      shortcut: "Ctrl+Shift+N"
    },
    { type: "separator" },
    {
      icon: Copy,
      label: "Copy Path",
      onClick: () => {
        navigator.clipboard.writeText(`/folders/${folderId}`);
        onClose();
      },
      shortcut: "Ctrl+C"
    },
    {
      icon: Share,
      label: "Share Folder",
      onClick: () => {
        onShare?.(folderId);
        onClose();
      }
    },
    {
      icon: Move,
      label: "Move to Folder",
      onClick: () => {
        onMoveToFolder?.(folderId);
        onClose();
      }
    },
    { type: "separator" },
    {
      icon: Info,
      label: "Properties",
      onClick: () => {
        onShowInfo?.(folderId);
        onClose();
      },
      shortcut: "Alt+Enter"
    },
    { type: "separator" },
    {
      icon: Trash2,
      label: "Delete",
      onClick: () => {
        onDelete(folderId);
        onClose();
      },
      shortcut: "Delete",
      variant: "destructive" as const
    }
  ];

  return (
    <div
      className="fixed inset-0 z-[9999]"
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
            if (!Icon) {
              return null;
            }

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