"use client";

import React, { Suspense, useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Save,
  ArrowLeft,
  Shuffle,
  Eye,
  EyeOff,
  Zap,
  PenTool,
  Loader2,
  BookOpen,
  Check,
  X,
  Sparkles,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { RiRobot3Fill as RobotIcon } from "react-icons/ri";
import Link from "next/link";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { FlashcardPreview, FlashcardEditor } from "@/components/flashcards";
import { DocumentSelectionTabs } from "@/features/knowldge-test/quizzes/components/DocumentSelectionTabs";
import { FeatureErrorDialog } from "@/components/errors/FeatureErrorDialog";
import {
  useGetAllDocumentsQuery,
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

function CreateFlashCardsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromQuizId = searchParams?.get("fromQuizId");

  const [activeTab, setActiveTab] = useState<"automatic" | "manual">(
    "automatic",
  );
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  const [savedCards, setSavedCards] = useState<Set<string>>(new Set());

  // Fetch Documents
  const { data: documentsData, isLoading: isLoadingDocuments } =
    useGetAllDocumentsQuery();

  // Mutations
  const [createManualSet, { isLoading: isSaving }] =
    useCreateFlashCardsSetMutation();
  const [generateSet, { isLoading: isGenerating, error: generateError }] =
    useGenerateFlashCardsSetMutation();
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [lastAutoData, setLastAutoData] =
    useState<FlashcardAutoFormData | null>(null);

  // Manual Mode Form (used for review after AI generation)
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

  const { fields, append, remove, replace } = useFieldArray({
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

  // Prefill if from quiz
  useEffect(() => {
    if (fromQuizId) {
      manualForm.setValue("title", `Flashcards from Quiz ${fromQuizId}`);
    }
  }, [fromQuizId, manualForm]);

  // Document Helpers
  const getSelectedDocument = (docId: string) => {
    if (!docId || !documentsData) return null;
    const doc = documentsData.find((p: any) => p.id === docId) as any;
    return doc
      ? { id: doc.id, title: doc.name ?? doc.title ?? "Untitled" }
      : null;
  };

  const manualDocumentId = manualForm.watch("documentId");
  const autoDocumentId = autoForm.watch("documentId");

  const manualDocument = useMemo(
    () => getSelectedDocument(manualDocumentId),
    [manualDocumentId, documentsData],
  );
  const autoDocument = useMemo(
    () => getSelectedDocument(autoDocumentId),
    [autoDocumentId, documentsData],
  );

  // Handlers
  const onAutoSubmit = async (data: FlashcardAutoFormData) => {
    const loadingToast = toast.loading(
      "Generating flashcards... This may take a moment.",
    );
    try {
      const response = await generateSet(
        prepareFlashcardPayload("auto", data) as any,
      ).unwrap();

      const generatedCards =
        (response as any).flashCards?.map((c: any) => ({
          id: c.id || Math.random().toString(),
          front: c.front,
          back: c.back,
          hint: c.hint || "",
        })) || [];

      toast.dismiss(loadingToast);
      if (generatedCards.length > 0) {
        manualForm.setValue("flashcards", generatedCards);
        manualForm.setValue(
          "title",
          `AI Deck: ${autoDocument?.title || "Generated"}`,
        );
        manualForm.setValue("documentId", data.documentId);
        manualForm.setValue("difficulty", data.difficulty);
        setActiveTab("manual");
        toast.success(`Generated ${generatedCards.length} cards!`);
      }
    } catch (err: any) {
      toast.dismiss(loadingToast);
      setLastAutoData(data);
      setIsErrorModalOpen(true);
      console.error("Flashcard generation failed:", err);
    }
  };

  const onManualSubmit = async (data: FlashcardManualFormData) => {
    try {
      await createManualSet(
        prepareFlashcardPayload("manual", data) as any,
      ).unwrap();
      toast.success("Deck saved successfully!");
      router.push("/knowledge-test");
    } catch (e) {
      toast.error("Failed to save deck");
    }
  };

  const updateFlashcard = (
    id: string,
    field: keyof FlashcardItem,
    value: string,
  ) => {
    const index = fields.findIndex((f) => f.id === id);
    if (index !== -1) {
      manualForm.setValue(`flashcards.${index}.${field}`, value);
      setSavedCards((prev) => new Set(prev).add(id));
      setTimeout(
        () =>
          setSavedCards((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          }),
        1500,
      );
    }
  };

  const progress =
    (fields.filter((f) => f.front && f.back).length / fields.length) * 100;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Link href="/knowledge-test">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">
              {activeTab === "automatic"
                ? "Create New Flashcards"
                : "Review & Edit Flashcards"}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground ml-10">
            {activeTab === "automatic"
              ? "Generate flashcards automatically from your documents."
              : "Review, edit, and save your flashcards."}
          </p>
        </div>

        {activeTab === "manual" && (
          <div className="flex items-center gap-2 ml-10 md:ml-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("automatic")}
            >
              Back to Config
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
            >
              {previewMode ? (
                <>
                  <PenTool className="w-4 h-4 mr-2" />
                  Edit Mode
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Mode
                </>
              )}
            </Button>
            <Button
              onClick={manualForm.handleSubmit(onManualSubmit)}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Deck
            </Button>
          </div>
        )}
      </div>

      <Tabs id="flashcards-create-tabs" value={activeTab} className="space-y-8">
        <TabsContent value="automatic" className="outline-none">
          <div className="space-y-6 max-w-3xl mx-auto">
            {/* Document Selection */}
            <div className="bg-background rounded-xl border p-6 space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Source Material
                </h3>
                <p className="text-sm text-muted-foreground">
                  Select a document to generate flashcards from.
                </p>
              </div>

              <DocumentSelectionTabs
                availableDocuments={
                  (documentsData || []).map((p: any) => ({
                    id: p.id,
                    title: p.name ?? p.title ?? "Untitled",
                  })) as any
                }
                selectedDocumentId={autoDocumentId}
                onSelectDocument={(d: any) =>
                  autoForm.setValue("documentId", d.id, {
                    shouldValidate: true,
                  })
                }
                isLoadingDocuments={isLoadingDocuments}
              />
            </div>

            {/* Configuration */}
            <form onSubmit={autoForm.handleSubmit(onAutoSubmit)}>
              <div className="bg-background rounded-xl border p-6 space-y-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Configuration
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Customize the generation parameters.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Controller
                      name="numberOfCards"
                      control={autoForm.control}
                      render={({ field }) => (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            {...field}
                            min={1}
                            max={50}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 1)
                            }
                          />
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            Cards
                          </span>
                        </div>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Controller
                      name="difficulty"
                      control={autoForm.control}
                      render={({ field }) => (
                        <div className="grid grid-cols-3 gap-2">
                          {difficulties.map((d) => (
                            <Button
                              key={d}
                              type="button"
                              variant={
                                field.value === d ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => field.onChange(d)}
                              className="w-full"
                            >
                              {d}
                            </Button>
                          ))}
                        </div>
                      )}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isGenerating || !autoDocumentId}
                    className="w-full"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Deck
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="manual" className="outline-none space-y-6">
          {/* Manual Review UI */}
          <div className="grid grid-cols-12 gap-6">
            {/* Sidebar */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <div className="bg-background rounded-xl border p-6 space-y-4">
                <h3 className="font-semibold text-lg">Deck Details</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Controller
                      name="title"
                      control={manualForm.control}
                      render={({ field }) => (
                        <Input {...field} placeholder="Enter deck title" />
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Controller
                      name="description"
                      control={manualForm.control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder="Enter deck description"
                          className="resize-none"
                        />
                      )}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted/50 rounded-md border border-dashed">
                    <BookOpen className="w-4 h-4" />
                    <span className="truncate">
                      Source: {manualDocument?.title || "Untitled"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-background rounded-xl border flex flex-col h-[500px]">
                <div className="p-4 border-b flex items-center justify-between bg-muted/20">
                  <h3 className="font-semibold">Cards</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        id: Date.now().toString(),
                        front: "",
                        back: "",
                        hint: "",
                      })
                    }
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add
                  </Button>
                </div>
                <div className="flex-1 overflow-auto p-2 custom-scrollbar space-y-2">
                  {fields.map((field, index) => (
                    <button
                      key={field.id}
                      onClick={() => setCurrentCardIndex(index)}
                      className={cn(
                        "w-full p-3 rounded-md text-left text-sm border transition-colors",
                        currentCardIndex === index
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background hover:bg-muted/50",
                      )}
                    >
                      <div className="flex items-center justify-between font-medium">
                        <span>Card {index + 1}</span>
                        {field.front && field.back && (
                          <Check
                            className={cn(
                              "w-3 h-3",
                              currentCardIndex === index
                                ? "text-primary-foreground"
                                : "text-green-500",
                            )}
                          />
                        )}
                      </div>
                      <div className="truncate opacity-80 mt-1 text-xs">
                        {field.front || "Empty card"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Editor */}
            <div className="col-span-12 lg:col-span-8">
              {previewMode ? (
                <div className="h-full flex flex-col items-center justify-center p-8 bg-muted/20 rounded-xl border border-dashed">
                  <div className="w-full max-w-2xl">
                    <FlashcardPreview
                      front={fields[currentCardIndex].front}
                      back={fields[currentCardIndex].back}
                      hint={fields[currentCardIndex].hint}
                      showControls={true}
                    />
                    <div className="flex justify-center gap-4 mt-8">
                      <Button
                        variant="outline"
                        disabled={currentCardIndex === 0}
                        onClick={() => setCurrentCardIndex((prev) => prev - 1)}
                      >
                        <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                      </Button>
                      <Button
                        variant="outline"
                        disabled={currentCardIndex === fields.length - 1}
                        onClick={() => setCurrentCardIndex((prev) => prev + 1)}
                      >
                        Next <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-background rounded-xl p-1 h-full">
                  <FlashcardEditor
                    card={fields[currentCardIndex]}
                    cardIndex={currentCardIndex}
                    totalCards={fields.length}
                    onUpdate={updateFlashcard}
                    onDuplicate={(card) => {
                      const newCard = {
                        ...card,
                        id: Date.now().toString(),
                        front: `${card.front} (Copy)`,
                      };
                      append(newCard);
                    }}
                    onDelete={(id) => {
                      if (fields.length > 1) {
                        const idx = fields.findIndex((f) => f.id === id);
                        remove(idx);
                        setCurrentCardIndex(Math.max(0, idx - 1));
                      }
                    }}
                    canDelete={fields.length > 1}
                    isSaved={savedCards.has(fields[currentCardIndex]?.id)}
                  />
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <FeatureErrorDialog
        error={generateError as any}
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        onRetry={() => lastAutoData && onAutoSubmit(lastAutoData)}
        title={
          (generateError as any)?.name === "QuotaExceededError"
            ? "Flashcard Limit Reached"
            : (generateError as any)?.name === "RateLimitingError"
              ? "Please Wait"
              : "Flashcard Generation Failed"
        }
      />
    </div>
  );
}

export default function CreateFlashCardsPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <CreateFlashCardsPageContent />
    </Suspense>
  );
}
