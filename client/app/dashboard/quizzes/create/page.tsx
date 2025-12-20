"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import {
  ArrowLeft,
  BookOpen,
  Check,
  Circle,
  Plus,
  Save,
  Zap,
} from "lucide-react";

import { DocumentSelectionTabs } from "@/components/quiz/DocumentSelectionTabs";
import { useGetAllFilesQuery } from "@/lib/store/apiSlice";

// Local enum-like constants mirroring server enums
const difficulties = ["easy", "medium", "hard"] as const;
const languages = ["en", "fr", "ar"] as const;
const explanationLevels = ["none", "brief", "detailed"] as const;

const questionTypes = [
  { key: "mcq", label: "MCQ" },
  { key: "true_false", label: "True / False" },
];

export default function CreateQuizPage() {
  const router = useRouter();

  const {
    data: pdfData,
    isLoading: isLoadingPDFs,
    error: pdfError,
    refetch: refetchPDFs,
  } = useGetAllFilesQuery();

  // Form state
  const [document, setDocument] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [userPrompt, setUserPrompt] = useState("");
  const [difficulty, setDifficulty] =
    useState<(typeof difficulties)[number]>("medium");
  const [numberOfQuestions, setNumberOfQuestions] = useState<
    number | undefined
  >(10);
  const [language, setLanguage] = useState<
    (typeof languages)[number] | undefined
  >("en");
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | undefined>(
    10
  );
  const [explanationLevel, setExplanationLevel] =
    useState<(typeof explanationLevels)[number]>("none");

  const [questionsDistribution, setQuestionsDistribution] = useState<
    Record<string, number | "">
  >({
    mcq: "",
    true_false: "",
  });

  // Flashcards options
  const [generateFlashcards, setGenerateFlashcards] = useState<boolean>(false);
  const [flashcardsMode, setFlashcardsMode] = useState<"document" | "manual">(
    "document"
  );
  const [flashcardsUseSameDocument, setFlashcardsUseSameDocument] =
    useState<boolean>(true);
  const [flashcardsDocumentId, setFlashcardsDocumentId] = useState<
    string | null
  >(null);
  const [flashcardsNumber, setFlashcardsNumber] = useState<number>(10);
  const [flashcardsIncludeHints, setFlashcardsIncludeHints] =
    useState<boolean>(true);
  const [openManualAfterCreation, setOpenManualAfterCreation] =
    useState<boolean>(true);

  const selectedDocuments = useMemo(
    () =>
      document
        ? [
            {
              id: document.id,
              title: document.title,
              pageCount: 1,
              selectedPages: [],
            },
          ]
        : [],
    [document]
  );

  const handleAddDocument = (doc: { id: string; title: string }) => {
    setDocument({ id: doc.id, title: doc.title });
    toast.success(`Selected "${doc.title}"`);
  };

  const handleRemoveDocument = (docId: string) => {
    setDocument(null);
  };

  const handleCreateQuiz = async () => {
    // Basic validation
    if (!document) {
      toast.error("Please select a source document for the quiz.");
      return;
    }
    if (!difficulty) {
      toast.error("Please choose a difficulty level.");
      return;
    }
    if (
      numberOfQuestions &&
      (numberOfQuestions < 1 || numberOfQuestions > 44)
    ) {
      toast.error("Number of questions must be between 1 and 44.");
      return;
    }

    if (generateFlashcards) {
      if (flashcardsMode === "document") {
        const target = flashcardsUseSameDocument
          ? document?.id
          : flashcardsDocumentId;
        if (!target) {
          toast.error("Please select a document to generate flashcards from.");
          return;
        }
        if (!flashcardsNumber || flashcardsNumber < 1) {
          toast.error("Please enter a valid number of flashcards.");
          return;
        }
      }
      // manual mode requires no pre-submit validation
    }

    const body: any = {
      documentId: document.id,
      difficultyLevel: difficulty,
    };

    if (userPrompt.trim()) body.userPrompt = userPrompt.trim();
    if (numberOfQuestions) body.numberOfQuestions = numberOfQuestions;
    if (language) body.language = language;
    if (timeLimitMinutes) body.timeLimitMinutes = timeLimitMinutes;
    if (explanationLevel) body.explanationLevel = explanationLevel;

    // questionsDistribution: only include numbers
    const dist: Record<string, number> = {};
    Object.entries(questionsDistribution).forEach(([k, v]) => {
      const n = typeof v === "string" ? (v === "" ? null : Number(v)) : v;
      if (typeof n === "number" && !Number.isNaN(n) && n > 0) {
        dist[k] = n;
      }
    });
    if (Object.keys(dist).length > 0) body.questionsDistribution = dist;

    try {
      const resp = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "Failed to create quiz");
      }

      const data = await resp.json();
      toast.success("Quiz created successfully!");
      // Optionally handle flashcards creation based on selected mode
      if (generateFlashcards) {
        if (flashcardsMode === "document") {
          const targetDocId = flashcardsUseSameDocument
            ? document.id
            : flashcardsDocumentId;
          if (!targetDocId) {
            toast.error("No document selected for flashcards generation.");
          } else {
            try {
              const gresp = await fetch(
                "/api/flashcards/generate-from-document",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    documentId: targetDocId,
                    settings: {
                      numberOfCards: flashcardsNumber,
                      includeHints: flashcardsIncludeHints,
                    },
                  }),
                }
              );
              if (!gresp.ok) {
                const text = await gresp.text();
                throw new Error(text || "Failed to generate flashcards");
              }
              const gdata = await gresp.json();
              if (gdata?.success) {
                toast.success(
                  `Generated ${
                    gdata.flashcards?.length || flashcardsNumber
                  } flashcards`
                );
              } else {
                toast.error("Flashcards generation returned an error");
              }
            } catch (err: any) {
              console.error("Flashcards generation failed:", err);
              toast.error(err?.message || "Failed to auto-generate flashcards");
            }
          }
        } else if (flashcardsMode === "manual") {
          // If user asked to open manual editor after creation, redirect there
          if (openManualAfterCreation) {
            if (data?.id) {
              router.push(`/dashboard/flashcards/create?fromQuizId=${data.id}`);
              return; // already redirecting to flashcard editor
            } else {
              router.push(`/dashboard/flashcards/create`);
              return;
            }
          } else {
            toast.success(
              "Quiz created — you can now create flashcards manually from the Knowledge page."
            );
          }
        }
      }

      // Navigate to the created quiz if id present
      if (data?.id) router.push(`/dashboard/quizzes/${data.id}`);
      else router.push("/dashboard/knowledge-test");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to create quiz");
    }
  };

  const totalDistribution = useMemo(() => {
    let total = 0;
    for (const v of Object.values(questionsDistribution)) {
      total += Number(v || 0);
    }
    return total;
  }, [questionsDistribution]);

  return (
    <div className="space-y-6 container mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 ">
      <div className="max-w-4xl mx-auto space-y-8 ">
        {/* Header */}
        <div className="flex items-center justify-between ">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/knowledge-test">
              <Button
                variant="outline"
                size="sm"
                className="hover:scale-105 transition-transform duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Quizzes
              </Button>
            </Link>

            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <div className="p-2 bg-linear-to-r from-pink-500 to-rose-500 rounded-xl">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                Create Quiz
              </h1>
              <p className="text-muted-foreground mt-1">
                Generate a quiz from one of your documents
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleCreateQuiz}
              className="bg-linear-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 hover:scale-105 transition-all duration-200"
            >
              <Save className="w-4 h-4 mr-2" />
              Create Quiz
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 ">
          <Card className="border-border/50 shadow-sm bg-card/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Configuration
              </CardTitle>
              <CardDescription>
                Customize your quiz generation settings and source material.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Source Material
                </h3>
                <DocumentSelectionTabs
                  availableDocuments={
                    (pdfData || []).map((p: any) => ({
                      id: p.id,
                      title: p.filename ?? p.title ?? "Untitled",
                      page_count: p.pageCount ?? p.page_count ?? 1,
                    })) as any
                  }
                  selectedDocuments={selectedDocuments as any}
                  onAddDocument={(d: any) =>
                    handleAddDocument({ id: d.id, title: d.title })
                  }
                  onRemoveDocument={(id: string) => handleRemoveDocument(id)}
                  isLoadingPDFs={isLoadingPDFs}
                  pdfError={pdfError}
                  refetchPDFs={refetchPDFs}
                />
                {document && (
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="secondary" className="cursor-pointer">
                      {document.title}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDocument(null)}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>

              <Separator />

              {/* Flashcards generation */}
              <div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={generateFlashcards}
                    onCheckedChange={(v) => setGenerateFlashcards(Boolean(v))}
                  />
                  <Label className="mb-0">
                    Also generate flashcards for this quiz (AI)
                  </Label>
                </div>

                {generateFlashcards && (
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center gap-3">
                      <RadioGroup
                        value={flashcardsMode}
                        onValueChange={(v) => setFlashcardsMode(v as any)}
                        className="grid grid-cols-2 gap-3"
                      >
                        <label className="flex items-center gap-2">
                          <RadioGroupItem value="document" />
                          <span>Generate from document</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <RadioGroupItem value="manual" />
                          <span>Create manually</span>
                        </label>
                      </RadioGroup>
                    </div>
                    {flashcardsMode === "document" &&
                      flashcardsUseSameDocument &&
                      document && (
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">
                            Using: {document.title}
                          </Badge>
                        </div>
                      )}

                    {flashcardsMode === "manual" && (
                      <div className="mt-3 flex items-center gap-3">
                        <Checkbox
                          checked={openManualAfterCreation}
                          onCheckedChange={(v) =>
                            setOpenManualAfterCreation(Boolean(v))
                          }
                        />
                        <Label className="mb-0">
                          Open flashcard editor after quiz creation
                        </Label>
                      </div>
                    )}
                    {!flashcardsUseSameDocument && (
                      <div>
                        <Label>Select document for flashcards</Label>
                        <select
                          value={flashcardsDocumentId ?? ""}
                          onChange={(e) =>
                            setFlashcardsDocumentId(e.target.value || null)
                          }
                          className="w-full mt-1 px-3 py-2 border border-border/50 rounded-md bg-background text-foreground"
                        >
                          <option value="">Select a document</option>
                          {(pdfData || []).map((p: any) => (
                            <option key={p.id} value={p.id}>
                              {p.filename ?? p.title ?? p.id}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Number of flashcards</Label>
                        <Input
                          type="number"
                          min={1}
                          value={flashcardsNumber}
                          onChange={(e) =>
                            setFlashcardsNumber(Number(e.target.value || 0))
                          }
                          className="mt-1"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={flashcardsIncludeHints}
                          onCheckedChange={(v) =>
                            setFlashcardsIncludeHints(Boolean(v))
                          }
                        />
                        <Label className="mb-0">Include hints</Label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  Quiz Options
                </h3>
                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <Label htmlFor="prompt">User prompt (optional)</Label>
                    <Textarea
                      id="prompt"
                      value={userPrompt}
                      onChange={(e) => setUserPrompt(e.target.value)}
                      rows={3}
                      className="mt-1"
                      placeholder="Optional prompt to guide quiz generation"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label>Difficulty *</Label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as any)}
                        className="w-full mt-1 px-3 py-2 border border-border/50 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                      >
                        {difficulties.map((d) => (
                          <option key={d} value={d}>
                            {d.charAt(0).toUpperCase() + d.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label>Number of questions</Label>
                      <Input
                        type="number"
                        min={1}
                        max={44}
                        value={numberOfQuestions ?? ""}
                        onChange={(e) =>
                          setNumberOfQuestions(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Language</Label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as any)}
                        className="w-full mt-1 px-3 py-2 border border-border/50 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                      >
                        {languages.map((l) => (
                          <option key={l} value={l}>
                            {l.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label>Time limit (minutes)</Label>
                      <Input
                        type="number"
                        min={1}
                        value={timeLimitMinutes ?? ""}
                        onChange={(e) =>
                          setTimeLimitMinutes(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Explanation level</Label>
                      <select
                        value={explanationLevel}
                        onChange={(e) =>
                          setExplanationLevel(e.target.value as any)
                        }
                        className="w-full mt-1 px-3 py-2 border border-border/50 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                      >
                        {explanationLevels.map((el) => (
                          <option key={el} value={el}>
                            {el.charAt(0).toUpperCase() + el.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label>Distribution (optional)</Label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {questionTypes.map((t) => (
                          <div key={t.key} className="flex items-center gap-2">
                            <Label className="w-28 text-sm">{t.label}</Label>
                            <Input
                              type="number"
                              min={0}
                              value={questionsDistribution[t.key] ?? ""}
                              onChange={(e) =>
                                setQuestionsDistribution((prev) => ({
                                  ...prev,
                                  [t.key]:
                                    e.target.value === ""
                                      ? ""
                                      : Number(e.target.value),
                                }))
                              }
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Total distribution: <strong>{totalDistribution}</strong>{" "}
                        {numberOfQuestions
                          ? `(target ${numberOfQuestions})`
                          : ""}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <Button onClick={handleCreateQuiz} className="bg-primary">
                  Create Quiz
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => router.push("/dashboard/knowledge-test")}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
