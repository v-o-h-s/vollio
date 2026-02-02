"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { Slider } from "@/components/ui/slider";
import {
  ArrowLeft,
  BookOpen,
  Zap,
  Clock,
  HelpCircle,
  Brain,
  MessageSquare,
  Globe,
  Settings2,
  FileText,
  Sparkles,
  Loader2,
} from "lucide-react";
import { RiRobot3Fill as RobotIcon } from "react-icons/ri";

import { DocumentSelectionTabs } from "@/features/knowldge-test/quizzes/components/DocumentSelectionTabs";
import { QuestionDistribution } from "@/features/knowldge-test/quizzes/components/QuestionDistribution";
import {
  useGetAllDocumentsQuery,
  useCreateQuizMutation,
} from "@/lib/store/apiSlice";
import {
  quizCreationSchema,
  type QuizCreationFormData,
} from "@/features/knowldge-test/quizzes/schemas/createQuizSchema";
import { prepareQuizPayload } from "@/features/knowldge-test/quizzes/forms/createQuiz";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";

// Local enum-like constants mirroring server enums
const difficulties = [
  {
    key: "easy",
    label: "Easy",
    description: "Focus on basics",
    icon: Brain,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    key: "medium",
    label: "Medium",
    description: "Standard level",
    icon: Brain,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    key: "hard",
    label: "Hard",
    description: "Challenging",
    icon: Brain,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  },
] as const;

const explanationLevels = [
  {
    key: "none",
    label: "None",
    description: "Answers only",
  },
  {
    key: "brief",
    label: "Brief",
    description: "Key points",
  },
  {
    key: "detailed",
    label: "Detailed",
    description: "Full explanation",
  },
] as const;

export default function CreateQuizPage() {
  const router = useRouter();

  const { data: documentsData, isLoading: isLoadingDocuments } =
    useGetAllDocumentsQuery();
  const [createQuiz] = useCreateQuizMutation();

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
    return doc ? { id: doc.id, title: doc.name } : null;
  }, [documentId, documentsData]);

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
          onSubmit={handleSubmit(async (data) => {
            const payload = prepareQuizPayload(data);
            await toast.promise(
              createQuiz(payload)
                .unwrap()
                .then((res) => {
                  if (res?.id) {
                    router.push(`/knowledge-test/quizzes/${res.id}`);
                  } else {
                    router.push("/knowledge-test");
                  }
                  return res;
                })
                .catch((err) => {
                  console.error("Quiz creation failed:", err);
                  throw err;
                }),
              {
                pending: "Creating quiz...",
                success: "Quiz created successfully!",
                error: {
                  render({ data }: any) {
                    return (
                      data?.data?.message ||
                      data?.error ||
                      "Failed to create quiz"
                    );
                  },
                },
              },
            );
          })}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
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
                  availableDocuments={
                    (documentsData || []).map((p: any) => ({
                      id: p.id,
                      title: p.name ?? "Untitled",
                    })) as any
                  }
                  onSelectDocument={(d: any) =>
                    handleSelectDocument({ id: d.id })
                  }
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

              <div className="pt-2">
                <QuestionDistribution
                  totalQuestions={numberOfQuestions}
                  distribution={questionsDistribution || {}}
                  onChange={(key: string, value: number | undefined) => {
                    setValue(`questionsDistribution.${key}` as any, value, {
                      shouldDirty: true,
                      shouldTouch: true,
                      shouldValidate: true,
                    });
                  }}
                />
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-1 space-y-6">
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
                {/* Specific Focus */}
                <FormField
                  control={control}
                  name="userPrompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specific Focus (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={3}
                          placeholder="e.g. Focus on key dates from Chapter 2..."
                          className="resize-none"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

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
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? Math.min(
                                    50,
                                    Math.max(1, Number(e.target.value)),
                                  )
                                : undefined,
                            )
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Time Limit */}
                <FormField
                  control={control}
                  name="timeLimitMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Limit (Minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={180}
                          {...field}
                          placeholder="∞"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : Math.min(180, Number(e.target.value)),
                            )
                          }
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        0 or empty for no limit
                      </p>
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
                  Estimated time: ~15 seconds
                </p>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
