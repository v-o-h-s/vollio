"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetPDFsQuery } from "@/lib/store/apiSlice";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Plus,
  Trash2,
  Brain,
  AlertCircle,
  BookOpen,
  Target,
  Zap,
  Crown,
  Upload,
  Library,
  Info,
  FileStack,
  Sliders,

} from "lucide-react";

// Note: Using console.log for notifications - replace with your preferred toast system

// Document Selection Component
interface DocumentSelectionTabsProps {
  availableDocuments: any[];
  selectedDocuments: SelectedDocument[];
  onAddDocument: (doc: any) => void;
  onRemoveDocument: (docId: string) => void;
  onUpdateDocumentPages: (docId: string, pages: number[]) => void;
  onDocumentsUploaded: () => void;
  isLoadingPDFs: boolean;
  pdfError: any;
  refetchPDFs: () => void;
}

function DocumentSelectionTabs({
  availableDocuments,
  selectedDocuments,
  onAddDocument,
  onRemoveDocument,
  onUpdateDocumentPages,
  onDocumentsUploaded,
  isLoadingPDFs,
  pdfError,
  refetchPDFs,
}: DocumentSelectionTabsProps) {
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    onDocumentsUploaded();
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
                    onClick={() => onAddDocument(doc)}
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
                      {doc.selectedPages.length} of {doc.pageCount} pages
                      selected
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveDocument(doc.id)}
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
                        onUpdateDocumentPages(
                          doc.id,
                          Array.from({ length: doc.pageCount }, (_, i) => i + 1)
                        )
                      }
                    >
                      All Pages
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateDocumentPages(doc.id, [])}
                    >
                      Clear
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Array.from({ length: doc.pageCount }, (_, i) => i + 1).map(
                      (page) => (
                        <Badge
                          key={page}
                          variant={
                            doc.selectedPages.includes(page)
                              ? "default"
                              : "outline"
                          }
                          className="cursor-pointer text-xs"
                          onClick={() => {
                            const newPages = doc.selectedPages.includes(page)
                              ? doc.selectedPages.filter((p) => p !== page)
                              : [...doc.selectedPages, page].sort(
                                  (a, b) => a - b
                                );
                            onUpdateDocumentPages(doc.id, newPages);
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

// Types for quiz generation
interface SelectedDocument {
  id: string;
  title: string;
  pageCount: number;
  selectedPages: number[];
}

interface QuestionTypeConfig {
  mcq: number;
  trueFalse: number;
  fillInBlank: number;
  shortAnswer: number;
}

// For freemium users - single question type selection
type QuestionType = "mcq" | "trueFalse" | "fillInBlank" | "shortAnswer";

// Helper function to get question type display name
const getQuestionTypeDisplayName = (type: QuestionType): string => {
  switch (type) {
    case "mcq":
      return "Multiple Choice";
    case "trueFalse":
      return "True/False";
    case "fillInBlank":
      return "Fill-in-the-Blank";
    case "shortAnswer":
      return "Short Answer";
    default:
      return "Multiple Choice";
  }
};



interface QuizGenerationConfig {
  title: string;
  description: string;
  documents: SelectedDocument[];
  totalQuestions: number;
  questionTypes: QuestionTypeConfig;
  selectedQuestionType: QuestionType; // For freemium users
  difficulty: "easy" | "medium" | "hard" | "mixed";
  isPaid: boolean;
  randomDistribution: boolean;
}

export default function CreateQuizPage() {
  const router = useRouter();
  const [config, setConfig] = useState<QuizGenerationConfig>({
    title: "",
    description: "",
    documents: [],
    totalQuestions: 10,
    questionTypes: { mcq: 70, trueFalse: 15, fillInBlank: 10, shortAnswer: 5 },
    selectedQuestionType: "mcq", // Default for freemium users
    difficulty: "medium",
    isPaid: false, // This would come from user subscription status
    randomDistribution: false,
  });

  const [isGenerating, setIsGenerating] = useState(false);

  // Use RTK Query to load available documents
  const {
    data: pdfData,
    isLoading: isLoadingPDFs,
    error: pdfError,
    refetch: refetchPDFs,
  } = useGetPDFsQuery();
  const availableDocuments = pdfData?.pdfs || [];

  // Add document to selection
  const addDocument = (doc: any) => {
    if (config.documents.find((d) => d.id === doc.id)) {
      console.log("Document already selected");
      return;
    }

    const newDoc: SelectedDocument = {
      id: doc.id,
      title: doc.title,
      pageCount: doc.page_count || 1,
      selectedPages: Array.from(
        { length: doc.page_count || 1 },
        (_, i) => i + 1
      ),
    };

    setConfig((prev) => ({
      ...prev,
      documents: [...prev.documents, newDoc],
    }));
  };

  // Remove document from selection
  const removeDocument = (docId: string) => {
    setConfig((prev) => ({
      ...prev,
      documents: prev.documents.filter((d) => d.id !== docId),
    }));
  };

  // Update page selection for document
  const updateDocumentPages = (docId: string, pages: number[]) => {
    setConfig((prev) => ({
      ...prev,
      documents: prev.documents.map((doc) =>
        doc.id === docId ? { ...doc, selectedPages: pages } : doc
      ),
    }));
  };

  // Update question type percentages
  const updateQuestionTypes = (
    type: keyof QuestionTypeConfig,
    value: number
  ) => {
    if (!config.isPaid) {
      console.log(
        "Advanced question type configuration is available in the paid version"
      );
      return;
    }

    setConfig((prev) => ({
      ...prev,
      questionTypes: { ...prev.questionTypes, [type]: value },
    }));
  };



  // Generate quiz
  const generateQuiz = async () => {
    if (config.documents.length === 0) {
      toast.error("Please select at least one document");
      return;
    }

    if (!config.title.trim()) {
      toast.error("Please enter a quiz title");
      return;
    }

    // Validate percentage for paid users
    if (
      config.isPaid &&
      !config.randomDistribution &&
      totalPercentage !== 100
    ) {
      toast.error("Question type percentages must total 100%");
      return;
    }

    setIsGenerating(true);

    try {
      // Prepare the configuration based on user type
      const quizConfig = {
        ...config,
        // For freemium users, set all questions to the selected type
        questionTypes: config.isPaid
          ? config.questionTypes
          : {
              mcq: config.selectedQuestionType === "mcq" ? 100 : 0,
              trueFalse: config.selectedQuestionType === "trueFalse" ? 100 : 0,
              fillInBlank:
                config.selectedQuestionType === "fillInBlank" ? 100 : 0,
              shortAnswer:
                config.selectedQuestionType === "shortAnswer" ? 100 : 0,
            },
      };

      const response = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quizConfig),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success("Quiz generated successfully!");
        router.push(`/dashboard/quizzes/${result.quizId}`);
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to generate quiz");
      }
    } catch (error) {
      console.error("Quiz generation error:", error);
      toast.error("Failed to generate quiz. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const totalPercentage = Object.values(config.questionTypes).reduce(
    (sum, val) => sum + val,
    0
  );

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Create AI Quiz
              </h1>
              <p className="text-muted-foreground">
                Generate intelligent quizzes from your documents
              </p>
            </div>
          </div>

          {/* Test Toggle Button */}
          <div className="flex items-center gap-3">
            <Badge
              variant={config.isPaid ? "default" : "secondary"}
              className="text-sm"
            >
              {config.isPaid ? "Premium Mode" : "Free Mode"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setConfig((prev) => ({
                  ...prev,
                  isPaid: !prev.isPaid,
                }))
              }
              className="flex items-center gap-2"
            >
              {config.isPaid ? (
                <>
                  <Crown className="w-4 h-4 text-amber-500" />
                  Switch to Free
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4" />
                  Test Premium
                </>
              )}
            </Button>
          </div>
        </div>

        {!config.isPaid ? (
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">
                    Free Version - Basic Quiz Generation
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Upgrade to Pro for advanced question types and custom distributions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="font-medium text-emerald-800 dark:text-emerald-200">
                    Premium Version - Advanced Quiz Generation
                  </p>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    Enjoy unlimited questions, custom distributions, and advanced features
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Tabbed Interface */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger
                value="documents"
                className="flex items-center gap-2"
              >
                <FileStack className="w-4 h-4" />
                Documents
              </TabsTrigger>
              <TabsTrigger
                value="questions"
                className="flex items-center gap-2"
              >
                <Sliders className="w-4 h-4" />
                Questions
              </TabsTrigger>

            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Quiz Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Quiz Title *</Label>
                    <Input
                      id="title"
                      value={config.title}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="Enter quiz title..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={config.description}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Brief description of the quiz..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Difficulty Level</Label>
                    <Select
                      value={config.difficulty}
                      onValueChange={(value: any) =>
                        setConfig((prev) => ({ ...prev, difficulty: value }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                        {config.isPaid && (
                          <SelectItem value="mixed">Mixed</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Source Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DocumentSelectionTabs
                    availableDocuments={availableDocuments}
                    selectedDocuments={config.documents}
                    onAddDocument={addDocument}
                    onRemoveDocument={removeDocument}
                    onUpdateDocumentPages={updateDocumentPages}
                    onDocumentsUploaded={() => {
                      // Refetch documents using RTK Query
                      refetchPDFs();
                    }}
                    isLoadingPDFs={isLoadingPDFs}
                    pdfError={pdfError}
                    refetchPDFs={refetchPDFs}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Questions Configuration Tab */}
            <TabsContent value="questions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Question Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Total Questions</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <Slider
                        value={[config.totalQuestions]}
                        onValueChange={([value]) =>
                          setConfig((prev) => ({
                            ...prev,
                            totalQuestions: value,
                          }))
                        }
                        max={config.isPaid ? 100 : 20}
                        min={5}
                        step={1}
                        className="flex-1"
                      />
                      <span className="font-medium w-12 text-center">
                        {config.totalQuestions}
                      </span>
                    </div>
                    {!config.isPaid && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Free version limited to 20 questions
                      </p>
                    )}
                  </div>

                  {/* Question Type Configuration */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label>Question Types</Label>
                      {config.isPaid && (
                        <div className="flex items-center gap-2">
                          <Label htmlFor="random-dist" className="text-sm">
                            Random Distribution
                          </Label>
                          <Switch
                            id="random-dist"
                            checked={config.randomDistribution}
                            onCheckedChange={(checked) =>
                              setConfig((prev) => ({
                                ...prev,
                                randomDistribution: checked,
                              }))
                            }
                          />
                        </div>
                      )}
                    </div>

                    {!config.isPaid ? (
                      /* Freemium: Single Question Type Selection */
                      <div className="space-y-4">
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <Label className="text-sm font-medium">
                            Question Type
                          </Label>
                          <p className="text-xs text-muted-foreground mb-3">
                            Choose one question type for all{" "}
                            {config.totalQuestions} questions
                          </p>
                          <Select
                            value={config.selectedQuestionType}
                            onValueChange={(value: QuestionType) =>
                              setConfig((prev) => ({
                                ...prev,
                                selectedQuestionType: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mcq">
                                Multiple Choice (MCQ)
                              </SelectItem>
                              <SelectItem value="trueFalse">
                                True/False
                              </SelectItem>
                              <SelectItem value="fillInBlank">
                                Fill-in-the-Blank
                              </SelectItem>
                              <SelectItem value="shortAnswer">
                                Short Answer
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                          <Crown className="w-4 h-4 text-blue-600" />
                          <div className="text-sm">
                            <p className="font-medium text-blue-800 dark:text-blue-200">
                              Want mixed question types?
                            </p>
                            <p className="text-blue-700 dark:text-blue-300">
                              Upgrade to Pro for custom distributions and
                              advanced options
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Premium: Advanced Distribution Controls */
                      <div className="space-y-3">
                        {/* Multiple Choice */}
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">
                            Multiple Choice (MCQ)
                          </Label>
                          <div className="flex items-center gap-2">
                            {!config.randomDistribution ? (
                              <Slider
                                value={[config.questionTypes.mcq]}
                                onValueChange={([value]) =>
                                  updateQuestionTypes("mcq", value)
                                }
                                max={100}
                                min={0}
                                step={5}
                                className="w-24"
                              />
                            ) : null}
                            <span className="font-medium w-12 text-center">
                              {config.randomDistribution
                                ? "Auto"
                                : `${config.questionTypes.mcq}%`}
                            </span>
                          </div>
                        </div>

                        {/* True/False */}
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">True/False</Label>
                          <div className="flex items-center gap-2">
                            {!config.randomDistribution ? (
                              <Slider
                                value={[config.questionTypes.trueFalse]}
                                onValueChange={([value]) =>
                                  updateQuestionTypes("trueFalse", value)
                                }
                                max={100}
                                min={0}
                                step={5}
                                className="w-24"
                              />
                            ) : null}
                            <span className="font-medium w-12 text-center">
                              {config.randomDistribution
                                ? "Auto"
                                : `${config.questionTypes.trueFalse}%`}
                            </span>
                          </div>
                        </div>

                        {/* Fill in the Blank */}
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Fill-in-the-Blank</Label>
                          <div className="flex items-center gap-2">
                            {!config.randomDistribution ? (
                              <Slider
                                value={[config.questionTypes.fillInBlank]}
                                onValueChange={([value]) =>
                                  updateQuestionTypes("fillInBlank", value)
                                }
                                max={100}
                                min={0}
                                step={5}
                                className="w-24"
                              />
                            ) : null}
                            <span className="font-medium w-12 text-center">
                              {config.randomDistribution
                                ? "Auto"
                                : `${config.questionTypes.fillInBlank}%`}
                            </span>
                          </div>
                        </div>

                        {/* Short Answer */}
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Short Answer</Label>
                          <div className="flex items-center gap-2">
                            {!config.randomDistribution ? (
                              <Slider
                                value={[config.questionTypes.shortAnswer]}
                                onValueChange={([value]) =>
                                  updateQuestionTypes("shortAnswer", value)
                                }
                                max={100}
                                min={0}
                                step={5}
                                className="w-24"
                              />
                            ) : null}
                            <span className="font-medium w-12 text-center">
                              {config.randomDistribution
                                ? "Auto"
                                : `${config.questionTypes.shortAnswer}%`}
                            </span>
                          </div>
                        </div>

                        {!config.randomDistribution &&
                          totalPercentage !== 100 && (
                            <div className="flex items-center gap-2 mt-2 p-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                              <AlertCircle className="w-4 h-4 text-amber-600" />
                              <span className="text-sm text-amber-700 dark:text-amber-300">
                                Total percentage: {totalPercentage}% (should
                                equal 100%)
                              </span>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>


          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="sticky top-6">
            {/* Generation Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Generation Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Documents:
                  </span>
                  <span className="font-medium">{config.documents.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Pages:
                  </span>
                  <span className="font-medium">
                    {config.documents.reduce(
                      (sum, doc) => sum + doc.selectedPages.length,
                      0
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Questions:
                  </span>
                  <span className="font-medium">{config.totalQuestions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Difficulty:
                  </span>
                  <Badge variant="outline" className="capitalize">
                    {config.difficulty}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Question Type Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Question Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {!config.isPaid ? (
                  /* Freemium: Show selected question type */
                  <div className="text-center py-2">
                    <div className="text-sm text-muted-foreground mb-1">
                      All questions will be:
                    </div>
                    <Badge variant="default" className="text-sm">
                      {getQuestionTypeDisplayName(config.selectedQuestionType)}
                    </Badge>
                    <div className="text-lg font-bold mt-1">
                      {config.totalQuestions} questions
                    </div>
                  </div>
                ) : (
                  /* Premium: Show distribution breakdown */
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Multiple Choice:</span>
                      <span className="font-medium">
                        {config.randomDistribution
                          ? "Auto"
                          : Math.round(
                              (config.totalQuestions *
                                config.questionTypes.mcq) /
                                100
                            )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>True/False:</span>
                      <span className="font-medium">
                        {config.randomDistribution
                          ? "Auto"
                          : Math.round(
                              (config.totalQuestions *
                                config.questionTypes.trueFalse) /
                                100
                            )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Fill-in-the-Blank:</span>
                      <span className="font-medium">
                        {config.randomDistribution
                          ? "Auto"
                          : Math.round(
                              (config.totalQuestions *
                                config.questionTypes.fillInBlank) /
                                100
                            )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Short Answer:</span>
                      <span className="font-medium">
                        {config.randomDistribution
                          ? "Auto"
                          : Math.round(
                              (config.totalQuestions *
                                config.questionTypes.shortAnswer) /
                                100
                            )}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Generate Button */}
            <Card>
              <CardContent className="p-4">
                <Button
                  onClick={generateQuiz}
                  disabled={
                    isGenerating ||
                    config.documents.length === 0 ||
                    !config.title.trim()
                  }
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Generating Quiz...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Generate AI Quiz
                    </>
                  )}
                </Button>

                {config.documents.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    Select documents to continue
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
