"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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

import { ArrowLeft, BookOpen, Zap, Clock, HelpCircle } from "lucide-react";

import { DocumentSelectionTabs } from "@/components/quiz/DocumentSelectionTabs";
import { useGetAllFilesQuery } from "@/lib/store/apiSlice";
import { notify } from "@/lib/notify";
import {
  quizCreationSchema,
  type QuizCreationFormData,
} from "@/lib/schemas/knowledge-test.schema";

// Local enum-like constants mirroring server enums
const difficulties = ["easy", "medium", "hard"] as const;
const languages = ["en", "fr", "ar"] as const;
const explanationLevels = ["none", "brief", "detailed"] as const;

const questionTypes = [
  { key: "MCQ", label: "Multiple Choice" },
  { key: "TRUE_FALSE", label: "True / False" },
];

export default function CreateQuizPage() {
  const router = useRouter();

  const { data: pdfData, isLoading: isLoadingPDFs } = useGetAllFilesQuery();

  // Initialize React Hook Form
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<QuizCreationFormData>({
    resolver: zodResolver(quizCreationSchema),
    defaultValues: {
      documentId: "",
      userPrompt: "",
      difficulty: "medium",
      numberOfQuestions: 10,
      language: "en",
      timeLimitMinutes: 10,
      explanationLevel: "none",
      questionsDistribution: {
        MCQ: undefined,
        TRUE_FALSE: undefined,
      },
    },
  });

  // Watch form values
  const documentId = watch("documentId");
  const difficulty = watch("difficulty");
  const numberOfQuestions = watch("numberOfQuestions");
  const language = watch("language");
  const timeLimitMinutes = watch("timeLimitMinutes");
  const questionsDistribution = watch("questionsDistribution");

  // Get selected document info
  const selectedDocument = useMemo(() => {
    if (!documentId || !pdfData) return null;
    const doc = pdfData.find((p: any) => p.id === documentId);
    return doc
      ? { id: doc.id, title: doc.filename ?? doc.title ?? "Untitled" }
      : null;
  }, [documentId, pdfData]);

  const selectedDocuments = useMemo(
    () => (selectedDocument ? [{ id: selectedDocument.id }] : []),
    [selectedDocument]
  );

  const handleAddDocument = (doc: { id: string; title: string }) => {
    setValue("documentId", doc.id, { shouldValidate: true });
  };

  const onSubmit = async (data: QuizCreationFormData) => {
    const body: any = {
      documentId: data.documentId,
      difficultyLevel: data.difficulty.toUpperCase(),
    };

    if (data.userPrompt?.trim()) body.userPrompt = data.userPrompt.trim();
    if (data.numberOfQuestions) body.numberOfQuestions = data.numberOfQuestions;
    if (data.language) body.language = data.language;
    if (data.timeLimitMinutes) body.timeLimitMinutes = data.timeLimitMinutes;
    if (data.explanationLevel)
      body.explanationLevel = data.explanationLevel.toUpperCase();

    // questionsDistribution: only include numbers
    const dist: Record<string, number> = {};
    if (data.questionsDistribution) {
      Object.entries(data.questionsDistribution).forEach(([k, v]) => {
        if (typeof v === "number" && !Number.isNaN(v) && v > 0) {
          dist[k] = v;
        }
      });
    }
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

      const responseData = await resp.json();
      notify.success("Quiz created successfully!");
      
      // Navigate to the created quiz if id present
      if (responseData?.id)
        router.push(`/dashboard/quizzes/${responseData.id}`);
      else router.push("/dashboard/knowledge-test");
    } catch (err: any) {
      console.error(err);
      notify.error(err?.message || "Failed to create quiz");
    }
  };

  const totalDistribution = useMemo(() => {
    if (!questionsDistribution) return 0;
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

        <form onSubmit={handleSubmit(onSubmit)}>
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
                  {errors.documentId && (
                    <p className="text-sm text-destructive mt-2 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4" />{" "}
                      {errors.documentId.message}
                    </p>
                  )}
                  {!selectedDocument && !errors.documentId && (
                    <p className="text-sm text-amber-600 mt-2 flex items-center gap-2 animate-pulse">
                      <HelpCircle className="w-4 h-4" /> Please select a
                      document to proceed
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
                    <Controller
                      name="userPrompt"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          id="prompt"
                          {...field}
                          rows={3}
                          placeholder="E.g., Focus on chapter 3 concepts, specifically related to quantum mechanics..."
                          className="resize-none bg-muted/20 focus:bg-background transition-colors"
                        />
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Difficulty */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">
                        Difficulty Level
                      </Label>
                      <Controller
                        name="difficulty"
                        control={control}
                        render={({ field }) => (
                          <div className="flex p-1 bg-muted rounded-lg">
                            {difficulties.map((diff) => (
                              <button
                                key={diff}
                                type="button"
                                onClick={() => field.onChange(diff)}
                                className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-all ${
                                  field.value === diff
                                    ? "bg-background text-foreground shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                {diff}
                              </button>
                            ))}
                          </div>
                        )}
                      />
                      {errors.difficulty && (
                        <p className="text-xs text-destructive">
                          {errors.difficulty.message}
                        </p>
                      )}
                    </div>

                    {/* Language */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Language</Label>
                      <Controller
                        name="language"
                        control={control}
                        render={({ field }) => (
                          <select
                            {...field}
                            className="w-full h-10 px-3 rounded-md border border-input bg-background/50 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            <option value="en">English (EN)</option>
                            <option value="fr">French (FR)</option>
                            <option value="ar">Arabic (AR)</option>
                          </select>
                        )}
                      />
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
                      <Controller
                        name="numberOfQuestions"
                        control={control}
                        render={({ field }) => (
                          <Input
                            type="number"
                            min={1}
                            max={44}
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? Number(e.target.value)
                                  : undefined
                              )
                            }
                            className="bg-muted/20"
                          />
                        )}
                      />
                      {errors.numberOfQuestions && (
                        <p className="text-xs text-destructive">
                          {errors.numberOfQuestions.message}
                        </p>
                      )}
                    </div>

                    {/* Time Limit */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold flex justify-between">
                        Time Limit (min)
                        <span className="text-muted-foreground font-normal">
                          {timeLimitMinutes} min
                        </span>
                      </Label>
                      <Controller
                        name="timeLimitMinutes"
                        control={control}
                        render={({ field }) => (
                          <Input
                            type="number"
                            min={1}
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? Number(e.target.value)
                                  : undefined
                              )
                            }
                            className="bg-muted/20"
                          />
                        )}
                      />
                    </div>
                  </div>

                  {/* Explanation Level */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">
                      Explanation Detail
                    </Label>
                    <Controller
                      name="explanationLevel"
                      control={control}
                      render={({ field }) => (
                        <div className="grid grid-cols-3 gap-3">
                          {explanationLevels.map((level) => (
                            <div
                              key={level}
                              onClick={() => field.onChange(level)}
                              className={`cursor-pointer border rounded-lg p-3 text-center transition-all ${
                                field.value === level
                                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500"
                                  : "border-border hover:border-indigo-200 hover:bg-muted/50"
                              }`}
                            >
                              <span className="text-sm font-medium">
                                {level}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    />
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
                          <Controller
                            name={`questionsDistribution.${t.key}` as any}
                            control={control}
                            render={({ field }) => (
                              <Input
                                type="number"
                                min={0}
                                placeholder="Auto"
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? undefined
                                      : Number(e.target.value)
                                  )
                                }
                                className="h-8 text-sm"
                              />
                            )}
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
                      {selectedDocument ? (
                        selectedDocument.title
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
                      <p className="font-medium text-sm mt-1 capitalize">
                        {difficulty}
                      </p>
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
                    type="submit"
                    disabled={!selectedDocument || isSubmitting}
                    className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Generating..." : "Generate Quiz"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
