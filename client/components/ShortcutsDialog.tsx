"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { shortcuts } from "@/lib/shortcuts";
import { Search, Keyboard } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShortcutGroup {
  category: string;
  items: { key: string; action: string }[];
}

export function ShortcutsDialog() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Toggle dialog with Ctrl+K or Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Filter shortcuts based on search query
  const filteredShortcuts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const groups: ShortcutGroup[] = [];

    Object.entries(shortcuts).forEach(([category, items]) => {
      const filteredItems = items.filter(
        (item) =>
          item.key.toLowerCase().includes(query) ||
          item.action.toLowerCase().replace(/([A-Z])/g, " $1").includes(query)
      );

      if (filteredItems.length > 0) {
        groups.push({
          category: category.charAt(0).toUpperCase() + category.slice(1),
          items: filteredItems,
        });
      }
    });

    return groups;
  }, [searchQuery]);

  // Format action name (camelCase to Title Case)
  const formatAction = (action: string) => {
    return action
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  // Format key string (e.g., "Ctrl+N" -> ["Ctrl", "N"])
  const formatKey = (key: string) => {
    return key.split("+");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden outline-none">
        <DialogHeader className="px-6 py-4 border-b border-border/40">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Keyboard className="w-5 h-5 text-muted-foreground" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use key combinations to perform actions quickly.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-4 border-b border-border/40 bg-muted/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              className="pl-9 bg-background border-border/60 focus-visible:ring-primary/20"
              placeholder="Search shortcuts..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-2 py-2">
          {filteredShortcuts.length > 0 ? (
            filteredShortcuts.map((group) => (
              <div key={group.category} className="mb-4 last:mb-0">
                <h3 className="px-4 py-2 text-sm font-semibold text-muted-foreground/80 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
                  {group.category}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item, index) => (
                    <div 
                      key={`${group.category}-${index}`}
                      className="flex items-center justify-between px-4 py-2 mx-2 rounded-md hover:bg-muted/50 transition-colors group"
                    >
                      <span className="text-sm font-medium text-foreground/90 group-hover:text-foreground">
                        {formatAction(item.action)}
                      </span>
                      <div className="flex items-center gap-1">
                        {formatKey(item.key).map((k, kIndex) => (
                          <kbd
                            key={kIndex}
                            className={cn(
                              "pointer-events-none h-6 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-[11px] font-medium text-muted-foreground opacity-100 flex",
                              "border-b-2 border-b-border/60"
                            )}
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <p>No shortcuts found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
        
        <div className="px-6 py-3 border-t border-border/40 bg-muted/10 flex justify-between items-center text-xs text-muted-foreground">
          <span>Press <kbd className="font-mono font-medium">Esc</kbd> to close</span>
          <span className="flex items-center gap-1">
            <kbd className="font-mono bg-muted border rounded px-1">Ctrl</kbd> + <kbd className="font-mono bg-muted border rounded px-1">K</kbd>
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
