"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { AISummaryGenerator, SummaryHistory, SummaryTemplates, DocumentSelector } from "@/components/summarize";
import { FileText, Sparkles, Clock, BookOpen } from "lucide-react";
import { DocumentSelectionTabs } from "@/components/quiz/DocumentSelectionTabs";

interface SelectedDocument {
  id: string;
  title: string;
  filename: string;
  uploadedAt: string;
  fileSize: number;
  pageCount?: number;
  selectedPages?: number[];
}

export default function SummarizePage() {
  const [selectedDocuments, setSelectedDocuments] = useState<SelectedDocument[]>([]);
  const [activeTab, setActiveTab] = useState<"select" | "templates" | "generate" | "history">("select");
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const handleDocumentSelect = (documents: SelectedDocument[]) => {
    setSelectedDocuments(documents);
    if (documents.length > 0) {
      setActiveTab("generate");
    }
  };

  const handleGenerationComplete = () => {
    setActiveTab("history");
  };

  // Handle sidebar events
  useEffect(() => {
    const handleDocumentSelect = () => setActiveTab("select");
    const handleTemplates = () => setActiveTab("templates");
    const handleGenerate = () => {
      if (selectedDocuments.length > 0) {
        setActiveTab("generate");
      }
    };
    const handleHistory = () => setActiveTab("history");

    window.addEventListener("trigger-document-select", handleDocumentSelect);
    window.addEventListener("trigger-summary-templates", handleTemplates);
    window.addEventListener("trigger-summary-generate", handleGenerate);
    window.addEventListener("trigger-summary-history", handleHistory);

    return () => {
      window.removeEventListener("trigger-document-select", handleDocumentSelect);
      window.removeEventListener("trigger-summary-templates", handleTemplates);
      window.removeEventListener("trigger-summary-generate", handleGenerate);
      window.removeEventListener("trigger-summary-history", handleHistory);
    };
  }, [selectedDocuments.length]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Document Summarizer</h1>
          <p className="text-muted-foreground mt-2">
            Generate AI-powered summaries from your PDF library
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            AI Powered
          </Badge>
        </div>
      </div>



      {/* Navigation Tabs */}
      <div className="flex items-center gap-4 border-b border-border">
        <Button
          variant={activeTab === "select" ? "default" : "ghost"}
          onClick={() => setActiveTab("select")}
          className="flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Select Documents
        </Button>
        <Button
          variant={activeTab === "templates" ? "default" : "ghost"}
          onClick={() => setActiveTab("templates")}
          className="flex items-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          Templates
        </Button>
        <Button
          variant={activeTab === "generate" ? "default" : "ghost"}
          onClick={() => setActiveTab("generate")}
          disabled={selectedDocuments.length === 0}
          className="flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Generate Summary
        </Button>
        <Button
          variant={activeTab === "history" ? "default" : "ghost"}
          onClick={() => setActiveTab("history")}
          className="flex items-center gap-2"
        >
          <Clock className="w-4 h-4" />
          Summary History
        </Button>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === "select" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Select Documents to Summarize
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentSelectionTabs
                onDocumentsSelected={handleDocumentSelect}
                selectedDocuments={selectedDocuments}
                mode="summarize"
              />
            </CardContent>
          </Card>
        )}

        {activeTab === "templates" && (
          <SummaryTemplates
            onTemplateSelect={setSelectedTemplate}
            selectedTemplateId={selectedTemplate?.id}
          />
        )}

        {activeTab === "generate" && selectedDocuments.length > 0 && (
          <AISummaryGenerator
            selectedDocuments={selectedDocuments}
            onGenerationComplete={handleGenerationComplete}
            selectedTemplate={selectedTemplate}
          />
        )}

        {activeTab === "history" && (
          <SummaryHistory />
        )}
      </div>

      {/* Selected Documents Preview */}
      {selectedDocuments.length > 0 && activeTab !== "select" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Selected Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedDocuments.map((doc, index) => (
                <div key={doc.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.selectedPages ? `${doc.selectedPages.length} pages selected` : `${doc.pageCount || 0} pages`}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const updated = selectedDocuments.filter((_, i) => i !== index);
                      setSelectedDocuments(updated);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}