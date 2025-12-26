"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import { toast } from "react-toastify";
import { FlashcardPreview, FlashcardEditor } from "@/components/flashcards";
import { DocumentSelectionTabs } from "@/components/quiz/DocumentSelectionTabs";
import { useGetAllFilesQuery } from "@/lib/store/apiSlice";

// Flashcard interface
interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  hint?: string;
}

// Deck metadata interface
interface DeckMetadata {
  title: string;
  description: string;
  category: string;
  language: "en" | "fr" | "ar";
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
}

// Categories and difficulties
const categories = [
  "Mathematics",
  "Programming",
  "History",
  "Chemistry",
  "Computer Science",
  "Language",
  "Medicine",
  "Physics",
  "Biology",
  "Literature",
];

const difficulties = ["Easy", "Medium", "Hard"] as const;

export default function CreateFlashCardsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromQuizId = searchParams?.get("fromQuizId");

  // State for Tabs
  const [activeTab, setActiveTab] = useState<"automatic" | "manual">(
    "automatic"
  );

  // State for Manual Mode
  const [deckMetadata, setDeckMetadata] = useState<DeckMetadata>({
    title: "",
    description: "",
    category: "Programming",
    language: "en",
    difficulty: "Medium",
    tags: [],
  });

  const [flashcards, setFlashcards] = useState<FlashcardItem[]>([
    { id: "1", front: "", back: "", hint: "" },
  ]);

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [savedCards, setSavedCards] = useState<Set<string>>(new Set());
  const [prefillFromQuiz, setPrefillFromQuiz] = useState<string | null>(null);

  // State for Automatic Mode
  const [autoDocument, setAutoDocument] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [autoCardCount, setAutoCardCount] = useState<number>(10);
  const [autoDifficulty, setAutoDifficulty] =
    useState<(typeof difficulties)[number]>("Medium");
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch PDFs for AI generation
  const { data: filesData, isLoading: isLoadingPDFs } = useGetAllFilesQuery();

  // If opened from a quiz, prefill title and show banner
  useEffect(() => {
    if (fromQuizId) {
      setPrefillFromQuiz(fromQuizId);
      setActiveTab("manual"); // Assuming manual adjustment if coming from quiz, but can be auto too
      setDeckMetadata((prev) => ({
        ...prev,
        title: prev.title || `Flashcards from Quiz ${fromQuizId}`,
      }));
    }
  }, [fromQuizId]);

  // Derived state for DocumentSelectionTabs
  const selectedDocuments = useMemo(
    () => (autoDocument ? [{ id: autoDocument.id }] : []),
    [autoDocument]
  );

  const handleAddDocument = (doc: { id: string; title: string }) => {
    setAutoDocument({ id: doc.id, title: doc.title });
  };

  // --- Manual Mode Handlers ---

  const addFlashcard = () => {
    const newCard: FlashcardItem = {
      id: Date.now().toString(),
      front: "",
      back: "",
      hint: "",
    };
    setFlashcards([...flashcards, newCard]);
    setCurrentCardIndex(flashcards.length);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
    toast.success("New card added!");
  };

  const removeFlashcard = (id: string) => {
    if (flashcards.length === 1) {
      toast.error("You need at least one card!");
      return;
    }

    setFlashcards(flashcards.filter((card) => card.id !== id));
    if (currentCardIndex >= flashcards.length - 1) {
      setCurrentCardIndex(Math.max(0, flashcards.length - 2));
    }
    toast.success("Card removed!");
  };

  const updateFlashcard = (
    id: string,
    field: keyof FlashcardItem,
    value: string
  ) => {
    setFlashcards(
      flashcards.map((card) =>
        card.id === id ? { ...card, [field]: value } : card
      )
    );

    // Mark as saved temporarily
    setSavedCards((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setSavedCards((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }, 1000);
  };

  const addTag = (tag: string) => {
    if (tag && !deckMetadata.tags.includes(tag)) {
      setDeckMetadata({
        ...deckMetadata,
        tags: [...deckMetadata.tags, tag],
      });
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setDeckMetadata({
      ...deckMetadata,
      tags: deckMetadata.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput.trim());
    }
  };

  const duplicateCard = (card: FlashcardItem) => {
    const newCard: FlashcardItem = {
      ...card,
      id: Date.now().toString(),
      front: `${card.front} (Copy)`,
    };
    const newIndex = currentCardIndex + 1;
    const newFlashcards = [...flashcards];
    newFlashcards.splice(newIndex, 0, newCard);
    setFlashcards(newFlashcards);
    setCurrentCardIndex(newIndex);
    toast.success("Card duplicated!");
  };

  const shuffleCards = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentCardIndex(0);
    toast.success("Cards shuffled!");
  };

  const saveDeck = async () => {
    if (!deckMetadata.title.trim()) {
      toast.error("Please enter a deck title!");
      return;
    }

    if (!autoDocument) {
      toast.error("Please select a linked document!");
      return;
    }

    const validCards = flashcards.filter(
      (card) => card.front.trim() && card.back.trim()
    );
    if (validCards.length === 0) {
      toast.error("Please create at least one complete card!");
      return;
    }

    // Construct payload for API
    const payload = {
      name: deckMetadata.title,
      description: deckMetadata.description,
      language: deckMetadata.language,
      documentId: autoDocument.id,
      flashCards: validCards.map((c) => ({
        front: c.front,
        back: c.back,
        hint: c.hint,
      })),
    };

    try {
      const loadingId = toast.loading("Saving deck...");
      const res = await fetch("/api/v1/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save flashcard set");

      toast.update(loadingId, {
        render: `Deck "${deckMetadata.title}" saved successfully!`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      router.push("/dashboard/knowledge-test");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save deck");
    }
  };

  const currentCard = flashcards[currentCardIndex];
  const completedCards = flashcards.filter(
    (card) => card.front.trim() && card.back.trim()
  ).length;
  const progressPercentage = (completedCards / flashcards.length) * 100;

  // --- Automatic Mode Handlers ---

  const handleGenerate = async () => {
    if (!autoDocument) {
      toast.error("Please select a document first.");
      return;
    }
    if (autoCardCount < 1) {
      toast.error("Please enter a valid number of cards.");
      return;
    }

    setIsGenerating(true);
    const loadingId = toast.loading("Generating flashcards...");
    try {
      const resp = await fetch("/api/v1/flashcards/generate-from-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: autoDocument.id,
          settings: {
            numberOfCards: autoCardCount,
            difficulty: autoDifficulty,
            includeHints: true,
          },
        }),
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "Failed to generate flashcards");
      }

      const data = await resp.json();
      if (data.success && data.flashcards) {
        toast.update(loadingId, {
          render: `Generated ${data.flashcards.length} flashcards!`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        // Switch to manual mode with generated cards to allow editing
        setFlashcards(
          data.flashcards.map((c: any) => ({
            id: c.id || Math.random().toString(),
            front: c.front,
            back: c.back,
            hint: c.hint,
          }))
        );
        setDeckMetadata((prev) => ({
          ...prev,
          title: `Flashcards: ${autoDocument.title}`,
          difficulty: autoDifficulty,
        }));
        setActiveTab("manual");
        setCurrentCardIndex(0);
      } else {
        toast.update(loadingId, {
          render: "No flashcards were returned.",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (err: any) {
      console.error("Generation error:", err);
      toast.update(loadingId, {
        render: err.message || "Something went wrong during generation.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setIsGenerating(false);
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
                onClick={saveDeck}
                className="bg-linear-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 hover:scale-105 transition-all duration-200 text-white shadow-lg"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Deck
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Important: Document Selection on the Left */}
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
                    selectedDocuments={selectedDocuments}
                    onAddDocument={(d: any) =>
                      handleAddDocument({ id: d.id, title: d.title })
                    }
                    isLoadingPDFs={isLoadingPDFs}
                  />
                  {!autoDocument && (
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
                      <Input
                        type="number"
                        min={1}
                        max={50}
                        value={autoCardCount}
                        onChange={(e) =>
                          setAutoCardCount(parseInt(e.target.value) || 0)
                        }
                        className="mt-2 bg-muted/20"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Recommended: 10-20 cards per session
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold">
                        Difficulty Level
                      </Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {difficulties.map((d) => (
                          <button
                            key={d}
                            onClick={() => setAutoDifficulty(d)}
                            className={`text-center py-2 px-3 rounded-lg text-sm font-medium transition-all border ${
                              autoDifficulty === d
                                ? "bg-pink-50 border-pink-500 text-pink-700 dark:bg-pink-900/20 dark:text-pink-300"
                                : "bg-background border-border hover:bg-muted"
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
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
                        {autoCardCount} {autoDifficulty.toLowerCase()}{" "}
                        flashcards for you.
                      </p>
                    </div>
                    <Button
                      size="lg"
                      onClick={handleGenerate}
                      disabled={isGenerating || !autoDocument}
                      className="w-full bg-linear-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {isGenerating ? (
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
          </TabsContent>

          <TabsContent
            value="manual"
            className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-2 duration-300"
          >
            {/* Progress Bar */}
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">
                    Progress: {completedCards} of {flashcards.length} cards
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
              {/* Deck Metadata (Same as before but wrapped in consistent card style) */}
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
                      <Input
                        id="title"
                        placeholder="Enter deck title..."
                        value={deckMetadata.title}
                        onChange={(e) =>
                          setDeckMetadata({
                            ...deckMetadata,
                            title: e.target.value,
                          })
                        }
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">
                        Description (Optional)
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Describe what this deck covers..."
                        value={deckMetadata.description}
                        onChange={(e) =>
                          setDeckMetadata({
                            ...deckMetadata,
                            description: e.target.value,
                          })
                        }
                        className="mt-1 resize-none"
                        rows={3}
                      />
                    </div>

                    {/* Document Selection for Manual Mode */}
                    <div className="space-y-2">
                      <Label>Linked Document *</Label>
                      {!autoDocument ? (
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
                            selectedDocuments={selectedDocuments}
                            onAddDocument={(d: any) =>
                              handleAddDocument({ id: d.id, title: d.title })
                            }
                            isLoadingPDFs={isLoadingPDFs}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-primary" />
                            <span className="font-medium text-sm">
                              {autoDocument.title}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setAutoDocument(null)}
                            className="h-8 text-destructive hover:text-destructive"
                          >
                            Change
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="language">Language</Label>
                        <select
                          id="language"
                          value={deckMetadata.language || "en"}
                          onChange={(e) =>
                            setDeckMetadata({
                              ...deckMetadata,
                              language: e.target.value as "en" | "fr" | "ar",
                            })
                          }
                          className="w-full mt-1 px-3 py-2 border border-border/50 rounded-md bg-background text-foreground text-sm"
                        >
                          <option value="en">English</option>
                          <option value="fr">French</option>
                          <option value="ar">Arabic</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="difficulty">Difficulty</Label>
                        <select
                          id="difficulty"
                          value={deckMetadata.difficulty}
                          onChange={(e) =>
                            setDeckMetadata({
                              ...deckMetadata,
                              difficulty: e.target.value as any,
                            })
                          }
                          className="w-full mt-1 px-3 py-2 border border-border/50 rounded-md bg-background text-foreground text-sm"
                        >
                          {difficulties.map((difficulty) => (
                            <option key={difficulty} value={difficulty}>
                              {difficulty}
                            </option>
                          ))}
                        </select>
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
                      {deckMetadata.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {deckMetadata.tags.map((tag) => (
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
                        Card {currentCardIndex + 1} of {flashcards.length}
                      </span>
                      <div className="flex gap-1">
                        <Button
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
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentCardIndex(
                              Math.min(
                                flashcards.length - 1,
                                currentCardIndex + 1
                              )
                            )
                          }
                          disabled={currentCardIndex === flashcards.length - 1}
                        >
                          →
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addFlashcard}
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={shuffleCards}
                      >
                        <Shuffle className="w-4 h-4 mr-1" /> Mix
                      </Button>
                    </div>

                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {flashcards.map((card, index) => (
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
                      totalCards={flashcards.length}
                      onUpdate={updateFlashcard}
                      onDuplicate={duplicateCard}
                      onDelete={removeFlashcard}
                      canDelete={flashcards.length > 1}
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
