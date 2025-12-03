"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useGetPDFsQuery } from "@/lib/store/apiSlice";
import toast from "react-hot-toast";

import {
  Library,
  Upload,
  Plus,
  FileText,
  Trash2,
  AlertCircle,
} from "lucide-react";

interface PDFDocument {
  id: string;
  title: string;
  page_count?: number;
}

interface SelectedDocument {
  id: string;
  title: string;
  filename: string;
  uploadedAt: string;
  fileSize: number;
  pageCount?: number;
  selectedPages?: number[];
}

interface DocumentSelectorProps {
  onDocumentsSelected: (documents: SelectedDocument[]) => void;
  selectedDocuments: SelectedDocument[];
  mode?: string;
}

export function DocumentSelector({
  onDocumentsSelected,
  selectedDocuments,
  mode = "summarize",
}: DocumentSelectorProps) {
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    data: pdfData,
    isLoading: isLoadingPDFs,
    error: pdfError,
    refetch: refetchPDFs,
  } = useGetPDFsQuery();

  // Transform PDFDocument to match DocumentSelector interface
  const availableDocuments = (pdfData?.pdfs || []).map((pdf) => ({
    id: pdf.id,
    title: pdf.title,
    page_count: pdf.page_count,
  }));

  const handleFileUpload = async (files: File[]) => {
    setIsUploading(true);

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/pdfs/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        toast.success(`${file.name} has been uploaded successfully.`);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        toast.error(`Failed to upload ${file.name}.`);
      }
    }

    setIsUploading(false);
    refetchPDFs();
    // Switch to library tab to show newly uploaded documents
    setActiveTab("library");
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const pdfFiles = files.filter((file) => file.type === "application/pdf");

    if (pdfFiles.length > 0) {
      handleFileUpload(pdfFiles);
    } else {
      alert("Please upload PDF files only.");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleAddDocument = (doc: PDFDocument) => {
    // Check if document is already selected
    if (selectedDocuments.some(selected => selected.id === doc.id)) {
      toast.error("Document is already selected");
      return;
    }

    const newDocument: SelectedDocument = {
      id: doc.id,
      title: doc.title,
      filename: doc.title,
      uploadedAt: new Date().toISOString(),
      fileSize: 0, // We don't have this info from the API
      pageCount: doc.page_count || 1,
      selectedPages: Array.from({ length: doc.page_count || 1 }, (_, i) => i + 1),
    };

    const updatedDocuments = [...selectedDocuments, newDocument];
    onDocumentsSelected(updatedDocuments);
    toast.success(`Added ${doc.title} to selection`);
  };

  const handleRemoveDocument = (docId: string) => {
    const updatedDocuments = selectedDocuments.filter(doc => doc.id !== docId);
    onDocumentsSelected(updatedDocuments);
  };

  const handleUpdateDocumentPages = (docId: string, pages: number[]) => {
    const updatedDocuments = selectedDocuments.map(doc => 
      doc.id === docId ? { ...doc, selectedPages: pages } : doc
    );
    onDocumentsSelected(updatedDocuments);
  };

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={activeTab === "library" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("library")}
          className="flex-1 flex items-center gap-2"
        >
          <Library className="w-4 h-4" />
          From Library
        </Button>
        <Button
          variant={activeTab === "upload" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("upload")}
          className="flex-1 flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload New
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === "library" && (
        <div className="space-y-4">
          <div>
            <Label>Available Documents ({availableDocuments.length})</Label>
            {isLoadingPDFs ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-muted-foreground">
                  Loading your documents...
                </p>
              </div>
            ) : pdfError ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
                <p className="text-muted-foreground">
                  Failed to load documents
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchPDFs()}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            ) : availableDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  No documents in your library
                </p>
                <p className="text-sm text-muted-foreground">
                  Upload some PDFs to get started
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 max-h-60 overflow-y-auto border rounded-lg p-2">
                {availableDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleAddDocument(doc)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{doc.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {doc.page_count || 1} pages
                      </p>
                    </div>
                    <Plus className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "upload" && (
        <div className="space-y-4">
          <div>
            <Label>Upload New Documents</Label>
            <div
              className={`mt-2 border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              }`}
              onDrop={handleFileDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="flex flex-col items-center gap-4">
                <div
                  className={`rounded-full p-4 ${
                    isDragOver ? "bg-primary/10" : "bg-muted/50"
                  }`}
                >
                  <Upload
                    className={`w-8 h-8 ${
                      isDragOver ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                </div>

                <div>
                  <h3 className="font-medium mb-1">
                    {isDragOver ? "Drop files here" : "Drag & drop PDF files"}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    or click to browse your computer
                  </p>

                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Files
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FileText className="w-3 h-3" />
                  <span>PDF files only • Max 50MB per file</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length > 0) {
            handleFileUpload(files);
          }
        }}
      />

      <Separator />

      {/* Selected Documents */}
      <div>
        <Label>Selected Documents ({selectedDocuments.length})</Label>
        {selectedDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center border rounded-lg mt-2">
            <FileText className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No documents selected
            </p>
            <p className="text-xs text-muted-foreground">
              Choose from your library or upload new files
            </p>
          </div>
        ) : (
          <div className="space-y-3 mt-2">
            {selectedDocuments.map((doc) => (
              <div key={doc.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{doc.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {doc.selectedPages?.length || doc.pageCount || 0} of {doc.pageCount || 0} pages
                      selected
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDocument(doc.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Page Selection */}
                <div>
                  <Label className="text-sm">Page Selection</Label>
                  <div className="flex gap-2 mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleUpdateDocumentPages(
                          doc.id,
                          Array.from({ length: doc.pageCount || 0 }, (_, i) => i + 1)
                        )
                      }
                    >
                      All Pages
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateDocumentPages(doc.id, [])}
                    >
                      Clear
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Array.from({ length: doc.pageCount || 0 }, (_, i) => i + 1).map(
                      (page) => (
                        <Badge
                          key={page}
                          variant={
                            doc.selectedPages?.includes(page)
                              ? "default"
                              : "outline"
                          }
                          className="cursor-pointer text-xs"
                          onClick={() => {
                            const currentPages = doc.selectedPages || [];
                            const newPages = currentPages.includes(page)
                              ? currentPages.filter((p) => p !== page)
                              : [...currentPages, page].sort((a, b) => a - b);
                            handleUpdateDocumentPages(doc.id, newPages);
                          }}
                        >
                          {page}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}