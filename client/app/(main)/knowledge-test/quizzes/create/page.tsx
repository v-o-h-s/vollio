"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  BookOpen,
  Zap,
  FileText,
  Sparkles,
  Loader2,
} from "lucide-react";
import { DocumentSelectionTabs } from "@/features/knowldge-test/quizzes/components/DocumentSelectionTabs";
import { QuestionDistribution } from "@/features/knowldge-test/quizzes/components/QuestionDistribution";
import { useGetAllDocumentsQuery } from "@/lib/store/apiSlice";
import {
  quizCreationSchema,
  type QuizCreationFormData,
} from "@/features/knowldge-test/quizzes/schemas/createQuizSchema";
import {
  difficulties,
  explanationLevels,
} from "@/features/knowldge-test/flashcards/constants";
import { useSubmitQuiz } from "@/features/knowldge-test/quizzes/hooks/useSubmitQuiz";

export default function CreateQuizPage() {
  const { onSubmit: handleQuizSubmit, isLoading: isSubmitting } =
    useSubmitQuiz();

  const { data: documentsData, isLoading: isLoadingDocuments } =
    useGetAllDocumentsQuery();

  // Initialize React Hook Form
  const form = useForm<QuizCreationFormData>({
    resolver: zodResolver(quizCreationSchema),
    defaultValues: {
      difficulty: "medium",
      numberOfQuestions: 10,
      language: "en",
      explanationLevel: "none",
      questionsDistribution: {
        MCQ: 0,
        TRUE_FALSE: 0,
      },
    },
  });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitted },
  } = form;

  // Optimized watch - only subscribe to the fields we need
  const watchedValues = useWatch({
    control,
    name: ["documentId", "numberOfQuestions", "questionsDistribution"],
  });

  const [documentId, numberOfQuestions, questionsDistribution] = watchedValues;

  // Handler for document selection (using setValue is correct here - external to FormField)
  const handleSelectDocument = (doc: { id: string }) => {
    setValue("documentId", doc.id, { shouldValidate: true });
  };

  // Handler for distribution changes (using setValue is correct here - external component)
  const handleDistributionChange = (key: string, value: number | undefined) => {
    setValue(`questionsDistribution.${key as "MCQ" | "TRUE_FALSE"}`, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  // Get selected document info
  const selectedDocument = useMemo(() => {
    if (!documentId || !documentsData) return null;
    const doc = documentsData.find((p: { id: string }) => p.id === documentId);
    return doc ? { id: doc.id, title: doc.name } : null;
  }, [documentId, documentsData]);

  // Transform documents for the selection component
  const availableDocuments = useMemo(() => {
    return (documentsData || []).map((p: { id: string; name?: string }) => ({
      id: p.id,
      title: p.name ?? "Untitled",
    }));
  }, [documentsData]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Link href="/knowledge-test">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">
              Create New Quiz
            </h1>
          </div>
          <p className="text-sm text-muted-foreground ml-10">
            Configure your AI-powered quiz settings.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={handleSubmit(handleQuizSubmit)}
          className="flex flex-col gap-6 max-w-2xl mx-auto"
        >
          <div className="space-y-6">
            {/* 1. Source Material */}
            <div className="bg-background rounded-xl border p-6 space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Source Material
                </h3>
                <p className="text-sm text-muted-foreground">
                  Select the document to quiz yourself on.
                </p>
              </div>

              <div className="pt-2">
                <DocumentSelectionTabs
                  availableDocuments={availableDocuments}
                  onSelectDocument={(d) => handleSelectDocument({ id: d.id })}
                  selectedDocumentId={documentId}
                  isLoadingDocuments={isLoadingDocuments}
                />
                {isSubmitted && errors.documentId && (
                  <p className="text-xs text-destructive font-medium mt-2">
                    {errors.documentId.message}
                  </p>
                )}
              </div>
            </div>

            {/* Distribution */}
            <div className="bg-background rounded-xl border p-6 space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Content Distribution
                </h3>
                <p className="text-sm text-muted-foreground">
                  Verify or adjust the question distribution.
                </p>
              </div>

              <div className="pt-2 space-y-6">
                {/* Number of Questions */}
                <FormField
                  control={control}
                  name="numberOfQuestions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Questions</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={50}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            const numVal = val
                              ? Math.min(50, Math.max(1, Number(val)))
                              : 0;
                            field.onChange(numVal);
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <QuestionDistribution
                  totalQuestions={numberOfQuestions ?? 10}
                  distribution={questionsDistribution || {}}
                  onChange={handleDistributionChange}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Configuration */}
            <div className="bg-background rounded-xl border p-6 space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Configuration
                </h3>
                <p className="text-sm text-muted-foreground">
                  Customize quiz parameters.
                </p>
              </div>

              <div className="space-y-6">
                {/* Difficulty */}
                <FormField
                  control={control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-3 gap-2">
                          {difficulties.map((diff) => (
                            <Button
                              key={diff.key}
                              type="button"
                              variant={
                                field.value === diff.key ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => field.onChange(diff.key)}
                              className="w-full"
                            >
                              {diff.label}
                            </Button>
                          ))}
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Explanation Level */}
                <FormField
                  control={control}
                  name="explanationLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Explanation Detail</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-3 gap-2">
                          {explanationLevels.map((level) => (
                            <Button
                              key={level.key}
                              type="button"
                              variant={
                                field.value === level.key
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => field.onChange(level.key)}
                              className="w-full text-xs"
                            >
                              {level.label}
                            </Button>
                          ))}
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={!selectedDocument || isSubmitting}
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Quiz
                    </>
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Estimated time: ~24 seconds
                </p>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
