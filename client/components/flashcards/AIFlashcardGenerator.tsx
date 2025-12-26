"use client";

import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Sparkles,
  FileText,
  Brain,
  Wand2,
  Upload,
  AlertCircle,
  CheckCircle,
  Loader2,
  BookOpen,
  Settings,
  Library,
} from "lucide-react";
import { toast } from "react-toastify";
import { PremiumUpgrade } from "@/components/ui/premium-upgrade";
import { PremiumBadge } from "@/components/ui/premium-badge";

interface DocumentDocument {
  id: string;
  title: string;
  page_count?: number;
}

interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  hint?: string;
}

interface AIGenerationSettings {
  numberOfCards: number;
  difficulty: "Easy" | "Medium" | "Hard";
  focusAreas: string[];
  includeHints: boolean;
  cardStyle: "Definition" | "Question-Answer" | "Fill-in-blank" | "Mixed";
}

interface AIFlashcardGeneratorProps {
  availableDocuments: DocumentDocument[];
  onCardsGenerated: (cards: FlashcardItem[]) => void;
  isLoadingDocuments: boolean;
  documentError: any;
  refetchDocuments: () => void;
}

export function AIFlashcardGenerator({
  availableDocuments,
  onCardsGenerated,
  isLoadingDocuments,
  documentError,
  refetchDocuments,
}: AIFlashcardGeneratorProps) {
  const [activeTab, setActiveTab] = useState<"library" | "upload" | "topic">(
    "library"
  );
  const [selectedDocument, setSelectedDocument] = useState<DocumentDocument | null>(
    null
  );
  const [topicInput, setTopicInput] = useState("");
  const [contextInput, setContextInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [settings, setSettings] = useState<AIGenerationSettings>({
    numberOfCards: 10,
    difficulty: "Medium",
    focusAreas: [],
    includeHints: true,
    cardStyle: "Mixed",
  });
  const [focusAreaInput, setFocusAreaInput] = useState("");
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const cardStyles = [
    "Definition",
    "Question-Answer",
    "Fill-in-blank",
    "Mixed",
  ];
  const difficulties = ["Easy", "Medium", "Hard"];
  const suggestedFocusAreas = [
    "Key concepts",
    "Definitions",
    "Formulas",
    "Examples",
    "Applications",
    "Historical facts",
    "Processes",
    "Comparisons",
    "Causes and effects",
  ];

  // Simulate progress during generation
  const simulateProgress = () => {
    setGenerationProgress(0);
    let progress = 0;

    progressInterval.current = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 90) {
        progress = 90;
      }
      setGenerationProgress(progress);
    }, 500);
  };

  const stopProgress = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    setGenerationProgress(100);
    setTimeout(() => setGenerationProgress(0), 1000);
  };

  // Generate flashcards from document
  const generateFromDocument = async () => {
    if (!selectedDocument) {
      toast.error("Please select a document first!");
      return;
    }

    setIsGenerating(true);
    simulateProgress();

    try {
      const response = await fetch("/api/flashcards/generate-from-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId: selectedDocument.id,
          settings: settings,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate flashcards");
      }

      const data = await response.json();

      if (data.success && data.flashcards) {
        onCardsGenerated(data.flashcards);
        toast.success(
          `Generated ${data.flashcards.length} flashcards from "${selectedDocument.title}"!`
        );
      } else {
        throw new Error(data.error || "Generation failed");
      }
    } catch (error) {
      console.error("Error generating flashcards:", error);
      toast.error("Failed to generate flashcards. Please try again.");
    } finally {
      setIsGenerating(false);
      stopProgress();
    }
  };

  // Generate flashcards from topic
  const generateFromTopic = async () => {
    if (!topicInput.trim()) {
      toast.error("Please enter a topic!");
      return;
    }

    setIsGenerating(true);
    simulateProgress();

    try {
      const response = await fetch("/api/flashcards/generate-from-topic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: topicInput.trim(),
          context: contextInput.trim(),
          settings: settings,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate flashcards");
      }

      const data = await response.json();

      if (data.success && data.flashcards) {
        onCardsGenerated(data.flashcards);
        toast.success(
          `Generated ${data.flashcards.length} flashcards for "${topicInput}"!`
        );
      } else {
        throw new Error(data.error || "Generation failed");
      }
    } catch (error) {
      console.error("Error generating flashcards:", error);
      toast.error("Failed to generate flashcards. Please try again.");
    } finally {
      setIsGenerating(false);
      stopProgress();
    }
  };

  // Handle document upload
  const handleDocumentUpload = async (documents: Document[]) => {
    setIsUploading(true);

    for (const document of files) {
      const formData = new FormData();
      formData.append("document", document);

      try {
        const response = await fetch("/api/documents/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        toast.success(`${document.name} has been uploaded successfully.`);
      } catch (error) {
        console.error(`Failed to upload ${document.name}:`, error);
        toast.error(`Failed to upload ${document.name}.`);
      }
    }

    setIsUploading(false);
    refetchDocuments();
    // Switch to library tab to show newly uploaded documents
    setActiveTab("library");
  };

  // Handle document drop
  const handleDocumentDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const documentDocuments = documents.filter((document) => document.type === "application/document");

    if (documentDocuments.length > 0) {
      handleDocumentUpload(documentDocuments);
    } else {
      toast.error("Please upload Document documents only.");
    }
  };

  // Handle drag events
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

  // Handle upgrade action
  const handleUpgrade = () => {
    toast.success("Redirecting to upgrade page...");
    // In a real app, this would redirect to the payment/upgrade page
    console.log("Upgrade to premium clicked");
  };

  // Add focus area
  const addFocusArea = (area: string) => {
    if (area && !settings.focusAreas.includes(area)) {
      setSettings({
        ...settings,
        focusAreas: [...settings.focusAreas, area],
      });
      setFocusAreaInput("");
    }
  };

  // Remove focus area
  const removeFocusArea = (areaToRemove: string) => {
    setSettings({
      ...settings,
      focusAreas: settings.focusAreas.filter((area) => area !== areaToRemove),
    });
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          AI Flashcard Generator
          <PremiumBadge variant="crown" />
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Generate flashcards automatically using AI from your documents or any
          topic
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
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
          <Button
            variant={activeTab === "topic" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("topic")}
            className="flex-1 flex items-center gap-2"
          >
            <Brain className="w-4 h-4" />
            From Topic
          </Button>
        </div>

        {/* Library Tab */}
        {activeTab === "library" && (
          <div className="space-y-4">
            <div>
              <Label>
                Select Document from Library ({availableDocuments.length})
              </Label>
              {isLoadingDocuments ? (
                <div className="flex items-center justify-center py-8 text-center">
                  <div className="space-y-2">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Loading documents...
                    </p>
                  </div>
                </div>
              ) : documentError ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Failed to load documents
                  </p>
                  <Button variant="outline" size="sm" onClick={refetchDocuments}>
                    Try Again
                  </Button>
                </div>
              ) : availableDocuments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                  <BookOpen className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">
                    No documents in your library
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Upload some Documents to get started
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("upload")}
                    className="mt-2"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Documents
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 mt-2 max-h-48 overflow-y-auto border rounded-lg p-2">
                  {availableDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedDocument?.id === doc.id
                          ? "bg-primary/10 border-primary/20"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedDocument(doc)}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{doc.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.page_count || 1} pages
                          </p>
                        </div>
                      </div>
                      {selectedDocument?.id === doc.id && (
                        <CheckCircle className="w-4 h-4 text-primary" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upload Tab */}
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
                onDrop={handleDocumentDrop}
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
                      {isDragOver ? "Drop documents here" : "Drag & drop Document documents"}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      or click to browse your computer
                    </p>

                    <Button
                      variant="outline"
                      onClick={() => documentInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Choose Documents
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <FileText className="w-3 h-3" />
                    <span>Document documents only • Max 50MB per document</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Topic Tab */}
        {activeTab === "topic" && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="topic">Topic *</Label>
              <Input
                id="topic"
                placeholder="e.g., JavaScript ES6 Features, World War II, Calculus Derivatives..."
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                className="mt-1 border-border/50 focus:border-primary/50"
              />
            </div>

            <div>
              <Label htmlFor="context">Additional Context (Optional)</Label>
              <Textarea
                id="context"
                placeholder="Provide additional context, specific areas to focus on, or learning objectives..."
                value={contextInput}
                onChange={(e) => setContextInput(e.target.value)}
                className="mt-1 border-border/50 focus:border-primary/50 resize-none"
                rows={3}
              />
            </div>
          </div>
        )}

        <Separator />

        {/* Generation Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Generation Settings</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            >
              <Settings className="w-4 h-4 mr-2" />
              {showAdvancedSettings ? "Hide" : "Show"} Advanced
            </Button>
          </div>

          {/* Basic Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="numberOfCards">Number of Cards</Label>
              <Input
                id="numberOfCards"
                type="number"
                min="1"
                max="50"
                value={settings.numberOfCards}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    numberOfCards: parseInt(e.target.value) || 10,
                  })
                }
                className="mt-1 border-border/50 focus:border-primary/50"
              />
            </div>

            <div>
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <select
                id="difficulty"
                value={settings.difficulty}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    difficulty: e.target.value as "Easy" | "Medium" | "Hard",
                  })
                }
                className="w-full mt-1 px-3 py-2 border border-border/50 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
              >
                {difficulties.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Advanced Settings */}
          {showAdvancedSettings && (
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              <div>
                <Label htmlFor="cardStyle">Card Style</Label>
                <select
                  id="cardStyle"
                  value={settings.cardStyle}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      cardStyle: e.target.value as any,
                    })
                  }
                  className="w-full mt-1 px-3 py-2 border border-border/50 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                >
                  {cardStyles.map((style) => (
                    <option key={style} value={style}>
                      {style}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeHints"
                  checked={settings.includeHints}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      includeHints: e.target.checked,
                    })
                  }
                  className="rounded border-border/50"
                />
                <Label htmlFor="includeHints">
                  Include hints when possible
                </Label>
              </div>

              <div>
                <Label htmlFor="focusAreas">Focus Areas</Label>
                <Input
                  id="focusAreas"
                  placeholder="Add focus area (press Enter)..."
                  value={focusAreaInput}
                  onChange={(e) => setFocusAreaInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addFocusArea(focusAreaInput.trim());
                    }
                  }}
                  className="mt-1 border-border/50 focus:border-primary/50"
                />

                {/* Suggested Focus Areas */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {suggestedFocusAreas.slice(0, 6).map((area) => (
                    <Button
                      key={area}
                      variant="outline"
                      size="sm"
                      onClick={() => addFocusArea(area)}
                      className="text-xs h-6 px-2 hover:scale-105 transition-transform duration-200"
                      disabled={settings.focusAreas.includes(area)}
                    >
                      {area}
                    </Button>
                  ))}
                </div>

                {/* Selected Focus Areas */}
                {settings.focusAreas.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {settings.focusAreas.map((area) => (
                      <Badge
                        key={area}
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors duration-200"
                        onClick={() => removeFocusArea(area)}
                      >
                        {area} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Generation Progress */}
        {isGenerating && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
              <span className="text-sm font-medium">
                Generating flashcards...
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              AI is analyzing content and creating personalized flashcards...
            </p>
          </div>
        )}

        {/* Generate Button */}
        <Button
          onClick={
            activeTab === "topic" ? generateFromTopic : generateFromDocument
          }
          disabled={
            isGenerating ||
            isUploading ||
            ((activeTab === "library" || activeTab === "upload") &&
              !selectedDocument) ||
            (activeTab === "topic" && !topicInput.trim())
          }
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 hover:scale-105 transition-all duration-200"
        >
          <Wand2 className="w-4 h-4 mr-2" />
          {isGenerating
            ? "Generating..."
            : `Generate ${settings.numberOfCards} Flashcards`}
        </Button>

        {/* Hidden document input */}
        <input
          ref={documentInputRef}
          type="file"
          accept=".document"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            if (documents.length > 0) {
              handleDocumentUpload(documents);
            }
          }}
        />

        {/* Info */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">AI Generation Tips:</p>
            <ul className="text-xs space-y-1 list-disc list-inside">
              <li>
                <strong>From Library:</strong> Select existing Documents to generate
                flashcards from your uploaded documents
              </li>
              <li>
                <strong>Upload New:</strong> Drag & drop or upload new Document documents
                to expand your library
              </li>
              <li>
                <strong>From Topic:</strong> Enter any topic for AI to generate
                flashcards without needing documents
              </li>
              <li>
                Use focus areas and advanced settings to customize the
                generation process
              </li>
              <li>
                Generated cards can be edited and customized after creation
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
