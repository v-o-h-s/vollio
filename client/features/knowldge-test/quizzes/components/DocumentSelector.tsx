"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Search,
  Calendar,
  HardDrive,
  CheckCircle,
  Upload,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Document {
  id: string;
  title: string;
  pageCount: number;
  uploadDate: string;
  size: string;
  category?: string;
  tags?: string[];
}

interface DocumentSelectorProps {
  onDocumentSelect: (document: Document) => void;
  selectedDocument?: Document | null;
  className?: string;
}

// Mock documents - replace with actual API call
const mockDocuments: Document[] = [
  {
    id: "1",
    title: "JavaScript Fundamentals Guide.pdf",
    pageCount: 45,
    uploadDate: "2024-01-15",
    size: "2.3 MB",
    category: "Programming",
    tags: ["javascript", "web-development", "fundamentals"],
  },
  {
    id: "2",
    title: "React Advanced Patterns.pdf",
    pageCount: 78,
    uploadDate: "2024-01-12",
    size: "4.1 MB",
    category: "Programming",
    tags: ["react", "patterns", "advanced"],
  },
  {
    id: "3",
    title: "Linear Algebra Textbook.pdf",
    pageCount: 234,
    uploadDate: "2024-01-10",
    size: "12.5 MB",
    category: "Mathematics",
    tags: ["linear-algebra", "mathematics", "textbook"],
  },
  {
    id: "4",
    title: "World History Overview.pdf",
    pageCount: 156,
    uploadDate: "2024-01-08",
    size: "8.7 MB",
    category: "History",
    tags: ["history", "world-history", "overview"],
  },
  {
    id: "5",
    title: "Organic Chemistry Reactions.pdf",
    pageCount: 89,
    uploadDate: "2024-01-05",
    size: "5.2 MB",
    category: "Chemistry",
    tags: ["chemistry", "organic", "reactions"],
  },
];

export function DocumentSelector({
  onDocumentSelect,
  selectedDocument,
  className,
}: DocumentSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [documents, setDocuments] = useState<Document[]>([]);

  // Simulate loading documents
  useEffect(() => {
    const loadDocuments = async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      setDocuments(mockDocuments);
    };

    loadDocuments();
  }, []);

  // Filter documents based on search and category
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags?.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesCategory =
      selectedCategory === "All" || doc.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = [
    "All",
    ...Array.from(
      new Set(documents.map((doc) => doc.category).filter(Boolean))
    ),
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className={cn("w-full bg-card/20", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Select Document
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Document List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No documents found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className={cn(
                  "p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md",
                  selectedDocument?.id === doc.id
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border hover:border-primary/50"
                )}
                onClick={() => onDocumentSelect(doc)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium truncate">{doc.title}</h4>
                      {selectedDocument?.id === doc.id && (
                        <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {doc.pageCount} pages
                      </div>
                      <div className="flex items-center gap-1">
                        <HardDrive className="w-3 h-3" />
                        {doc.size}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(doc.uploadDate)}
                      </div>
                    </div>

                    {/* Category and Tags */}
                    <div className="flex flex-wrap gap-2">
                      {doc.category && (
                        <Badge variant="secondary" className="text-xs">
                          {doc.category}
                        </Badge>
                      )}
                      {doc.tags?.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {doc.tags && doc.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{doc.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Upload New Document Option */}
        <div className="border-t pt-4">
          <Button variant="outline" className="w-full" asChild>
            <label htmlFor="document-upload" className="cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Upload New Document
            </label>
          </Button>
          <input
            id="document-upload"
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                // Handle file upload
                console.log("File selected:", file.name);
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
