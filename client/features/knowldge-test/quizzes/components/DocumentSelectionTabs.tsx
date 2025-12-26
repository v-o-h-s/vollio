"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Search, FileText, LayoutTemplate, Plus, Check } from "lucide-react";
import { useState } from "react";

interface DocumentDocument {
  id: string;
  title: string;
}

interface DocumentSelectionTabsProps {
  availableDocuments?: DocumentDocument[];
  onSelectDocument?: (doc: DocumentDocument) => void;
  isLoadingDocuments?: boolean;
  selectedDocumentId?: string;
}

export function DocumentSelectionTabs({
  availableDocuments = [],
  onSelectDocument,
  isLoadingDocuments = false,
  selectedDocumentId,
}: DocumentSelectionTabsProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDocs = availableDocuments.filter((doc) =>
    (doc.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search documents..."
          className="pl-9 bg-background/50 border-primary/20"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="border border-primary/20 rounded-xl overflow-hidden bg-card/20">
        {isLoadingDocuments ? (
          <div className="p-8 text-center text-muted-foreground">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
            Loading documents...
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <LayoutTemplate className="w-10 h-10 mx-auto mb-2 opacity-20" />
            <p>No documents found</p>
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto divide-y divide-border/40">
            {filteredDocs.map((doc) => {
              const isSelected = selectedDocumentId === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => onSelectDocument?.(doc)}
                  className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-indigo-500/10 border-l-2 border-indigo-500"
                      : "hover:bg-muted/50 border-l-2 border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected
                          ? "bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-sm font-medium truncate ${
                        isSelected ? "text-indigo-700 dark:text-indigo-300" : ""
                      }`}
                    >
                      {doc.title}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 ${
                      isSelected
                        ? "text-indigo-600 bg-indigo-500/10"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    {isSelected ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
