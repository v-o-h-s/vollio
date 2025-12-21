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
import { Slider } from "@/components/ui/slider";
import {
  ArrowLeft,
  BookOpen,
  Zap,
  Clock,
  HelpCircle,
  Brain,
  MessageSquare,
  CheckCircle2,
  ListTodo,
  AlertCircle,
  Globe,
  Settings2,
  FileText,
} from "lucide-react";

import { DocumentSelectionTabs } from "@/features/knowldge-test/quizzes/components/DocumentSelectionTabs";
import { QuestionDistribution } from "@/features/knowldge-test/quizzes/components/QuestionDistribution";
import {
  useGetAllFilesQuery,
  useCreateQuizMutation,
} from "@/lib/store/apiSlice";
import {
  quizCreationSchema,
  type QuizCreationFormData,
} from "@/features/knowldge-test/quizzes/schemas/createQuizSchema";
import { prepareQuizPayload } from "@/features/knowldge-test/quizzes/forms/createQuiz";
import { toast } from "react-toastify";

// Local enum-like constants mirroring server enums
const difficulties = [
  {
    key: "easy",
    label: "Easy",
    description: "Focus on basics",
    icon: Brain,
    color: "text-green-500",
  },
  {
    key: "medium",
    label: "Medium",
    description: "Standard level",
    icon: Brain,
    color: "text-amber-500",
  },
  {
    key: "hard",
    label: "Hard",
    description: "Challenging",
    icon: Brain,
    color: "text-rose-500",
  },
] as const;

