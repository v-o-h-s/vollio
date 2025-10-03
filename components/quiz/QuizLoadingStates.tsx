"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingSpinner } from "@/components/ui/loading";
import { 
  Brain, 
  FileText, 
  Zap, 
  Search, 
  Sparkles, 
  CheckCircle, 
  Clock,
  Loader2,
  BookOpen,
  Target,
  Award,
  BarChart3
} from "lucide-react";

interface QuizGenerationLoadingProps {
  stage: 'initializing' | 'searching' | 'generating' | 'validating' | 'storing' | 'complete';
  progress?: number;
  currentStep?: string;
  totalSteps?: number;
  completedSteps?: number;
  estimatedTimeRemaining?: number;
  documentCount?: number;
  questionCount?: number;
}

export function QuizGenerationLoading({
  stage,
  progress,
  currentStep,
  totalSteps = 5,
  completedSteps = 0,
  estimatedTimeRemaining,
  documentCount,
  questionCount
}: QuizGenerationLoadingProps) {
  const stages = {
    initializing: {
      icon: Brain,
      title: 'Initializing Quiz Generation',
      description: 'Preparing your documents and parameters...',
      color: 'text-blue-500'
    },
    searching: {
      icon: Search,
      title: 'Searching Content',
      description: 'Finding the most relevant content from your documents...',
      color: 'text-purple-500'
    },
    generating: {
      icon: Sparkles,
      title: 'Generating Questions',
      description: 'Creating intelligent questions using AI...',
      color: 'text-green-500'
    },
    validating: {
      icon: CheckCircle,
      title: 'Validating Quality',
      description: 'Ensuring questions meet quality standards...',
      color: 'text-orange-500'
    },
    storing: {
      icon: FileText,
      title: 'Saving Quiz',
      description: 'Storing your quiz and preparing results...',
      color: 'text-indigo-500'
    },
    complete: {
      icon: Award,
      title: 'Quiz Ready!',
      description: 'Your quiz has been generated successfully.',
      color: 'text-green-600'
    }
  };

  const currentStageInfo = stages[stage];
  const Icon = currentStageInfo.icon;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/20 rounded-2xl flex items-center justify-center">
            <Icon className={`h-8 w-8 ${currentStageInfo.color} ${stage !== 'complete' ? 'animate-pulse' : ''}`} />
          </div>
        </div>
        <CardTitle className="text-2xl">{currentStageInfo.title}</CardTitle>
        <CardDescription className="text-lg">
          {currentStageInfo.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Information */}
        <div className="grid grid-cols-2 gap-4 text-center">
          {documentCount && (
            <div className="space-y-1">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {documentCount}
              </div>
              <div className="text-sm text-muted-foreground">
                Document{documentCount !== 1 ? 's' : ''}
              </div>
            </div>
          )}
          {questionCount && (
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {questionCount}
              </div>
              <div className="text-sm text-muted-foreground">
                Question{questionCount !== 1 ? 's' : ''}
              </div>
            </div>
          )}
        </div>

        {/* Current Step */}
        {currentStep && (
          <div className="text-center">
            <Badge variant="secondary" className="text-sm">
              {currentStep}
            </Badge>
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span>
              {completedSteps}/{totalSteps} steps
              {progress !== undefined && ` (${Math.round(progress)}%)`}
            </span>
          </div>
          <Progress 
            value={progress ?? (completedSteps / totalSteps) * 100} 
            className="h-2"
          />
        </div>

        {/* Time Remaining */}
        {estimatedTimeRemaining && estimatedTimeRemaining > 0 && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Estimated time remaining: {formatTime(estimatedTimeRemaining)}</span>
          </div>
        )}

        {/* Stage Indicators */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            {Object.entries(stages).slice(0, -1).map(([key, stageInfo], index) => {
              const isActive = key === stage;
              const isCompleted = completedSteps > index;
              const StageIcon = stageInfo.icon;
              
              return (
                <div key={key} className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors
                    ${isActive 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                      : isCompleted 
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                      : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
                    }
                  `}>
                    <StageIcon className={`h-4 w-4 ${
                      isActive 
                        ? 'text-blue-500' 
                        : isCompleted 
                        ? 'text-green-500'
                        : 'text-gray-400'
                    }`} />
                  </div>
                  {index < Object.keys(stages).length - 2 && (
                    <div className={`w-8 h-0.5 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface DocumentProcessingLoadingProps {
  documentName: string;
  stage: 'extracting' | 'chunking' | 'embedding' | 'storing' | 'complete';
  progress?: number;
  totalChunks?: number;
  processedChunks?: number;
  extractionMethod?: 'syncfusion' | 'ocr';
  estimatedTimeRemaining?: number;
}

export function DocumentProcessingLoading({
  documentName,
  stage,
  progress,
  totalChunks,
  processedChunks,
  extractionMethod,
  estimatedTimeRemaining
}: DocumentProcessingLoadingProps) {
  const stages = {
    extracting: {
      icon: FileText,
      title: 'Extracting Text',
      description: extractionMethod === 'ocr' 
        ? 'Using OCR to extract text from scanned document...'
        : 'Extracting text using advanced PDF processing...',
      color: 'text-blue-500'
    },
    chunking: {
      icon: Zap,
      title: 'Processing Content',
      description: 'Breaking down content into searchable chunks...',
      color: 'text-purple-500'
    },
    embedding: {
      icon: Brain,
      title: 'Creating Embeddings',
      description: 'Generating semantic embeddings for intelligent search...',
      color: 'text-green-500'
    },
    storing: {
      icon: CheckCircle,
      title: 'Storing Data',
      description: 'Saving processed content to your knowledge base...',
      color: 'text-orange-500'
    },
    complete: {
      icon: Award,
      title: 'Processing Complete',
      description: 'Document is ready for quiz generation!',
      color: 'text-green-600'
    }
  };

  const currentStageInfo = stages[stage];
  const Icon = currentStageInfo.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/20 rounded-xl flex items-center justify-center">
            <Icon className={`h-6 w-6 ${currentStageInfo.color} ${stage !== 'complete' ? 'animate-pulse' : ''}`} />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">{currentStageInfo.title}</CardTitle>
            <CardDescription className="truncate">
              {documentName}
            </CardDescription>
          </div>
          {extractionMethod && (
            <Badge variant="outline" className="text-xs">
              {extractionMethod.toUpperCase()}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {currentStageInfo.description}
        </p>

        {/* Progress */}
        {(progress !== undefined || (totalChunks && processedChunks !== undefined)) && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              {totalChunks && processedChunks !== undefined ? (
                <span>{processedChunks}/{totalChunks} chunks</span>
              ) : progress !== undefined ? (
                <span>{Math.round(progress)}%</span>
              ) : null}
            </div>
            <Progress 
              value={
                totalChunks && processedChunks !== undefined 
                  ? (processedChunks / totalChunks) * 100
                  : progress ?? 0
              } 
              className="h-2"
            />
          </div>
        )}

        {/* Time Remaining */}
        {estimatedTimeRemaining && estimatedTimeRemaining > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>~{Math.ceil(estimatedTimeRemaining / 60)} minutes remaining</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Skeleton components for quiz interfaces
export function QuizGeneratorSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Selection */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <Skeleton className="h-4 w-4 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Configuration Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

export function QuizPlayerSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-7 w-64" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
            <Skeleton className="h-9 w-20" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Question Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="w-10 h-10" />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Question */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-20" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function QuizResultsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-5 w-64 mx-auto" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-10 w-16 mx-auto" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </div>
            ))}
          </div>
          <Skeleton className="h-3 w-full mt-6" />
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-24" />
            ))}
          </div>
        </CardContent>
      </Card>


    </div>
  );
}