"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/notify";

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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

import {
  ArrowLeft,
  BookOpen,
  Save,
  Zap,
  Clock,
  HelpCircle,
} from "lucide-react";

import { DocumentSelectionTabs } from "@/components/quiz/DocumentSelectionTabs";
import { useGetAllFilesQuery } from "@/lib/store/apiSlice";

// Local enum-like constants mirroring server enums
const difficulties = ["easy", "medium", "hard"] as const;
const languages = ["en", "fr", "ar"] as const;
const explanationLevels = ["none", "brief", "detailed"] as const;

const questionTypes = [
  { key: "mcq", label: "Multiple Choice" },
  { key: "true_false", label: "True / False" },
];

export default function CreateQuizPage() {
  const router = useRouter();

  const {
    data: pdfData,
    isLoading: isLoadingPDFs,
    refetch: refetchPDFs,
  } = useGetAllFilesQuery();

  // Form state
  const [document, setDocument] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [userPrompt, setUserPrompt] = useState("");
  const [difficulty, setDifficulty] =
    useState<(typeof difficulties)[number]>("Medium");
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
    useState<(typeof explanationLevels)[number]>("None");

  const [questionsDistribution, setQuestionsDistribution] = useState<
    Record<string, number | "">
  >({
    mcq: "",
    true_false: "",
  });

  const selectedDocuments = useMemo(
    () => (document ? [{ id: document.id }] : []),
    [document]
  );

  const handleAddDocument = (doc: { id: string; title: string }) => {
    setDocument({ id: doc.id, title: doc.title });
  };

  const handleCreateQuiz = async () => {
    // Basic validation
    if (!document) {
      notify.error("Please select a source document for the quiz.");
      return;
    }
    if (!difficulty) {
      notify.error("Please choose a difficulty level.");
      return;
    }
    if (
      numberOfQuestions &&
      (numberOfQuestions < 1 || numberOfQuestions > 44)
    ) {
      notify.error("Number of questions must be between 1 and 44.");
      return;
    }

    const body: any = {
      documentId: document.id,
      difficultyLevel: difficulty.toUpperCase(), // Enum is usually uppercase
    };

    if (userPrompt.trim()) body.userPrompt = userPrompt.trim();
    if (numberOfQuestions) body.numberOfQuestions = numberOfQuestions;
    if (language) body.language = language;
    if (timeLimitMinutes) body.timeLimitMinutes = timeLimitMinutes;
    if (explanationLevel)
      body.explanationLevel = explanationLevel.toUpperCase(); // Enum is usually uppercase

    // questionsDistribution: only include numbers
    const dist: Record<string, number> = {};
    Object.entries(questionsDistribution).forEach(([k, v]) => {
      const n = typeof v === "string" ? (v === "" ? null : Number(v)) : v;
      if (typeof n === "number" && !Number.isNaN(n) && n > 0) {
        // Map keys to API expected keys if needed, assuming they match for now (MCQ, TRUE_FALSE)
        const apiType = k === "mcq" ? "MCQ" : "TRUE_FALSE";
        dist[apiType] = n;
      }
    });
    if (Object.keys(dist).length > 0) body.questionsDistribution = dist;

    try {
      notify.loading("Creating your quiz...");
      const resp = await fetch("/api/v1/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "Failed to create quiz");
      }

      const data = await resp.json();
      notify.success("Quiz created successfully!");

      // Navigate to the created quiz if id present
      if (data?.id) router.push(`/dashboard/quizzes/${data.id}`);
      else router.push("/dashboard/knowledge-test");
    } catch (err: any) {
      console.error(err);
      notify.error(err?.message || "Failed to create quiz");
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
    <div className="space-y-6 container mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      <div className="max-w-5xl mx-auto space-y-8">
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
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-500 to-purple-600">
                New Knowledge Quiz
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Generate an AI-powered quiz from your study materials
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Configuration */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="border-border/40 shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border/40 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-2 rounded-md bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  Source Material
                </CardTitle>
                <CardDescription>
                  Select the document you want to be quizzed on.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <DocumentSelectionTabs
                  availableDocuments={
                    (pdfData || []).map((p: any) => ({
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
                {!document && (
                  <p className="text-sm text-amber-600 mt-2 flex items-center gap-2 animate-pulse">
                    <HelpCircle className="w-4 h-4" /> Please select a document
                    to proceed
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/40 shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border/40 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-2 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  Quiz Configuration
                </CardTitle>
                <CardDescription>
                  Customize difficulty, timing, and question types.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Prompt */}
                <div>
                  <Label
                    htmlFor="prompt"
                    className="text-sm font-semibold mb-2 block"
                  >
                    Custom Instructions (Optional)
                  </Label>
                  <Textarea
                    id="prompt"
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    rows={3}
                    placeholder="E.g., Focus on chapter 3 concepts, specifically related to quantum mechanics..."
                    className="resize-none bg-muted/20 focus:bg-background transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Difficulty */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">
                      Difficulty Level
                    </Label>
                    <div className="flex p-1 bg-muted rounded-lg">
                      {difficulties.map((diff) => (
                        <button
                          key={diff}
                          onClick={() => setDifficulty(diff)}
                          className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-all ${
                            difficulty === diff
                              ? "bg-background text-foreground shadow-xs"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {diff}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Language */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Language</Label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as any)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background/50 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="en">English (EN)</option>
                      <option value="fr">French (FR)</option>
                      <option value="ar">Arabic (AR)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Number of Questions */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex justify-between">
                      Question Count
                      <span className="text-muted-foreground font-normal">
                        {numberOfQuestions}
                      </span>
                    </Label>
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
                      className="bg-muted/20"
                    />
                  </div>

                  {/* Time Limit */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex justify-between">
                      Time Limit (min)
                      <span className="text-muted-foreground font-normal">
                        {timeLimitMinutes} min
                      </span>
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      value={timeLimitMinutes ?? ""}
                      onChange={(e) =>
                        setTimeLimitMinutes(
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      className="bg-muted/20"
                    />
                  </div>
                </div>

                {/* Explanation Level */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">
                    Explanation Detail
                  </Label>
                  <div className="grid grid-cols-3 gap-3">
                    {explanationLevels.map((level) => (
                      <div
                        key={level}
                        onClick={() => setExplanationLevel(level)}
                        className={`cursor-pointer border rounded-lg p-3 text-center transition-all ${
                          explanationLevel === level
                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500"
                            : "border-border hover:border-indigo-200 hover:bg-muted/50"
                        }`}
                      >
                        <span className="text-sm font-medium">{level}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Distribution */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">
                    Question Types Distribution (Optional)
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    {questionTypes.map((t) => (
                      <div key={t.key} className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          {t.label}
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Auto"
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
                          className="h-8 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                  {totalDistribution > 0 && (
                    <p
                      className={`text-xs mt-1 ${
                        totalDistribution !== numberOfQuestions
                          ? "text-amber-500"
                          : "text-green-500"
                      }`}
                    >
                      Sum: {totalDistribution} / {numberOfQuestions} target
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Summary & Path */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-border/40 shadow-md sticky top-6">
              <CardHeader className="bg-muted/50 pb-4">
                <CardTitle className="text-lg">Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2 pb-4 border-b border-border/50">
                  <span className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">
                    Target Document
                  </span>
                  <div className="font-medium text-sm truncate flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                    {document ? (
                      document.title
                    ) : (
                      <span className="text-muted-foreground italic">
                        None selected
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border/50">
                  <div>
                    <span className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">
                      Difficulty
                    </span>
                    <p className="font-medium text-sm mt-1">{difficulty}</p>
                  </div>
                  <div>
                    <span className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">
                      Language
                    </span>
                    <p className="font-medium text-sm mt-1 uppercase">
                      {language}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">
                      Duration
                    </span>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <p className="font-medium text-sm">
                        {timeLimitMinutes} min
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">
                      Questions
                    </span>
                    <p className="font-medium text-sm mt-1">
                      {numberOfQuestions}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleCreateQuiz}
                  disabled={!document}
                  className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Quiz
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