const languages = [
  { key: "en", label: "English", icon: "🇺🇸" },
  { key: "fr", label: "French", icon: "🇫🇷" },
  { key: "es", label: "Spanish", icon: "🇪🇸" },
  { key: "ar", label: "Arabic", icon: "🇦🇪" },
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
    useGetAllFilesQuery();
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
            onSubmit={handleSubmit(async (data) => {
              const payload = prepareQuizPayload(data);
              await toast.promise(
                createQuiz(payload)
                  .unwrap()
                  .then((res) => {
                    if (res?.id) {
                      router.push(
                        `/dashboard/knowledge-test/quizzes/${res.id}`
                      );
                    } else {
                      router.push("/dashboard/knowledge-test");
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
                }
              );
            })}
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
                      selectedDocumentId={documentId}
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
                            <FormLabel className="text-sm font-semibold flex items-center gap-2">
                              <Brain className="w-4 h-4 text-indigo-500" />
                              Difficulty Level
                            </FormLabel>
                            <FormControl>
                              <div className="grid grid-cols-3 gap-2">
                                {difficulties.map((diff) => {
                                  const Icon = diff.icon;
                                  const isSelected = field.value === diff.key;
                                  return (
                                    <button
                                      key={diff.key}
                                      type="button"
                                      onClick={() => field.onChange(diff.key)}
                                      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 ${
                                        isSelected
                                          ? "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                          : "border-border/50 hover:border-indigo-200 hover:bg-muted/50 text-muted-foreground"
                                      }`}
                                    >
                                      <Icon
                                        className={`w-5 h-5 mb-2 ${
                                          isSelected
                                            ? diff.color
                                            : "text-muted-foreground/60"
                                        }`}
                                      />
                                      <span className="text-xs font-bold uppercase tracking-wider">
                                        {diff.label}
                                      </span>
                                    </button>
                                  );
                                })}
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
                            <FormLabel className="text-sm font-semibold flex items-center gap-2">
                              <Globe className="w-4 h-4 text-indigo-500" />
                              Questions Language
                            </FormLabel>
                            <FormControl>
                              <div className="grid grid-cols-2 gap-2">
                                {languages.map((lang) => {
                                  const isSelected = field.value === lang.key;
                                  return (
                                    <button
                                      key={lang.key}
                                      type="button"
                                      onClick={() => field.onChange(lang.key)}
                                      className={`flex items-center gap-3 px-4 py-2 rounded-xl border-2 transition-all duration-200 ${
                                        isSelected
                                          ? "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                          : "border-border/50 hover:border-indigo-200 hover:bg-muted/50 text-muted-foreground"
                                      }`}
                                    >
                                      <span className="text-xl">
                                        {lang.icon}
                                      </span>
                                      <span className="text-xs font-bold uppercase tracking-wider">
                                        {lang.label}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
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
                          <FormItem className="space-y-4">
                            <div className="flex justify-between items-center">
                              <FormLabel className="text-sm font-semibold flex items-center gap-2">
                                <ListTodo className="w-4 h-4 text-indigo-500" />
                                Number of Questions
                              </FormLabel>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min={1}
                                  max={50}
                                  className="w-16 h-8 text-center bg-muted/20 font-bold"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value
                                        ? Math.min(
                                            50,
                                            Math.max(1, Number(e.target.value))
                                          )
                                        : undefined
                                    )
                                  }
                                />
                                <span className="text-xs text-muted-foreground">
                                  / 50
                                </span>
                              </div>
                            </div>
                            <FormControl>
                              <div className="px-2">
                                <Slider
                                  value={[field.value || 1]}
                                  min={1}
                                  max={50}
                                  step={1}
                                  onValueChange={(vals) =>
                                    field.onChange(vals[0])
                                  }
                                  className="py-4"
                                />
                              </div>
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
                          <FormItem className="space-y-4">
                            <div className="flex justify-between items-center">
                              <FormLabel className="text-sm font-semibold flex items-center gap-2">
                                <Clock className="w-4 h-4 text-indigo-500" />
                                Time Limit (min)
                              </FormLabel>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min={0}
                                  max={180}
                                  placeholder="No limit"
                                  className="w-20 h-8 text-center bg-muted/20 font-bold"
                                  value={field.value ?? ""}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value === ""
                                        ? undefined
                                        : Math.min(180, Number(e.target.value))
                                    )
                                  }
                                />
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {field.value ? "min" : "No limit"}
                                </span>
                              </div>
                            </div>
                            <FormControl>
                              <div className="px-2">
                                <Slider
                                  value={[field.value || 0]}
                                  min={0}
                                  max={120}
                                  step={5}
                                  onValueChange={(vals) =>
                                    field.onChange(
                                      vals[0] === 0 ? undefined : vals[0]
                                    )
                                  }
                                  className="py-4"
                                />
                              </div>
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
                          <FormLabel className="text-sm font-semibold flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-indigo-500" />
                            Explanation Detail
                          </FormLabel>
                          <FormControl>
                            <div className="grid grid-cols-3 gap-3">
                              {explanationLevels.map((level) => {
                                const isSelected = field.value === level.key;
                                return (
                                  <div
                                    key={level.key}
                                    onClick={() => field.onChange(level.key)}
                                    className={`cursor-pointer border-2 rounded-xl p-3 text-center transition-all duration-200 ${
                                      isSelected
                                        ? "border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 shadow-sm"
                                        : "border-border/50 hover:border-indigo-200 hover:bg-muted/50 text-muted-foreground"
                                    }`}
                                  >
                                    <div className="text-sm font-bold uppercase tracking-wider mb-1">
                                      {level.label}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground leading-tight">
                                      {level.description}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </FormControl>
                          {isSubmitted && <FormMessage />}
                        </FormItem>
                      )}
                    />

                    {/* Distribution */}
                    <div className="space-y-4 pt-4 border-t border-border/40">
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-sm font-semibold flex items-center gap-2">
                          <Settings2 className="w-4 h-4 text-indigo-500" />
                          Question Mix{" "}
                          <span className="text-muted-foreground font-normal">
                            (Optional)
                          </span>
                        </FormLabel>
                      </div>

                      <div className="bg-muted/10 rounded-xl p-4 border border-border/50">
                        <QuestionDistribution
                          totalQuestions={numberOfQuestions}
                          distribution={questionsDistribution || {}}
                          onChange={(
                            key: string,
                            value: number | undefined
                          ) => {
                            // Use setValue from react-hook-form to update the nested field
                            // We cast to any because the path is dynamic, but it is type-safe in practice
                            setValue(
                              `questionsDistribution.${key}` as any,
                              value,
                              {
                                shouldDirty: true,
                                shouldTouch: true,
                                shouldValidate: true,
                              }
                            );
                          }}
                        />
                      </div>

                      <p className="text-[10px] text-muted-foreground text-center">
                        * If left empty or incomplete, AI will automatically
                        balance the remaining questions.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Summary & Path */}
              <div className="lg:col-span-4 space-y-6">
                <Card className="border-border/40 shadow-xl sticky top-6 overflow-hidden bg-card/20 backdrop-blur-md">
                  <CardHeader className="bg-indigo-600/10 border-b border-border/40 pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings2 className="w-5 h-5 text-indigo-600" />
                      Quiz Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-3 pb-6 border-b border-border/40">
                      <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest flex items-center gap-2">
                        <BookOpen className="w-3 h-3" />
                        Target Material
                      </span>
                      <div className="font-semibold text-sm truncate p-3 bg-muted/30 rounded-xl border border-border/40 flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600">
                          <FileText className="w-4 h-4" />
                        </div>
                        {selectedDocument ? (
                          <span className="truncate">
                            {selectedDocument.title}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic">
                            No source selected
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-6 gap-x-4 pb-6 border-b border-border/40">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">
                          Difficulty
                        </span>
                        <div className="flex items-center gap-2">
                          <Brain className="w-3.5 h-3.5 text-indigo-500" />
                          <p className="font-bold text-sm capitalize">
                            {difficulty}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">
                          Language
                        </span>
                        <div className="flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-indigo-500" />
                          <p className="font-bold text-sm uppercase">
                            {language}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">
                          Estimated Time
                        </span>
                        <div className="flex items-center gap-2 text-indigo-600">
                          <Clock className="w-3.5 h-3.5" />
                          <p className="font-bold text-sm">
                            {timeLimitMinutes || "No limit"}
                            {timeLimitMinutes && " min"}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">
                          Questions
                        </span>
                        <div className="flex items-center gap-2 text-indigo-600">
                          <ListTodo className="w-3.5 h-3.5" />
                          <p className="font-bold text-sm">
                            {numberOfQuestions}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button
                        type="submit"
                        disabled={!selectedDocument || isSubmitting}
                        className="w-full h-12 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-[0_8px_16px_-6px_rgba(79,70,229,0.5)] transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Generating...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <Zap className="w-4 h-4 fill-white group-hover:animate-pulse" />
                            Generate My Quiz
                          </div>
                        )}
                      </Button>
                      <p className="text-[10px] text-center text-muted-foreground">
                        Ready to start? AI will generate your quiz in ~30
                        seconds.
                      </p>
                    </div>
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
