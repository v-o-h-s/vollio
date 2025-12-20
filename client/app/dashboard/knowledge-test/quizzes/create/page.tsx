"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { ArrowLeft, BookOpen, Zap, Clock, HelpCircle } from "lucide-react";

import { DocumentSelectionTabs } from "@/features/knowldge-test/quizzes/components/DocumentSelectionTabs";
import { useGetAllFilesQuery } from "@/lib/store/apiSlice";
import {
  quizCreationSchema,
  type QuizCreationFormData,
} from "@/features/knowldge-test/quizzes/schemas/createQuizSchema";
import { onSubmit } from "@/features/knowldge-test/quizzes/forms/createQuiz";
import { toast } from "react-toastify";

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

  const { data: documentsData, isLoading: isLoadingDocuments } =
    useGetAllFilesQuery();

  // Initialize React Hook Form
  const form = useForm<QuizCreationFormData>({
    resolver: zodResolver(quizCreationSchema),
    defaultValues: {
      userPrompt: "",
      difficulty: "medium",
      numberOfQuestions: 10,
      language: "en",
      timeLimitMinutes: 10,
      explanationLevel: "none",
    },
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isSubmitted },
  } = form;

  // Watch form values
  const documentId = watch("documentId");
  const difficulty = watch("difficulty");
  const numberOfQuestions = watch("numberOfQuestions");
  const language = watch("language");
  const timeLimitMinutes = watch("timeLimitMinutes");
  const questionsDistribution = watch("questionsDistribution");

  // to update the documentId field in the form
  const handleSelectDocument = (doc: { id: string }) => {
    setValue("documentId", doc.id, { shouldValidate: true });
  };

  // Get selected document info
  const selectedDocument = useMemo(() => {
    if (!documentId || !documentsData) return null;
    const doc = documentsData.find((p: any) => p.id === documentId);
    return doc ? { id: doc.id, title: doc.filename } : null;
  }, [documentId, documentsData]);

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

        <Form {...form}>
          <form
            onSubmit={handleSubmit((data) =>
              toast.promise(onSubmit(data), {
                pending: "Creating quiz...",
                success: "Quiz created successfully!",
                error: "Failed to create quiz",
              })
            )}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Configuration */}
              <div className="lg:col-span-8 space-y-6">
                <Card className="border-border/40 shadow-sm overflow-hidden bg-card/20">
                  <CardHeader className="bg-card/20 border-b border-border/40 pb-4">
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
                        (documentsData || []).map((p: any) => ({
                          id: p.id,
                          title: p.filename ?? "Untitled",
                        })) as any
                      }
                      onSelectDocument={(d: any) =>
                        handleSelectDocument({ id: d.id })
                      }
                      isLoadingPDFs={isLoadingDocuments}
                    />
                    {isSubmitted && errors.documentId && (
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

                <Card className="border-border/40 shadow-sm overflow-hidden bg-card/20">
                  <CardHeader className="bg-card/20 border-b border-border/40 pb-4">
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
                    <FormField
                      control={control}
                      name="userPrompt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold">
                            Custom Instructions (Optional)
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={3}
                              placeholder="E.g., Focus on chapter 3 concepts, specifically related to quantum mechanics..."
                              className="resize-none bg-muted/20 focus:bg-background transition-colors"
                            />
                          </FormControl>
                          {isSubmitted && <FormMessage />}
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Difficulty */}
                      <FormField
                        control={control}
                        name="difficulty"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-sm font-semibold">
                              Difficulty Level
                            </FormLabel>
                            <FormControl>
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
                            </FormControl>
                            {isSubmitted && <FormMessage />}
                          </FormItem>
                        )}
                      />

                      {/* Language */}
                      <FormField
                        control={control}
                        name="language"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-sm font-semibold">
                              Language
                            </FormLabel>
                            <FormControl>
                              <select
                                {...field}
                                className="w-full h-10 px-3 rounded-md border border-input bg-background/50 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                              >
                                <option value="en">English (EN)</option>
                                <option value="fr">French (FR)</option>
                                <option value="ar">Arabic (AR)</option>
                              </select>
                            </FormControl>
                            {isSubmitted && <FormMessage />}
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Number of Questions */}
                      <FormField
                        control={control}
                        name="numberOfQuestions"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <div className="flex justify-between items-center">
                              <FormLabel className="text-sm font-semibold">
                                Question Count
                              </FormLabel>
                              <span className="text-muted-foreground text-sm font-normal">
                                {numberOfQuestions}
                              </span>
                            </div>
                            <FormControl>
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
                            </FormControl>
                            {isSubmitted && <FormMessage />}
                          </FormItem>
                        )}
                      />

                      {/* Time Limit */}
                      <FormField
                        control={control}
                        name="timeLimitMinutes"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <div className="flex justify-between items-center">
                              <FormLabel className="text-sm font-semibold">
                                Time Limit (min)
                              </FormLabel>
                              <span className="text-muted-foreground text-sm font-normal">
                                {timeLimitMinutes} min
                              </span>
                            </div>
                            <FormControl>
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
                            </FormControl>
                            {isSubmitted && <FormMessage />}
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Explanation Level */}
                    <FormField
                      control={control}
                      name="explanationLevel"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-sm font-semibold">
                            Explanation Detail
                          </FormLabel>
                          <FormControl>
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
                          </FormControl>
                          {isSubmitted && <FormMessage />}
                        </FormItem>
                      )}
                    />

                    {/* Distribution */}
                    <div className="space-y-3">
                      <FormLabel className="text-sm font-semibold">
                        Question Types Distribution (Optional)
                      </FormLabel>
                      <div className="grid grid-cols-2 gap-4">
                        {questionTypes.map((t) => (
                          <FormField
                            key={t.key}
                            control={control}
                            name={`questionsDistribution.${t.key}` as any}
                            render={({ field }) => (
                              <FormItem className="space-y-1">
                                <FormLabel className="text-xs text-muted-foreground">
                                  {t.label}
                                </FormLabel>
                                <FormControl>
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
                                </FormControl>
                                {isSubmitted && <FormMessage />}
                              </FormItem>
                            )}
                          />
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
                <Card className="border-border/40 shadow-md sticky top-6 bg-card/20">
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
        </Form>
      </div>
    </div>
  );
}
