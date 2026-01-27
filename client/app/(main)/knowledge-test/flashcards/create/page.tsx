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
    "automatic"
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
  const [generateSet, { isLoading: isGenerating }] =
    useGenerateFlashCardsSetMutation();

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
    [manualDocumentId, documentsData]
  );
  const autoDocument = useMemo(
    () => getSelectedDocument(autoDocumentId),
    [autoDocumentId, documentsData]
  );

  // Handlers
  const onAutoSubmit = async (data: FlashcardAutoFormData) => {
    try {
      const response = await generateSet(
        prepareFlashcardPayload("auto", data) as any
      ).unwrap();

      const generatedCards =
        (response as any).flashCards?.map((c: any) => ({
          id: c.id || Math.random().toString(),
          front: c.front,
          back: c.back,
          hint: c.hint || "",
        })) || [];

      if (generatedCards.length > 0) {
        manualForm.setValue("flashcards", generatedCards);
        manualForm.setValue(
          "title",
          `AI Deck: ${autoDocument?.title || "Generated"}`
        );
        manualForm.setValue("documentId", data.documentId);
        manualForm.setValue("difficulty", data.difficulty);
        setActiveTab("manual");
        toast.success(`Generated ${generatedCards.length} cards!`);
      }
    } catch (err: any) {
      toast.error(err.data?.message || "Generation failed");
    }
  };

  const onManualSubmit = async (data: FlashcardManualFormData) => {
    try {
      await createManualSet(
        prepareFlashcardPayload("manual", data) as any
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
    value: string
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
        1500
      );
    }
  };

  const progress =
    (fields.filter((f) => f.front && f.back).length / fields.length) * 100;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-32">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="flex items-center justify-between">
          <Link href="/knowledge-test">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full hover:bg-muted group border border-border/40"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              {activeTab === "automatic" ? "Back" : "Exit to Dashboard"}
            </Button>
          </Link>

          {activeTab === "manual" && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("automatic")}
                className="rounded-full border-border/40 font-bold text-xs uppercase tracking-widest px-4"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                Back to Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
                className="rounded-full border-border/40 font-bold text-xs uppercase tracking-widest px-4"
              >
                {previewMode ? (
                  <PenTool className="w-3.5 h-3.5 mr-1" />
                ) : (
                  <Eye className="w-3.5 h-3.5 mr-1" />
                )}
                {previewMode ? "Edit" : "Preview"}
              </Button>
              <Button
                onClick={manualForm.handleSubmit(onManualSubmit)}
                disabled={isSaving}
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-black text-xs uppercase tracking-widest px-6"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Save Deck"
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-5 rounded-[40px] bg-primary/10 w-fit mx-auto border border-primary/20 shadow-lg shadow-primary/5">
            <RobotIcon className="w-12 h-12 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">
              {activeTab === "automatic" ? "New Flashcards" : "Refinement"}
            </h1>
            <p className="text-muted-foreground text-sm font-medium">
              {activeTab === "automatic"
                ? "Forge a new deck from your knowledge sources."
                : "Polish and perfect your AI-generated cards."}
            </p>
          </div>
        </div>

        <Tabs value={activeTab} className="space-y-12">
          {/* Hide TabsList as requested - AI focused flow */}

          <TabsContent value="automatic" className="outline-none">
            <div className="max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
              >
                <form
                  onSubmit={autoForm.handleSubmit(onAutoSubmit)}
                  className="space-y-12"
                >
                  {/* Step 1: Source */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      <BookOpen className="w-4 h-4" />
                      Step 1: Source Material
                    </div>
                    <div className="p-2 rounded-[40px] bg-muted/10 border border-border/40 overflow-hidden shadow-2xl shadow-background/50">
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
                  </div>

                  {/* Step 2: Config */}
                  <div className="space-y-10 bg-muted/5 p-10 rounded-[40px] border border-border/40 shadow-2xl shadow-background/50">
                    <div className="space-y-1">
                      <h3 className="font-black italic uppercase tracking-tighter text-2xl leading-none">
                        Parameters
                      </h3>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                        Step 2: Configuration
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4 text-left">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                          Quantity
                        </Label>
                        <Controller
                          name="numberOfCards"
                          control={autoForm.control}
                          render={({ field }) => (
                            <div className="flex items-center gap-4 bg-muted/20 p-2 rounded-2xl focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                              <Input
                                type="number"
                                {...field}
                                min={1}
                                max={50}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value) || 1)
                                }
                                className="h-10 bg-transparent border-none shadow-none text-2xl font-black w-20 text-center ring-0 focus-visible:ring-0"
                              />
                              <span className="text-xs font-black text-muted-foreground uppercase italic pr-4">
                                Cards
                              </span>
                            </div>
                          )}
                        />
                      </div>

                      <div className="space-y-4 text-left">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                          Complexity
                        </Label>
                        <Controller
                          name="difficulty"
                          control={autoForm.control}
                          render={({ field }) => (
                            <div className="flex gap-1 bg-muted/20 p-1.5 rounded-2xl h-14">
                              {difficulties.map((d) => (
                                <button
                                  key={d}
                                  type="button"
                                  onClick={() => field.onChange(d)}
                                  className={cn(
                                    "flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    field.value === d
                                      ? "bg-background shadow-md text-foreground scale-105"
                                      : "text-muted-foreground hover:text-foreground"
                                  )}
                                >
                                  {d}
                                </button>
                              ))}
                            </div>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isGenerating || !autoDocumentId}
                    className="w-full h-20 bg-foreground text-background hover:bg-foreground/90 rounded-[40px] font-black text-2xl tracking-tighter shadow-2xl transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden"
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-4">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>FORGING DECK...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-4">
                        GENERATE DECK
                        <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform animate-pulse" />
                      </div>
                    )}
                  </Button>
                </form>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="outline-none space-y-12">
            {/* Progress Bar moved into a cleaner card */}
            <div className="bg-muted/10 border border-border/40 rounded-[40px] p-8 flex flex-col gap-6 shadow-xl">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <h3 className="text-xl font-black italic uppercase tracking-tighter">
                    Review & Refine
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium">
                    Customize your generated cards before saving
                  </p>
                </div>
                <div className="text-3xl font-black italic tracking-tighter text-primary">
                  {Math.round(progress)}%
                </div>
              </div>
              <div className="h-3 bg-muted/20 rounded-full overflow-hidden border border-border/20 p-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-10">
              {/* Sidebar Config */}
              <div className="col-span-12 lg:col-span-4 space-y-8">
                <div className="bg-muted/10 border border-border/40 rounded-[40px] p-8 space-y-8 shadow-xl">
                  <div className="space-y-1">
                    <h3 className="font-black italic uppercase tracking-tighter text-xl leading-none">
                      Deck Specs
                    </h3>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                      Local Configuration
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Title
                      </Label>
                      <Controller
                        name="title"
                        control={manualForm.control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            className="bg-background/50 border-border/20 h-12 rounded-2xl font-bold focus-visible:ring-primary/20"
                          />
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Description
                      </Label>
                      <Controller
                        name="description"
                        control={manualForm.control}
                        render={({ field }) => (
                          <Textarea
                            {...field}
                            className="bg-background/50 border-border/20 rounded-2xl resize-none min-h-[100px] text-sm"
                          />
                        )}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-background/50 rounded-2xl border border-border/20">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          Document
                        </span>
                        <span className="text-xs font-bold truncate max-w-[150px]">
                          {manualDocument?.title || "Untitled"}
                        </span>
                      </div>
                      <BookOpen className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                </div>

                {/* Navigator */}
                <div className="bg-muted/10 border border-border/40 rounded-[40px] p-8 space-y-6 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-black italic uppercase tracking-tighter text-xl leading-none">
                        Navigator
                      </h3>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                        {fields.length} cards generated
                      </p>
                    </div>
                    <Button
                      onClick={() =>
                        append({
                          id: Date.now().toString(),
                          front: "",
                          back: "",
                          hint: "",
                        })
                      }
                      variant="outline"
                      className="rounded-full border-border/40 hover:bg-background h-8 px-4 text-[10px] font-black uppercase tracking-widest"
                    >
                      <Plus className="w-3 h-3 mr-1" /> Add
                    </Button>
                  </div>

                  <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {fields.map((field, index) => (
                      <button
                        key={field.id}
                        onClick={() => setCurrentCardIndex(index)}
                        className={cn(
                          "w-full p-4 rounded-2xl text-left border transition-all duration-300 group shadow-sm",
                          currentCardIndex === index
                            ? "bg-foreground text-background border-foreground shadow-xl scale-[1.02]"
                            : "bg-background/40 border-border/20 text-muted-foreground hover:border-primary/40"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            Card {index + 1}
                          </span>
                          {currentCardIndex === index ? (
                            <ChevronRight className="w-3.5 h-3.5 animate-pulse" />
                          ) : field.front && field.back ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-muted" />
                          )}
                        </div>
                        {field.front && (
                          <p className="text-[10px] mt-1 font-bold truncate opacity-70">
                            {field.front}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Editor/Preview Area */}
              <div className="col-span-12 lg:col-span-8">
                <AnimatePresence mode="wait">
                  {!previewMode ? (
                    <motion.div
                      key="editor"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
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
                          const nextIdx = currentCardIndex + 1;
                          const currentCards =
                            manualForm.getValues("flashcards");
                          const newCards = [...currentCards];
                          newCards.splice(nextIdx, 0, newCard);
                          manualForm.setValue("flashcards", newCards);
                          setCurrentCardIndex(nextIdx);
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
                    </motion.div>
                  ) : (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      className="bg-muted/10 border border-border/40 rounded-[60px] p-24 flex items-center justify-center min-h-[600px] backdrop-blur-xl relative"
                    >
                      <div className="absolute inset-0 bg-linear-to-tr from-primary/5 to-transparent rounded-[60px]" />
                      <FlashcardPreview
                        front={fields[currentCardIndex].front}
                        back={fields[currentCardIndex].back}
                        hint={fields[currentCardIndex].hint}
                        showControls={true}
                      />

                      <div className="absolute bottom-12 flex gap-4">
                        <Button
                          variant="ghost"
                          disabled={currentCardIndex === 0}
                          onClick={() =>
                            setCurrentCardIndex((prev) => prev - 1)
                          }
                          className="rounded-full w-12 h-12 p-0 border border-white/5 bg-white/5"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          disabled={currentCardIndex === fields.length - 1}
                          onClick={() =>
                            setCurrentCardIndex((prev) => prev + 1)
                          }
                          className="rounded-full w-12 h-12 p-0 border border-white/5 bg-white/5"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function CreateFlashCardsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-12 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <CreateFlashCardsPageContent />
    </Suspense>
  );
}
