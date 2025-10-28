"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetPDFsQuery } from "@/lib/store/apiSlice";
import { DocumentSelectionTabs } from "@/components/quiz/DocumentSelectionTabs";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  Brain,
  AlertCircle,
  BookOpen,
  Target,
  Zap,
  Crown,
  Info,
  FileStack,
  Sliders,
  Upload,
  X,
  CheckCircle,
  FileQuestion,
} from "lucide-react";

// Note: Using console.log for notifications - replace with your preferred toast system

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

interface SampleQuiz {
  id: string;
  name: string;
  file: File;
  questions: number;
  uploadedAt: Date;
}

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
  sampleQuizzes: SampleQuiz[]; // Premium feature
  useSampleQuizzes: boolean; // Premium feature
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
    sampleQuizzes: [], // Premium feature
    useSampleQuizzes: false, // Premium feature
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploadingSample, setIsUploadingSample] = useState(false);

  // Use RTK Query to load available documents
  const {
    data: pdfData,
    isLoading: isLoadingPDFs,
    error: pdfError,
    refetch: refetchPDFs,
  } = useGetPDFsQuery();
  // Transform PDFDocument to match DocumentSelectionTabs interface
  const availableDocuments = (pdfData?.pdfs || []).map((pdf) => ({
    id: pdf.id,
    title: pdf.filename, // Map filename to title for component compatibility
    page_count: 1, // TODO: Add page count to API response
  }));

  // Add document to selection
  const addDocument = (doc: {
    id: string;
    title: string;
    page_count?: number;
  }) => {
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

  // Sample quiz handling functions (Premium only)
  const handleSampleQuizUpload = async (files: FileList | null) => {
    if (!files || !config.isPaid) return;

    setIsUploadingSample(true);

    try {
      for (const file of Array.from(files)) {
        // Validate file type (accept common quiz formats)
        const validTypes = [
          "application/json",
          "text/plain",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/pdf",
        ];

        if (
          !validTypes.includes(file.type) &&
          !file.name.match(/\.(json|txt|docx|pdf)$/i)
        ) {
          toast.error(
            `${file.name}: Please upload JSON, TXT, DOCX, or PDF files`
          );
          continue;
        }

        // Simulate quiz analysis (in real implementation, this would parse the file)
        const estimatedQuestions = Math.floor(Math.random() * 20) + 5; // 5-25 questions

        const newSampleQuiz: SampleQuiz = {
          id: `sample-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
          file: file,
          questions: estimatedQuestions,
          uploadedAt: new Date(),
        };

        setConfig((prev) => ({
          ...prev,
          sampleQuizzes: [...prev.sampleQuizzes, newSampleQuiz],
        }));

        toast.success(
          `${file.name} uploaded successfully! Found ~${estimatedQuestions} questions.`
        );
      }
    } catch (error) {
      console.error("Sample quiz upload error:", error);
      toast.error("Failed to upload sample quiz. Please try again.");
    } finally {
      setIsUploadingSample(false);
    }
  };

  const removeSampleQuiz = (quizId: string) => {
    setConfig((prev) => ({
      ...prev,
      sampleQuizzes: prev.sampleQuizzes.filter((quiz) => quiz.id !== quizId),
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
        // Include sample quiz metadata for premium users
        sampleQuizMetadata:
          config.isPaid && config.useSampleQuizzes
            ? config.sampleQuizzes.map((quiz) => ({
                id: quiz.id,
                name: quiz.name,
                questions: quiz.questions,
                uploadedAt: quiz.uploadedAt.toISOString(),
              }))
            : [],
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
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Brain className="w-6 h-6 text-orange-600 dark:text-orange-400" />
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
                    Upgrade to Pro for advanced question types, custom
                    distributions, and sample quiz analysis
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
                    Enjoy unlimited questions, custom distributions, sample quiz
                    analysis, and advanced features
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
            <TabsList className="grid w-full grid-cols-4">
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
                value="samples"
                className="flex items-center gap-2"
                disabled={!config.isPaid}
              >
                <FileQuestion className="w-4 h-4" />
                Sample Quizzes
                <Crown className="w-3 h-3 text-amber-500" />
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

            {/* Sample Quizzes Tab - Always Visible */}
            <TabsContent value="samples" className="space-y-6">
              <Card className="relative">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileQuestion className="w-5 h-5" />
                    Sample Quizzes
                    <Crown className="w-4 h-4 text-amber-500" />
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Upload sample quizzes to help the AI generate similar
                    questions and maintain your preferred style and format.
                  </p>
                </CardHeader>

                {/* Premium Overlay for Free Users */}
                {!config.isPaid && (
                  <div className="absolute inset-0 bg-background/90 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
                    <div className="text-center p-6 max-w-md">
                      <Crown className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Premium Feature
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Upload sample quizzes to help AI generate questions that
                        match your preferred style and format.
                      </p>
                      <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade to Premium
                      </Button>
                    </div>
                  </div>
                )}

                <CardContent className="space-y-6">
                  {/* Sample Quiz Toggle */}
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <Label className="text-sm font-medium">
                        Use Sample Quizzes
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Generate questions similar to your uploaded samples
                      </p>
                    </div>
                    <Switch
                      checked={config.useSampleQuizzes}
                      onCheckedChange={(checked) =>
                        setConfig((prev) => ({
                          ...prev,
                          useSampleQuizzes: checked,
                        }))
                      }
                      disabled={config.sampleQuizzes.length === 0}
                    />
                  </div>

                  {/* Upload Area */}
                  <div className="space-y-4">
                    <Label>Upload Sample Quizzes</Label>
                    <div
                      className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors"
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add(
                          "border-primary",
                          "bg-primary/5"
                        );
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove(
                          "border-primary",
                          "bg-primary/5"
                        );
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove(
                          "border-primary",
                          "bg-primary/5"
                        );
                        const files = e.dataTransfer.files;
                        if (files.length > 0) {
                          handleSampleQuizUpload(files);
                        }
                      }}
                    >
                      <div className="flex flex-col items-center gap-4">
                        <div className="rounded-full p-4 bg-muted/50">
                          <Upload className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-medium mb-1">
                            Upload Sample Quiz Files
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Drag & drop or click to browse (JSON, TXT, DOCX,
                            PDF)
                          </p>
                          <Button
                            variant="outline"
                            disabled={isUploadingSample}
                            onClick={() => {
                              const input = document.createElement("input");
                              input.type = "file";
                              input.multiple = true;
                              input.accept = ".json,.txt,.docx,.pdf";
                              input.onchange = (e) => {
                                const target = e.target as HTMLInputElement;
                                handleSampleQuizUpload(target.files);
                              };
                              input.click();
                            }}
                          >
                            {isUploadingSample ? (
                              <>
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                Analyzing...
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
                          <FileQuestion className="w-3 h-3" />
                          <span>
                            Supports JSON, TXT, DOCX, and PDF quiz formats
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Uploaded Sample Quizzes */}
                  {config.sampleQuizzes.length > 0 && (
                    <div className="space-y-4">
                      <Label>
                        Uploaded Sample Quizzes ({config.sampleQuizzes.length})
                      </Label>
                      <div className="space-y-3">
                        {config.sampleQuizzes.map((quiz) => (
                          <div
                            key={quiz.id}
                            className="flex items-center justify-between p-4 border rounded-lg bg-muted/20"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-emerald-500/10 rounded-lg">
                                <CheckCircle className="w-4 h-4 text-emerald-600" />
                              </div>
                              <div>
                                <p className="font-medium">{quiz.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  ~{quiz.questions} questions • Uploaded{" "}
                                  {quiz.uploadedAt.toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSampleQuiz(quiz.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      {config.useSampleQuizzes && (
                        <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <div className="text-sm">
                            <p className="font-medium text-emerald-800 dark:text-emerald-200">
                              Sample-based generation enabled
                            </p>
                            <p className="text-emerald-700 dark:text-emerald-300">
                              AI will analyze your samples to generate similar
                              questions
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Help Text */}
                  <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                    <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">
                      How Sample Quizzes Work
                    </h4>
                    <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                      <li>
                        • Upload existing quizzes in various formats (JSON, TXT,
                        DOCX, PDF)
                      </li>
                      <li>
                        • AI analyzes question patterns, difficulty, and style
                      </li>
                      <li>
                        • Generated questions match your preferred format and
                        complexity
                      </li>
                      <li>
                        • Maintains consistency with your existing quiz
                        standards
                      </li>
                    </ul>
                  </div>
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

                    <div className="space-y-4">
                      {/* Free User: Single Question Type Selection */}
                      {!config.isPaid && (
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
                      )}

                      {/* Advanced Distribution Controls - Always Visible */}
                      <div
                        className={`space-y-3 ${
                          !config.isPaid ? "relative" : ""
                        }`}
                      >
                        {/* Premium Overlay for Free Users */}
                        {!config.isPaid && (
                          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
                            <div className="text-center p-4">
                              <Crown className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                              <p className="font-medium text-foreground mb-1">
                                Premium Feature
                              </p>
                              <p className="text-sm text-muted-foreground mb-3">
                                Upgrade to customize question type distributions
                              </p>
                              <Button
                                size="sm"
                                variant="default"
                                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                              >
                                <Crown className="w-4 h-4 mr-2" />
                                Upgrade Now
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Random Distribution Toggle */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="random-dist" className="text-sm">
                              Random Distribution
                            </Label>
                            {!config.isPaid && (
                              <Crown className="w-3 h-3 text-amber-500" />
                            )}
                          </div>
                          <Switch
                            id="random-dist"
                            checked={config.randomDistribution}
                            onCheckedChange={(checked) => {
                              if (!config.isPaid) {
                                toast.error(
                                  "Upgrade to Premium to use custom distributions"
                                );
                                return;
                              }
                              setConfig((prev) => ({
                                ...prev,
                                randomDistribution: checked,
                              }));
                            }}
                            disabled={!config.isPaid}
                          />
                        </div>

                        {/* Distribution Sliders */}
                        <div className="space-y-3">
                          {/* Multiple Choice */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Label className="text-sm">
                                Multiple Choice (MCQ)
                              </Label>
                              {!config.isPaid && (
                                <Crown className="w-3 h-3 text-amber-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {!config.randomDistribution ? (
                                <Slider
                                  value={[config.questionTypes.mcq]}
                                  onValueChange={([value]) => {
                                    if (!config.isPaid) {
                                      toast.error(
                                        "Upgrade to Premium to customize question distributions"
                                      );
                                      return;
                                    }
                                    updateQuestionTypes("mcq", value);
                                  }}
                                  max={100}
                                  min={0}
                                  step={5}
                                  className={`w-24 ${
                                    !config.isPaid ? "opacity-50" : ""
                                  }`}
                                  disabled={!config.isPaid}
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
                            <div className="flex items-center gap-2">
                              <Label className="text-sm">True/False</Label>
                              {!config.isPaid && (
                                <Crown className="w-3 h-3 text-amber-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {!config.randomDistribution ? (
                                <Slider
                                  value={[config.questionTypes.trueFalse]}
                                  onValueChange={([value]) => {
                                    if (!config.isPaid) {
                                      toast.error(
                                        "Upgrade to Premium to customize question distributions"
                                      );
                                      return;
                                    }
                                    updateQuestionTypes("trueFalse", value);
                                  }}
                                  max={100}
                                  min={0}
                                  step={5}
                                  className={`w-24 ${
                                    !config.isPaid ? "opacity-50" : ""
                                  }`}
                                  disabled={!config.isPaid}
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
                            <div className="flex items-center gap-2">
                              <Label className="text-sm">
                                Fill-in-the-Blank
                              </Label>
                              {!config.isPaid && (
                                <Crown className="w-3 h-3 text-amber-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {!config.randomDistribution ? (
                                <Slider
                                  value={[config.questionTypes.fillInBlank]}
                                  onValueChange={([value]) => {
                                    if (!config.isPaid) {
                                      toast.error(
                                        "Upgrade to Premium to customize question distributions"
                                      );
                                      return;
                                    }
                                    updateQuestionTypes("fillInBlank", value);
                                  }}
                                  max={100}
                                  min={0}
                                  step={5}
                                  className={`w-24 ${
                                    !config.isPaid ? "opacity-50" : ""
                                  }`}
                                  disabled={!config.isPaid}
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
                            <div className="flex items-center gap-2">
                              <Label className="text-sm">Short Answer</Label>
                              {!config.isPaid && (
                                <Crown className="w-3 h-3 text-amber-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {!config.randomDistribution ? (
                                <Slider
                                  value={[config.questionTypes.shortAnswer]}
                                  onValueChange={([value]) => {
                                    if (!config.isPaid) {
                                      toast.error(
                                        "Upgrade to Premium to customize question distributions"
                                      );
                                      return;
                                    }
                                    updateQuestionTypes("shortAnswer", value);
                                  }}
                                  max={100}
                                  min={0}
                                  step={5}
                                  className={`w-24 ${
                                    !config.isPaid ? "opacity-50" : ""
                                  }`}
                                  disabled={!config.isPaid}
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
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="sticky top-6 flex flex-col gap-4">
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
                {config.isPaid && config.sampleQuizzes.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Sample Quizzes:
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">
                        {config.sampleQuizzes.length}
                      </span>
                      {config.useSampleQuizzes && (
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                      )}
                    </div>
                  </div>
                )}
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

            {/* Premium Upgrade Card - Free Users Only */}
            {!config.isPaid && (
              <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                <CardContent className="p-4">
                  <div className="text-center space-y-3">
                    <Crown className="w-8 h-8 text-amber-500 mx-auto" />
                    <div>
                      <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                        Unlock Premium Features
                      </h3>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                        Get unlimited questions, custom distributions, and
                        sample quiz analysis
                      </p>
                    </div>
                    <div className="space-y-2 text-xs text-amber-700 dark:text-amber-300">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3" />
                        <span>Up to 100 questions per quiz</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3" />
                        <span>Custom question type distributions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3" />
                        <span>Sample quiz analysis & matching</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3" />
                        <span>Mixed difficulty levels</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sample Quiz Status - Premium Only */}
            {config.isPaid && config.sampleQuizzes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    Sample Analysis
                    <Crown className="w-4 h-4 text-amber-500" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Uploaded Samples:</span>
                    <span className="font-medium">
                      {config.sampleQuizzes.length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Sample Questions:</span>
                    <span className="font-medium">
                      ~
                      {config.sampleQuizzes.reduce(
                        (sum, quiz) => sum + quiz.questions,
                        0
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Style Matching:</span>
                    <span className="font-medium">
                      {config.useSampleQuizzes ? (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Enabled
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Disabled</span>
                      )}
                    </span>
                  </div>
                  {config.useSampleQuizzes && (
                    <div className="mt-3 p-2 bg-emerald-50 dark:bg-emerald-950/20 rounded text-xs text-emerald-700 dark:text-emerald-300">
                      AI will generate questions matching your sample style and
                      complexity
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

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
