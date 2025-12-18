"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { FlashcardPreview, FlashcardEditor, AIFlashcardGenerator } from "@/components/flashcards";
import { useGetPDFsQuery } from "@/lib/store/apiSlice";
import { PremiumBadge } from "@/components/ui/premium-badge";

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

const difficulties = ["Easy", "Medium", "Hard"];

// Predefined tags for suggestions
const suggestedTags = [
  "vocabulary",
  "formulas",
  "concepts",
  "definitions",
  "examples",
  "practice",
  "theory",
  "applications",
  "fundamentals",
  "advanced",
  "beginner",
  "intermediate",
  "expert",
  "review",
  "exam-prep",
];

export default function CreateFlashcardsPage() {
  const [deckMetadata, setDeckMetadata] = useState<DeckMetadata>({
    title: "",
    description: "",
    category: "Programming",
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
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const searchParams = useSearchParams();
  const fromQuizId = searchParams?.get("fromQuizId");
  const [prefillFromQuiz, setPrefillFromQuiz] = useState<string | null>(null);


  // Fetch PDFs for AI generation
  const {
    data: pdfData,
    isLoading: isLoadingPDFs,
    error: pdfError,
    refetch: refetchPDFs,
  } = useGetPDFsQuery();

  // If opened from a quiz, prefill title and show banner
  useEffect(() => {
    if (fromQuizId) {
      setPrefillFromQuiz(fromQuizId);
      setDeckMetadata((prev) => ({
        ...prev,
        title: prev.title || `Flashcards from Quiz ${fromQuizId}`,
      }));
    }
  }, [fromQuizId]);



  // Add new flashcard
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

  // Remove flashcard
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

  // Update flashcard
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

  // Add tag
  const addTag = (tag: string) => {
    if (tag && !deckMetadata.tags.includes(tag)) {
      setDeckMetadata({
        ...deckMetadata,
        tags: [...deckMetadata.tags, tag],
      });
      setTagInput("");
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setDeckMetadata({
      ...deckMetadata,
      tags: deckMetadata.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  // Handle tag input
  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput.trim());
    }
  };

  // Duplicate card
  const duplicateCard = (card: FlashcardItem) => {
    const newCard: FlashcardItem = {
      ...card,
      id: Date.now().toString(),
    };
    const newIndex = currentCardIndex + 1;
    const newFlashcards = [...flashcards];
    newFlashcards.splice(newIndex, 0, newCard);
    setFlashcards(newFlashcards);
    setCurrentCardIndex(newIndex);
    toast.success("Card duplicated!");
  };

  // Shuffle cards
  const shuffleCards = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentCardIndex(0);
    toast.success("Cards shuffled!");
  };

  // Handle AI generated cards
  const handleAICardsGenerated = (generatedCards: FlashcardItem[]) => {
    // Replace existing cards with generated ones
    setFlashcards(generatedCards);
    setCurrentCardIndex(0);
    setShowAIGenerator(false);
    toast.success(`Generated ${generatedCards.length} flashcards! You can now edit them.`);
  };

  // Save deck
  const saveDeck = () => {
    if (!deckMetadata.title.trim()) {
      toast.error("Please enter a deck title!");
      return;
    }

    const validCards = flashcards.filter(
      (card) => card.front.trim() && card.back.trim()
    );
    if (validCards.length === 0) {
      toast.error("Please create at least one complete card!");
      return;
    }

    // Simulate saving
    toast.success(
      `Deck "${deckMetadata.title}" saved with ${validCards.length} cards!`
    );
  };

  const currentCard = flashcards[currentCardIndex];
  const completedCards = flashcards.filter(
    (card) => card.front.trim() && card.back.trim()
  ).length;
  const progressPercentage = (completedCards / flashcards.length) * 100;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/knowledge-test">
              <Button
                variant="outline"
                size="sm"
                className="hover:scale-105 transition-transform duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Flashcards
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <div className="p-2 bg-linear-to-r from-pink-500 to-rose-500 rounded-xl">
                  <Wand2 className="w-6 h-6 text-white" />
                </div>
                Create Flashcard Deck
              </h1>
              <p className="text-muted-foreground mt-1">
                Build your custom flashcard deck for effective learning
              </p>
            </div>
          </div>
            {prefillFromQuiz && (
              <div className="ml-4 text-sm text-muted-foreground">
                Creating flashcards for quiz <strong>{prefillFromQuiz}</strong>
              </div>
            )}

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
              className="bg-linear-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 hover:scale-105 transition-all duration-200"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Deck
            </Button>
          </div>
        </div>

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

        {/* AI Generator */}
        {showAIGenerator && (
          <AIFlashcardGenerator
            availableDocuments={pdfData?.pdfs || []}
            onCardsGenerated={handleAICardsGenerated}
            isLoadingPDFs={isLoadingPDFs}
            pdfError={pdfError}
            refetchPDFs={refetchPDFs}
          />
        )}

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
                    className="mt-1 border-border/50 focus:border-primary/50"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
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
                    className="mt-1 border-border/50 focus:border-primary/50 resize-none"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      value={deckMetadata.category}
                      onChange={(e) =>
                        setDeckMetadata({
                          ...deckMetadata,
                          category: e.target.value,
                        })
                      }
                      className="w-full mt-1 px-3 py-2 border border-border/50 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
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
                          difficulty: e.target.value as
                            | "Easy"
                            | "Medium"
                            | "Hard",
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

                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    placeholder="Add tags (press Enter)..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInput}
                    className="mt-1 border-border/50 focus:border-primary/50"
                  />

                  {/* Suggested Tags */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {suggestedTags.slice(0, 6).map((tag) => (
                      <Button
                        key={tag}
                        variant="outline"
                        size="sm"
                        onClick={() => addTag(tag)}
                        className="text-xs h-6 px-2 hover:scale-105 transition-transform duration-200"
                        disabled={deckMetadata.tags.includes(tag)}
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>

                  {/* Selected Tags */}
                  {deckMetadata.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {deckMetadata.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors duration-200"
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
                        setCurrentCardIndex(Math.max(0, currentCardIndex - 1))
                      }
                      disabled={currentCardIndex === 0}
                      className="hover:scale-105 transition-transform duration-200"
                    >
                      ←
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentCardIndex(
                          Math.min(flashcards.length - 1, currentCardIndex + 1)
                        )
                      }
                      disabled={currentCardIndex === flashcards.length - 1}
                      className="hover:scale-105 transition-transform duration-200"
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
                    className="hover:scale-105 transition-transform duration-200"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Card
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={shuffleCards}
                    className="hover:scale-105 transition-transform duration-200"
                  >
                    <Shuffle className="w-4 h-4 mr-1" />
                    Shuffle
                  </Button>
                </div>

                {/* Card List */}
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
                        <div className="flex items-center gap-1">
                          {card.front.trim() && card.back.trim() && (
                            <Check className="w-3 h-3 text-green-500" />
                          )}
                          {savedCards.has(card.id) && (
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {card.front || "Empty card"}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Card Editor/Preview */}
          <div className="lg:col-span-2">
            {!previewMode ? (
              /* Edit Mode */
              <div
                className={`transition-all duration-300 ${
                  isAnimating ? "scale-105" : ""
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
              /* Preview Mode */
              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Card {currentCardIndex + 1} - Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
      </div>
    </div>
  );
}
