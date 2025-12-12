"use client";

import { ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface BreadcrumbItem {
  id: string | null;
  name: string;
}

interface BreadcrumbProps {
  path: BreadcrumbItem[];
  onNavigate: (folderId: string | null) => void;
}

export function Breadcrumb({ path, onNavigate }: BreadcrumbProps) {
  return (
    <div className="flex items-center gap-1 text-sm overflow-x-auto py-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onNavigate(null)}
        className="h-8 px-2"
      >
        <Home className="h-4 w-4" />
      </Button>
      {path.map((item, index) => (
        <div key={item.id || "root"} className="flex items-center gap-1">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate(item.id)}
            className="h-8 px-2 hover:bg-muted"
            disabled={index === path.length - 1}
          >
            {item.name}
          </Button>
        </div>
      ))}
    </div>
  );
}
