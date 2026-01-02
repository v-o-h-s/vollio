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
  Globe,
  Settings2,
  FileText,
  Sparkles,
} from "lucide-react";

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
    <div className="space-y-8 container mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <Link href="/dashboard/knowledge-test">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-muted text-muted-foreground mt-1"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                New Knowledge Quiz
              </h1>
              <p className="text-muted-foreground mt-1 text-base">
                Configure your AI-powered quiz parameters
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Configuration */}
              <div className="lg:col-span-8 space-y-8">
                {/* 1. Source Material */}
                <Card className="border-border/60 shadow-sm overflow-hidden bg-card/50 backdrop-blur-xs">
                  <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg font-bold">
                      <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      1. Source Material
                    </CardTitle>
                    <CardDescription>
                      Select the document to generate questions from.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
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
                      <p className="text-sm text-destructive mt-3 flex items-center gap-2 font-medium">
                        <HelpCircle className="w-4 h-4" />{" "}
                        {errors.documentId.message}
                      </p>
                    )}
                    {!selectedDocument && !errors.documentId && (
                      <div className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm border border-amber-500/20">
                        <HelpCircle className="w-4 h-4 shrink-0" />
                        Please select a document to proceed
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 2. Configuration */}
                <Card className="border-border/60 shadow-sm overflow-hidden bg-card/50 backdrop-blur-xs">
                  <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg font-bold">
                      <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Settings2 className="w-5 h-5" />
                      </div>
                      2. Quiz Settings
                    </CardTitle>
                    <CardDescription>
                      Customize difficulty, language, and format.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-8">
                    {/* Prompt */}
                    <FormField
                      control={control}
                      name="userPrompt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold">
                            Specific Focus (Optional)
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={3}
                              placeholder="E.g., Focus on key definitions and dates from Chapter 2..."
                              className="resize-none bg-background focus-visible:ring-primary/30 min-h-[100px]"
                            />
                          </FormControl>
                          <p className="text-[11px] text-muted-foreground">
                            Leave empty for a comprehensive coverage.
                          </p>
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Difficulty */}
                      <FormField
                        control={control}
                        name="difficulty"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-sm font-semibold flex items-center gap-2">
                              Difficulty Level
                            </FormLabel>
                            <FormControl>
                              <div className="grid grid-cols-3 gap-3">
                                {difficulties.map((diff) => {
                                  const Icon = diff.icon;
                                  const isSelected = field.value === diff.key;
                                  return (
                                    <button
                                      key={diff.key}
                                      type="button"
                                      onClick={() => field.onChange(diff.key)}
                                      className={cn(
                                        "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                        isSelected
                                          ? cn("border-transparent shadow-sm ring-2 ring-primary/20", diff.bg, diff.color)
                                          : "border-border hover:border-primary/30 hover:bg-muted/50 text-muted-foreground"
                                      )}
                                    >
                                      <Icon className={cn("w-5 h-5 mb-2", isSelected ? "opacity-100" : "opacity-60")} />
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
                              Language
                            </FormLabel>
                            <FormControl>
                              <div className="grid grid-cols-2 gap-3">
                                {languages.map((lang) => {
                                  const isSelected = field.value === lang.key;
                                  return (
                                    <button
                                      key={lang.key}
                                      type="button"
                                      onClick={() => field.onChange(lang.key)}
                                      className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                        isSelected
                                          ? "border-primary/50 bg-primary/5 text-primary shadow-sm ring-1 ring-primary/20"
                                          : "border-border hover:border-primary/30 hover:bg-muted/50 text-muted-foreground"
                                      )}
                                    >
                                      <span className="text-xl leading-none">{lang.icon}</span>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-border/40">
                      {/* Number of Questions */}
                      <FormField
                        control={control}
                        name="numberOfQuestions"
                        render={({ field }) => (
                          <FormItem className="space-y-4">
                            <div className="flex justify-between items-center">
                              <FormLabel className="text-sm font-semibold">
                                Question Count
                              </FormLabel>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min={1}
                                  max={50}
                                  className="w-16 h-8 text-center font-bold bg-background"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value
                                        ? Math.min(50, Math.max(1, Number(e.target.value)))
                                        : undefined
                                    )
                                  }
                                />
                              </div>
                            </div>
                            <FormControl>
                              <Slider
                                value={[field.value || 1]}
                                min={1}
                                max={50}
                                step={1}
                                onValueChange={(vals) => field.onChange(vals[0])}
                                className="py-2"
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
                          <FormItem className="space-y-4">
                            <div className="flex justify-between items-center">
                              <FormLabel className="text-sm font-semibold">
                                Time Limit
                              </FormLabel>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min={0}
                                  max={180}
                                  placeholder="∞"
                                  className="w-16 h-8 text-center font-bold bg-background"
                                  value={field.value ?? ""}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value === ""
                                        ? undefined
                                        : Math.min(180, Number(e.target.value))
                                    )
                                  }
                                />
                                <span className="text-xs text-muted-foreground">min</span>
                              </div>
                            </div>
                            <FormControl>
                              <Slider
                                value={[field.value || 0]}
                                min={0}
                                max={60}
                                step={5}
                                onValueChange={(vals) =>
                                  field.onChange(vals[0] === 0 ? undefined : vals[0])
                                }
                                className="py-2"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Explanation Level */}
                    <FormField
                      control={control}
                      name="explanationLevel"
                      render={({ field }) => (
                        <FormItem className="space-y-3 pt-4 border-t border-border/40">
                          <FormLabel className="text-sm font-semibold">
                            Detail Level
                          </FormLabel>
                          <FormControl>
                            <div className="grid grid-cols-3 gap-4">
                              {explanationLevels.map((level) => {
                                const isSelected = field.value === level.key;
                                return (
                                  <div
                                    key={level.key}
                                    onClick={() => field.onChange(level.key)}
                                    className={cn(
                                      "cursor-pointer border-2 rounded-xl p-3 text-center transition-all duration-200 outline-none ring-offset-2",
                                      isSelected
                                        ? "border-primary/50 bg-primary/5 text-primary shadow-sm ring-1 ring-primary/20"
                                        : "border-border hover:border-primary/30 hover:bg-muted/50 text-muted-foreground"
                                    )}
                                  >
                                    <div className="text-sm font-bold uppercase tracking-wider mb-1">
                                      {level.label}
                                    </div>
                                    <div className="text-[10px] opacity-80">
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
                          Question Types <span className="text-muted-foreground font-normal text-xs">(Auto-balanced if ignored)</span>
                        </FormLabel>
                      </div>

                      <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                        <QuestionDistribution
                          totalQuestions={numberOfQuestions}
                          distribution={questionsDistribution || {}}
                          onChange={(
                            key: string,
                            value: number | undefined
                          ) => {
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
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Summary & Path */}
              <div className="lg:col-span-4 relative h-full">
                <div className="sticky top-6 space-y-6">
                  <Card className="border-border/60 shadow-xl overflow-hidden bg-card/70 backdrop-blur-md">
                    <CardHeader className="bg-primary/5 border-b border-border/50 pb-4">
                      <CardTitle className="text-lg flex items-center gap-2 font-bold">
                        <Sparkles className="w-5 h-5 text-primary" />
                        Quiz Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest flex items-center gap-1.5">
                          <FileText className="w-3 h-3" /> Source
                        </span>
                        <div className={cn(
                          "font-medium text-sm p-3 rounded-lg border flex items-center gap-3 transition-colors",
                          selectedDocument ? "bg-background border-border" : "bg-muted/30 border-transparent text-muted-foreground italic"
                        )}>
                          {selectedDocument ? (
                            <span className="truncate">{selectedDocument.title}</span>
                          ) : (
                            "No document selected"
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/40">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">
                            Difficulty
                          </span>
                          <div className="flex items-center gap-2">
                            <Brain className="w-4 h-4 text-primary" />
                            <p className="font-bold text-sm capitalize">{difficulty}</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">
                            Language
                          </span>
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-primary" />
                            <p className="font-bold text-sm uppercase">{language}</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">
                            Time
                          </span>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            <p className="font-bold text-sm">
                              {timeLimitMinutes ? `${timeLimitMinutes} min` : "Unlimited"}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">
                            Questions
                          </span>
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-primary" />
                            <p className="font-bold text-sm">{numberOfQuestions}</p>
                          </div>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={!selectedDocument || isSubmitting}
                        className="w-full h-12 text-base font-bold shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                        size="lg"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Generating...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <Sparkles className="w-4 h-4 fill-current" />
                            Generate Quiz
                          </div>
                        )}
                      </Button>
                      
                      <p className="text-xs text-center text-muted-foreground">
                        Estimated generation time: ~15s
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
