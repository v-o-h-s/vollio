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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-32">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="flex items-center justify-between">
          <Link href="/dashboard/knowledge-test">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full hover:bg-muted group border border-border/40"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-5 rounded-[40px] bg-purple-500/10 w-fit mx-auto border border-purple-500/20 shadow-lg shadow-purple-500/5">
            <RobotIcon className="w-12 h-12 text-purple-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">
              New Quiz
            </h1>
            <p className="text-muted-foreground text-sm font-medium">
              Configure your AI-powered mastery challenge.
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
            className="space-y-16"
          >
            {/* 1. Source Material */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                <BookOpen className="w-4 h-4" />
                Step 1: Source Material
              </div>
              <div className="p-2 rounded-[40px] bg-muted/10 border border-border/40 overflow-hidden shadow-2xl shadow-background/50">
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
              </div>
              {isSubmitted && errors.documentId && (
                <p className="text-xs text-destructive font-bold ml-4">
                  {errors.documentId.message}
                </p>
              )}
            </div>

            {/* 2. Configuration */}
            <div className="space-y-10 bg-muted/5 p-10 rounded-[40px] border border-border/40 shadow-2xl shadow-background/50">
              <div className="space-y-1">
                <h3 className="font-black italic uppercase tracking-tighter text-2xl leading-none">
                  Parameters
                </h3>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                  Step 2: Customization
                </p>
              </div>

              <div className="space-y-10">
                {/* Specific Focus */}
                <FormField
                  control={control}
                  name="userPrompt"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Specific Focus (Optional)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={3}
                          placeholder="e.g. Focus on key dates from Chapter 2..."
                          className="bg-background/80 border-none shadow-xl focus-visible:ring-2 focus-visible:ring-primary/20 rounded-3xl p-6 text-sm font-medium resize-none leading-relaxed transition-all duration-300"
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
                    <FormItem className="space-y-4">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Complexity
                      </FormLabel>
                      <FormControl>
                        <div className="flex gap-1 bg-muted/20 p-1.5 rounded-2xl">
                          {difficulties.map((diff) => {
                            const isSelected = field.value === diff.key;
                            return (
                              <button
                                key={diff.key}
                                type="button"
                                onClick={() => field.onChange(diff.key)}
                                className={cn(
                                  "flex-1 py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                  isSelected
                                    ? "bg-background shadow-md text-foreground scale-105"
                                    : "text-muted-foreground hover:text-foreground"
                                )}
                              >
                                {diff.label}
                              </button>
                            );
                          })}
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Number of Questions */}
                  <FormField
                    control={control}
                    name="numberOfQuestions"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                          Quantity
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-4 bg-muted/20 p-2 rounded-2xl focus-within:ring-2 focus-within:ring-primary/20 transition-all">
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
                                        Math.max(1, Number(e.target.value))
                                      )
                                    : undefined
                                )
                              }
                              className="h-10 bg-transparent border-none shadow-none text-2xl font-black w-20 text-center ring-0 focus-visible:ring-0"
                            />
                            <span className="text-xs font-black text-muted-foreground uppercase italic pr-4">
                              Questions
                            </span>
                          </div>
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
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                          Duration
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-4 bg-muted/20 p-2 rounded-2xl focus-within:ring-2 focus-within:ring-primary/20 transition-all">
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
                                    : Math.min(180, Number(e.target.value))
                                )
                              }
                              className="h-10 bg-transparent border-none shadow-none text-2xl font-black w-20 text-center ring-0 focus-visible:ring-0 placeholder:text-muted-foreground/30"
                            />
                            <span className="text-xs font-black text-muted-foreground uppercase italic pr-4">
                              Minutes
                            </span>
                          </div>
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
                    <FormItem className="space-y-4">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Explanation Depth
                      </FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-3 gap-2 bg-muted/20 p-2 rounded-3xl">
                          {explanationLevels.map((level) => {
                            const isSelected = field.value === level.key;
                            return (
                              <button
                                key={level.key}
                                type="button"
                                onClick={() => field.onChange(level.key)}
                                className={cn(
                                  "py-4 px-2 rounded-2xl text-center transition-all duration-300",
                                  isSelected
                                    ? "bg-background shadow-xl scale-105"
                                    : "hover:bg-background/40"
                                )}
                              >
                                <div
                                  className={cn(
                                    "text-[10px] font-black uppercase tracking-widest leading-none mb-1",
                                    isSelected
                                      ? "text-primary"
                                      : "text-muted-foreground"
                                  )}
                                >
                                  {level.label}
                                </div>
                                <div className="text-[8px] font-bold opacity-60 uppercase tracking-tighter">
                                  {level.description}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Distribution */}
                <div className="space-y-4 pt-4">
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Content Distribution
                  </FormLabel>
                  <div className="bg-background/40 rounded-3xl p-6 border border-border/20 shadow-xl">
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
            </div>

            <Button
              type="submit"
              disabled={!selectedDocument || isSubmitting}
              className="w-full h-20 bg-foreground text-background hover:bg-foreground/90 rounded-[40px] font-black text-2xl tracking-tighter shadow-2xl transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-4">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  ANALYZING SOURCE...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-4">
                  GENERATE QUIZ
                  <Sparkles className="w-6 h-6 group-hover:fill-current transition-all animate-pulse" />
                </div>
              )}
            </Button>

            <p className="text-[10px] text-center text-muted-foreground font-black uppercase tracking-[0.3em] opacity-40">
              Estimated Processing Time: ~15 seconds
            </p>
          </form>
        </Form>
      </div>
    </div>
  );
}
