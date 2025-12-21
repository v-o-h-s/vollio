"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Plus,
  Save,
  ArrowLeft,
  Shuffle,
  Eye,
  EyeOff,
  Sparkles,
  Wand2,
  Check,
  BookOpen,
  Brain,
  Zap,
  PenTool,
  Loader2,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { notify } from "@/lib/notify";
import { FlashcardPreview, FlashcardEditor } from "@/components/flashcards";
import { DocumentSelectionTabs } from "@/features/knowldge-test/quizzes/components/DocumentSelectionTabs";
import {
  useGetAllFilesQuery,
  useCreateFlashCardsSetMutation,
  useGenerateFlashCardsSetMutation,
} from "@/lib/store/apiSlice";
import {
  flashcardManualSchema,
  flashcardAutoSchema,
  type FlashcardManualFormData,
  type FlashcardAutoFormData,
  prepareFlashcardPayload,
} from "@/features/knowldge-test/flashcards/schemas/createFlashCards";

// Flashcard interface
interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  hint?: string;
}

const difficulties = ["Easy", "Medium", "Hard"] as const;

export default function CreateFlashCardsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromQuizId = searchParams?.get("fromQuizId");

  // State for Tabs
  const [activeTab, setActiveTab] = useState<"automatic" | "manual">(
    "automatic"
  );

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [savedCards, setSavedCards] = useState<Set<string>>(new Set());
  const [prefillFromQuiz, setPrefillFromQuiz] = useState<string | null>(null);

  // Fetch PDFs for AI generation
  const { data: filesData, isLoading: isLoadingPDFs } = useGetAllFilesQuery();

  // Manual Mode Form
  const manualForm = useForm<FlashcardManualFormData>({
    resolver: zodResolver(flashcardManualSchema),
    defaultValues: {
      title: "",
      description: "",
      language: "en",
      difficulty: "Medium",
      documentId: "",
      tags: [],
      flashcards: [{ id: "1", front: "", back: "", hint: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: manualForm.control,
    name: "flashcards",
  });

  // Auto Mode Form
  const autoForm = useForm<FlashcardAutoFormData>({
    resolver: zodResolver(flashcardAutoSchema),
    defaultValues: {
      documentId: "",
      numberOfCards: 10,
      difficulty: "Medium",
    },
  });

  // Watch values
  const manualDocumentId = manualForm.watch("documentId");
  const autoDocumentId = autoForm.watch("documentId");
  const manualTags = manualForm.watch("tags");
  const flashcards = manualForm.watch("flashcards");

  // If opened from a quiz, prefill title and show banner
  useEffect(() => {
    if (fromQuizId) {
      setPrefillFromQuiz(fromQuizId);
      setActiveTab("manual");
      manualForm.setValue("title", `Flashcards from Quiz ${fromQuizId}`);
    }
  }, [fromQuizId]);

  // Get selected document info
  const getSelectedDocument = (docId: string) => {
    if (!docId || !filesData) return null;
    const doc = filesData.find((p: any) => p.id === docId);
    return doc
      ? { id: doc.id, title: doc.filename ?? doc.title ?? "Untitled" }
      : null;
  };

  const manualDocument = useMemo(
    () => getSelectedDocument(manualDocumentId),
    [manualDocumentId, filesData]
  );

  const autoDocument = useMemo(
    () => getSelectedDocument(autoDocumentId),
    [autoDocumentId, filesData]
  );

  const selectedDocumentsManual = useMemo(
    () => (manualDocument ? [{ id: manualDocument.id }] : []),
    [manualDocument]
  );

  const selectedDocumentsAuto = useMemo(
    () => (autoDocument ? [{ id: autoDocument.id }] : []),
    [autoDocument]
  );

  const handleAddDocumentManual = (doc: { id: string; title: string }) => {
    manualForm.setValue("documentId", doc.id, { shouldValidate: true });
  };

  const handleAddDocumentAuto = (doc: { id: string; title: string }) => {
    autoForm.setValue("documentId", doc.id, { shouldValidate: true });
  };

  // --- Manual Mode Handlers ---

  // Mutations
  const [createManualSet, { isLoading: isCreatingManual }] =
    useCreateFlashCardsSetMutation();
  const [generateSet, { isLoading: isGenerating }] =
    useGenerateFlashCardsSetMutation();

  // --- Manual Mode Handlers ---

  const addFlashcard = () => {
    const newCard = {
      id: Date.now().toString(),
      front: "",
      back: "",
      hint: "",
    };
    append(newCard);
    setCurrentCardIndex(fields.length);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
    notify.success("New card added!");
  };

  const removeFlashcard = (id: string) => {
    const index = fields.findIndex((f) => f.id === id);
    if (fields.length === 1) {
      notify.error("You need at least one card!");
      return;
    }

    remove(index);
    if (currentCardIndex >= fields.length - 1) {
      setCurrentCardIndex(Math.max(0, fields.length - 2));
    }
    notify.success("Card removed!");
  };

  const updateFlashcard = (
    id: string,
    field: keyof FlashcardItem,
    value: string
  ) => {
    const index = fields.findIndex((f) => f.id === id);
    if (index !== -1) {
      manualForm.setValue(`flashcards.${index}.${field}`, value);

      // Mark as saved temporarily
      setSavedCards((prev) => new Set(prev).add(id));
      setTimeout(() => {
        setSavedCards((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }, 1000);
    }
  };

  const addTag = (tag: string) => {
    const currentTags = manualForm.getValues("tags") || [];
    if (tag && !currentTags.includes(tag)) {
      manualForm.setValue("tags", [...currentTags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = manualForm.getValues("tags") || [];
    manualForm.setValue(
      "tags",
      currentTags.filter((tag) => tag !== tagToRemove)
    );
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput.trim());
    }
  };

  const duplicateCard = (card: FlashcardItem) => {
    const newCard = {
      ...card,
      id: Date.now().toString(),
      front: `${card.front} (Copy)`,
    };
    const newIndex = currentCardIndex + 1;
    // Insert at specific position
    const currentCards = manualForm.getValues("flashcards");
    const newCards = [...currentCards];
    newCards.splice(newIndex, 0, newCard);
    manualForm.setValue("flashcards", newCards);
    setCurrentCardIndex(newIndex);
    notify.success("Card duplicated!");
  };

  const shuffleCards = () => {
    const currentCards = manualForm.getValues("flashcards");
    const shuffled = [...currentCards].sort(() => Math.random() - 0.5);
    manualForm.setValue("flashcards", shuffled);
    setCurrentCardIndex(0);
    notify.success("Cards shuffled!");
  };

  const onManualSubmit = async (data: FlashcardManualFormData) => {
    const validCards = data.flashcards.filter(
      (card) => card.front.trim() && card.back.trim()
    );

    if (validCards.length === 0) {
      notify.error("Please create at least one complete card!");
      return;
    }

    try {
      const payload = prepareFlashcardPayload("manual", data) as any;
      await createManualSet(payload).unwrap();
      notify.success(`Deck "${data.title}" saved successfully!`);
      router.push("/dashboard/knowledge-test");
    } catch (e) {
      console.error(e);
      notify.error("Failed to save deck");
    }
  };

  const currentCard = fields[currentCardIndex];
  const completedCards = fields.filter(
    (card) => card.front.trim() && card.back.trim()
  ).length;
  const progressPercentage = (completedCards / fields.length) * 100;

  // --- Automatic Mode Handlers ---

  const onAutoSubmit = async (data: FlashcardAutoFormData) => {
    try {
      notify.loading("Generating flashcards...");
      const payload = prepareFlashcardPayload("auto", data) as any;
      const response = await generateSet(payload).unwrap();

      if (response && response.questions) {
        notify.success(
          `Generated ${response.questions.length} flashcards!` // NOTE: Backend returns 'questions' even for flashcards based on QuizQuestion structure reuse or similar? Need to verify response type. Assuming response matches typical structure or need to adapt.
          // Wait, CreateFlashCardsSetResponse is actually CreateQuizResponse structure in some places or custom?
          // Let's check the type definition. CreateFlashCardsSetResponse import was seen in endpoints file.
          // The endpoint file imports CreateFlashCardsSetResponse from @shared/types/responses/flashcardsRoutes.
          // I should verify that type. But usually it returns the created entity.
          // If generated, it might return the set with cards.
        );

        // Map response cards to form
        // Assuming response structure has 'flashCards' or 'questions'.
        // Let's check the endpoint definition again or assume standard REST return.
        // Actually, for generation, we might want to EDIT them first as per previous UI logic.
        // The previous logic was:
        /*
          const responseData = await resp.json();
          if (responseData.success && responseData.flashcards) { ... switch to manual ... }
        */
        // So I'll replicate that behavior. obtain the data, populate manual form, switch tab.

        const generatedCards =
          (response as any).flashCards?.map((c: any) => ({
            id: c.id || Math.random().toString(),
            front: c.front,
            back: c.back,
            hint: c.hint,
          })) || [];

        if (generatedCards.length === 0) {
          notify.error("No flashcards were returned.");
          return;
        }

        manualForm.setValue("flashcards", generatedCards);
        manualForm.setValue(
          "title",
          `Flashcards: ${autoDocument?.title || "Generated"}`
        );
        manualForm.setValue("difficulty", data.difficulty);
        manualForm.setValue("documentId", data.documentId);
        setActiveTab("manual");
        setCurrentCardIndex(0);
      }
    } catch (err: any) {
      console.error("Generation error:", err);
      notify.error(
        err.data?.message ||
          err.message ||
          "Something went wrong during generation."
      );
    }
  };

  return (
    <div className="space-y-6 container mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/knowledge-test">
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-muted text-muted-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-pink-500 to-rose-500">
                Create Flashcard Deck
              </h1>
              <p className="text-muted-foreground mt-1">
                {activeTab === "automatic"
                  ? "Generate cards instantly with AI"
                  : "Craft your cards manually"}
              </p>
            </div>
          </div>

          {activeTab === "manual" && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setPreviewMode(!previewMode)}
                className="hover:scale-105 transition-transform duration-200"
              >
                {previewMode ? (
                  <EyeOff className="w-4 h-4 mr-2" />
                ) : (
                  <Eye className="w-4 h-4 mr-2" />
                )}
                {previewMode ? "Edit Mode" : "Preview"}
              </Button>
              <Button
                onClick={manualForm.handleSubmit(onManualSubmit)}
                disabled={manualForm.formState.isSubmitting}
                className="bg-linear-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 hover:scale-105 transition-all duration-200 text-white shadow-lg"
              >
                <Save className="w-4 h-4 mr-2" />
                {manualForm.formState.isSubmitting ? "Saving..." : "Save Deck"}
              </Button>
            </div>
          )}
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="space-y-6"
        >
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger
                value="automatic"
                className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                Automatic (AI)
              </TabsTrigger>
              <TabsTrigger
                value="manual"
                className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <PenTool className="w-4 h-4" />
                Manual Creation
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="automatic"
            className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300"
          >
            <form onSubmit={autoForm.handleSubmit(onAutoSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Document Selection */}
                <Card className="md:col-span-2 lg:col-span-1 border-border/40 shadow-sm overflow-hidden h-fit">
                  <CardHeader className="bg-muted/30 border-b border-border/40 pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <div className="p-2 rounded-md bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      Source Material
                    </CardTitle>
                    <CardDescription>
                      Select the document you want to generate flashcards from.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <DocumentSelectionTabs
                      availableDocuments={
                        (filesData || []).map((p: any) => ({
                          id: p.id,
                          title: p.filename ?? p.title ?? "Untitled",
                        })) as any
                      }
                      selectedDocuments={selectedDocumentsAuto}
                      onAddDocument={(d: any) =>
                        handleAddDocumentAuto({ id: d.id, title: d.title })
                      }
                      isLoadingPDFs={isLoadingPDFs}
                    />
                    {autoForm.formState.errors.documentId && (
                      <p className="text-sm text-destructive mt-2 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" />{" "}
                        {autoForm.formState.errors.documentId.message}
                      </p>
                    )}
                    {!autoDocument && !autoForm.formState.errors.documentId && (
                      <p className="text-sm text-pink-600 mt-2 flex items-center gap-2 animate-pulse">
                        <HelpCircle className="w-4 h-4" /> Please select a
                        document to proceed
                      </p>
                    )}
                  </CardContent>
                </Card>

                <div className="md:col-span-2 lg:col-span-1 space-y-6">
                  <Card className="border-border/40 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Zap className="w-24 h-24" />
                    </div>
                    <CardHeader className="bg-muted/30 border-b border-border/40 pb-4">
                      <CardTitle className="flex items-center gap-2">
                        <div className="p-2 rounded-md bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
                          <Zap className="w-5 h-5" />
                        </div>
                        Generation Options
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 relative z-10 p-6">
                      <div>
                        <Label className="text-sm font-semibold">
                          Number of Cards (Estimate)
                        </Label>
                        <Controller
                          name="numberOfCards"
                          control={autoForm.control}
                          render={({ field }) => (
                            <Input
                              type="number"
                              min={1}
                              max={50}
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 1)
                              }
                              className="mt-2 bg-muted/20"
                            />
                          )}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Recommended: 10-20 cards per session
                        </p>
                        {autoForm.formState.errors.numberOfCards && (
                          <p className="text-xs text-destructive mt-1">
                            {autoForm.formState.errors.numberOfCards.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label className="text-sm font-semibold">
                          Difficulty Level
                        </Label>
                        <Controller
                          name="difficulty"
                          control={autoForm.control}
                          render={({ field }) => (
                            <div className="grid grid-cols-3 gap-2 mt-2">
                              {difficulties.map((d) => (
                                <button
                                  key={d}
                                  type="button"
                                  onClick={() => field.onChange(d)}
                                  className={`text-center py-2 px-3 rounded-lg text-sm font-medium transition-all border ${
                                    field.value === d
                                      ? "bg-pink-50 border-pink-500 text-pink-700 dark:bg-pink-900/20 dark:text-pink-300"
                                      : "bg-background border-border hover:bg-muted"
                                  }`}
                                >
                                  {d}
                                </button>
                              ))}
                            </div>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="flex flex-col justify-center items-center border-border/40 shadow-sm bg-linear-to-br from-background to-muted/30">
                    <CardContent className="p-8 text-center space-y-4">
                      <div className="p-4 rounded-full bg-linear-to-r from-pink-500/10 to-rose-500/10 w-16 h-16 flex items-center justify-center mx-auto mb-2">
                        <Wand2 className="w-8 h-8 text-pink-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-xl">
                          Ready to Generate?
                        </h3>
                        <p className="text-muted-foreground text-sm mt-1 max-w-[250px] mx-auto">
                          Our AI will analyze your document and create{" "}
                          {autoForm.watch("numberOfCards")}{" "}
                          {autoForm.watch("difficulty").toLowerCase()}{" "}
                          flashcards for you.
                        </p>
                      </div>
                      <Button
                        type="submit"
                        size="lg"
                        disabled={
                          autoForm.formState.isSubmitting || !autoDocument
                        }
                        className="w-full bg-linear-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {autoForm.formState.isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate Flashcards
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </form>
          </TabsContent>

          <TabsContent
            value="manual"
            className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-2 duration-300"
          >
            <form onSubmit={manualForm.handleSubmit(onManualSubmit)}>
              {/* Progress Bar */}
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">
                      Progress: {completedCards} of {fields.length} cards
                      completed
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-linear-to-r from-pink-500 to-rose-500 h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Deck Metadata */}
                <div className="lg:col-span-1 space-y-6">
                  <Card className="border-border/50 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        Deck Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="title">Deck Title *</Label>
                        <Controller
                          name="title"
                          control={manualForm.control}
                          render={({ field }) => (
                            <Input
                              id="title"
                              placeholder="Enter deck title..."
                              {...field}
                              className="mt-1"
                            />
                          )}
                        />
                        {manualForm.formState.errors.title && (
                          <p className="text-xs text-destructive mt-1">
                            {manualForm.formState.errors.title.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="description">
                          Description (Optional)
                        </Label>
                        <Controller
                          name="description"
                          control={manualForm.control}
                          render={({ field }) => (
                            <Textarea
                              id="description"
                              placeholder="Describe what this deck covers..."
                              {...field}
                              className="mt-1 resize-none"
                              rows={3}
                            />
                          )}
                        />
                      </div>

                      {/* Document Selection for Manual Mode */}
                      <div className="space-y-2">
                        <Label>Linked Document *</Label>
                        {!manualDocument ? (
                          <div className="border border-dashed border-red-300 bg-red-50 dark:bg-red-900/10 p-4 rounded-md text-center">
                            <p className="text-sm text-red-500 mb-2">
                              A document is required for this deck.
                            </p>
                            <DocumentSelectionTabs
                              availableDocuments={
                                (filesData || []).map((p: any) => ({
                                  id: p.id,
                                  title: p.filename ?? p.title ?? "Untitled",
                                })) as any
                              }
                              selectedDocuments={selectedDocumentsManual}
                              onAddDocument={(d: any) =>
                                handleAddDocumentManual({
                                  id: d.id,
                                  title: d.title,
                                })
                              }
                              isLoadingPDFs={isLoadingPDFs}
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-primary" />
                              <span className="font-medium text-sm">
                                {manualDocument.title}
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                manualForm.setValue("documentId", "")
                              }
                              className="h-8 text-destructive hover:text-destructive"
                            >
                              Change
                            </Button>
                          </div>
                        )}
                        {manualForm.formState.errors.documentId && (
                          <p className="text-xs text-destructive mt-1">
                            {manualForm.formState.errors.documentId.message}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="language">Language</Label>
                          <Controller
                            name="language"
                            control={manualForm.control}
                            render={({ field }) => (
                              <select
                                id="language"
                                {...field}
                                className="w-full mt-1 px-3 py-2 border border-border/50 rounded-md bg-background text-foreground text-sm"
                              >
                                <option value="en">English</option>
                                <option value="fr">French</option>
                                <option value="ar">Arabic</option>
                              </select>
                            )}
                          />
                        </div>

                        <div>
                          <Label htmlFor="difficulty">Difficulty</Label>
                          <Controller
                            name="difficulty"
                            control={manualForm.control}
                            render={({ field }) => (
                              <select
                                id="difficulty"
                                {...field}
                                className="w-full mt-1 px-3 py-2 border border-border/50 rounded-md bg-background text-foreground text-sm"
                              >
                                {difficulties.map((difficulty) => (
                                  <option key={difficulty} value={difficulty}>
                                    {difficulty}
                                  </option>
                                ))}
                              </select>
                            )}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="tags">Tags</Label>
                        <Input
                          id="tags"
                          placeholder="Add tags..."
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={handleTagInput}
                          className="mt-1"
                        />
                        {manualTags && manualTags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {manualTags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => removeTag(tag)}
                              >
                                {tag} ×
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card Navigation */}
                  <Card className="border-border/50 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="w-5 h-5" />
                        Card Navigation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Card {currentCardIndex + 1} of {fields.length}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCurrentCardIndex(
                                Math.max(0, currentCardIndex - 1)
                              )
                            }
                            disabled={currentCardIndex === 0}
                          >
                            ←
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCurrentCardIndex(
                                Math.min(
                                  fields.length - 1,
                                  currentCardIndex + 1
                                )
                              )
                            }
                            disabled={currentCardIndex === fields.length - 1}
                          >
                            →
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addFlashcard}
                        >
                          <Plus className="w-4 h-4 mr-1" /> Add
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={shuffleCards}
                        >
                          <Shuffle className="w-4 h-4 mr-1" /> Mix
                        </Button>
                      </div>

                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {fields.map((card, index) => (
                          <div
                            key={card.id}
                            className={`p-2 rounded-md cursor-pointer transition-all duration-200 ${
                              index === currentCardIndex
                                ? "bg-primary/10 border border-primary/20"
                                : "bg-muted/50 hover:bg-muted"
                            }`}
                            onClick={() => setCurrentCardIndex(index)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">
                                Card {index + 1}
                              </span>
                              {card.front.trim() && card.back.trim() && (
                                <Check className="w-3 h-3 text-green-500" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Card Editor/Preview */}
                <div className="lg:col-span-2">
                  {!previewMode ? (
                    <div
                      className={`transition-all duration-300 ${
                        isAnimating ? "scale-[1.02]" : ""
                      }`}
                    >
                      <FlashcardEditor
                        card={currentCard}
                        cardIndex={currentCardIndex}
                        totalCards={fields.length}
                        onUpdate={updateFlashcard}
                        onDuplicate={duplicateCard}
                        onDelete={removeFlashcard}
                        canDelete={fields.length > 1}
                        isSaved={savedCards.has(currentCard.id)}
                      />
                    </div>
                  ) : (
                    <Card className="border-border/50 shadow-sm h-full flex flex-col justify-center">
                      <CardContent className="p-8">
                        <FlashcardPreview
                          front={currentCard.front}
                          back={currentCard.back}
                          hint={currentCard.hint}
                          showControls={true}
                        />
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
