"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/ui/loading";
import { ErrorNotification } from "@/components/ui/error-notification";
import { 
  Clock, 
  Calendar, 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Filter,
  Eye,
  RefreshCw,
  Award,
  Target,
  BookOpen,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Star,
  AlertCircle
} from "lucide-react";
import { Quiz, QuizAttempt, QuizDifficulty, QuizQuestionType } from "@/lib/types";
import { useGetQuizHistoryQuery, useGetQuizDetailsQuery } from "@/lib/store/apiSlice";

interface QuizHistoryItem extends QuizAttempt {
  quiz: {
    title: string;
    difficulty: QuizDifficulty;
    questionCount: number;
    questionTypes: QuizQuestionType[];
    sourceDocumentIds: string[];
  };
}

interface QuizHistoryListProps {
  onViewAttempt?: (attemptId: string, quiz: Quiz) => void;
  onRetakeQuiz?: (quizId: string) => void;
  onViewQuiz?: (quizId: string) => void;
  className?: string;
}

interface HistoryFilter {
  searchTerm: string;
  difficulty?: QuizDifficulty;
  minScore?: number;
  maxScore?: number;
  dateRange?: 'week' | 'month' | 'year' | 'all';
  sortBy: 'date' | 'score' | 'title';
  sortOrder: 'asc' | 'desc';
}

interface HistorySummary {
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  improvementTrend: 'improving' | 'declining' | 'stable';
  recentActivity: {
    thisWeek: number;
    thisMonth: number;
  };
  difficultyBreakdown: Record<QuizDifficulty, { attempts: number; averageScore: number }>;
}

export function QuizHistoryList({
  onViewAttempt,
  onRetakeQuiz,
  onViewQuiz,
  className
}: QuizHistoryListProps) {
  const [filter, setFilter] = useState<HistoryFilter>({
    searchTerm: '',
    sortBy: 'date',
    sortOrder: 'desc',
  });
  const [expandedAttempt, setExpandedAttempt] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch quiz history
  const {
    data: historyData,
    isLoading,
    error,
    refetch
  } = useGetQuizHistoryQuery();

  // Calculate summary statistics
  const summary = useMemo((): HistorySummary | null => {
    if (!historyData?.data?.attempts) return null;

    const attempts = historyData.data.attempts;
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Calculate improvement trend
    const recentAttempts = attempts.slice(0, 5);
    const olderAttempts = attempts.slice(5, 10);
    const recentAvg = recentAttempts.length > 0 
      ? recentAttempts.reduce((sum, a) => sum + a.score, 0) / recentAttempts.length 
      : 0;
    const olderAvg = olderAttempts.length > 0 
      ? olderAttempts.reduce((sum, a) => sum + a.score, 0) / olderAttempts.length 
      : recentAvg;

    let improvementTrend: 'improving' | 'declining' | 'stable' = 'stable';
    if (recentAvg > olderAvg + 5) improvementTrend = 'improving';
    else if (recentAvg < olderAvg - 5) improvementTrend = 'declining';

    // Calculate difficulty breakdown
    const difficultyBreakdown: Record<QuizDifficulty, { attempts: number; averageScore: number }> = {
      easy: { attempts: 0, averageScore: 0 },
      medium: { attempts: 0, averageScore: 0 },
      hard: { attempts: 0, averageScore: 0 },
    };

    attempts.forEach(attempt => {
      const difficulty = attempt.quiz.difficulty;
      difficultyBreakdown[difficulty].attempts++;
      difficultyBreakdown[difficulty].averageScore += attempt.score;
    });

    Object.keys(difficultyBreakdown).forEach(key => {
      const difficulty = key as QuizDifficulty;
      if (difficultyBreakdown[difficulty].attempts > 0) {
        difficultyBreakdown[difficulty].averageScore /= difficultyBreakdown[difficulty].attempts;
        difficultyBreakdown[difficulty].averageScore = Math.round(difficultyBreakdown[difficulty].averageScore);
      }
    });

    return {
      totalAttempts: attempts.length,
      averageScore: historyData.data.summary.averageScore,
      bestScore: Math.max(...attempts.map(a => a.score)),
      improvementTrend,
      recentActivity: {
        thisWeek: attempts.filter(a => new Date(a.completedAt) > oneWeekAgo).length,
        thisMonth: attempts.filter(a => new Date(a.completedAt) > oneMonthAgo).length,
      },
      difficultyBreakdown,
    };
  }, [historyData]);

  // Filter and sort attempts
  const filteredAttempts = useMemo(() => {
    if (!historyData?.data?.attempts) return [];

    let filtered = historyData.data.attempts.filter(attempt => {
      // Search term filter
      if (filter.searchTerm) {
        const searchLower = filter.searchTerm.toLowerCase();
        if (!attempt.quiz.title.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Difficulty filter
      if (filter.difficulty && attempt.quiz.difficulty !== filter.difficulty) {
        return false;
      }

      // Score range filter
      if (filter.minScore !== undefined && attempt.score < filter.minScore) {
        return false;
      }
      if (filter.maxScore !== undefined && attempt.score > filter.maxScore) {
        return false;
      }

      // Date range filter
      if (filter.dateRange && filter.dateRange !== 'all') {
        const attemptDate = new Date(attempt.completedAt);
        const now = new Date();
        let cutoffDate: Date;

        switch (filter.dateRange) {
          case 'week':
            cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case 'year':
            cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            break;
          default:
            cutoffDate = new Date(0);
        }

        if (attemptDate < cutoffDate) {
          return false;
        }
      }

      return true;
    });

    // Sort attempts
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filter.sortBy) {
        case 'date':
          comparison = new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime();
          break;
        case 'score':
          comparison = a.score - b.score;
          break;
        case 'title':
          comparison = a.quiz.title.localeCompare(b.quiz.title);
          break;
      }

      return filter.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [historyData, filter]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format date display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: QuizDifficulty): string => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
    }
  };

  // Get score color
  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 75) return 'text-blue-600 dark:text-blue-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Get performance icon
  const getPerformanceIcon = (score: number) => {
    if (score >= 90) return <Trophy className="h-4 w-4 text-yellow-500" />;
    if (score >= 75) return <Star className="h-4 w-4 text-blue-500" />;
    if (score >= 60) return <Target className="h-4 w-4 text-yellow-500" />;
    return <AlertCircle className="h-4 w-4 text-red-500" />;
  };

  // Get improvement trend icon
  const getTrendIcon = (trend: 'improving' | 'declining' | 'stable') => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable': return <BarChart3 className="h-4 w-4 text-blue-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-muted-foreground">Loading quiz history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorNotification
        title="Failed to Load Quiz History"
        message="Unable to fetch your quiz history. Please try again."
        onRetry={refetch}
      />
    );
  }

  if (!historyData?.data?.attempts || historyData.data.attempts.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Quiz History</h3>
          <p className="text-muted-foreground mb-4">
            You haven't taken any quizzes yet. Start by generating your first quiz!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Statistics */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Attempts</p>
                  <p className="text-2xl font-bold">{summary.totalAttempts}</p>
                </div>
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(summary.averageScore)}`}>
                    {summary.averageScore}%
                  </p>
                </div>
                <Award className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Best Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(summary.bestScore)}`}>
                    {summary.bestScore}%
                  </p>
                </div>
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Trend</p>
                  <p className="text-sm font-medium capitalize">
                    {summary.improvementTrend.replace('-', ' ')}
                  </p>
                </div>
                {getTrendIcon(summary.improvementTrend)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Quiz History</CardTitle>
              <CardDescription>
                Review your past quiz attempts and track your progress
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search quiz titles..."
                value={filter.searchTerm}
                onChange={(e) => setFilter(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="pl-10"
              />
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium mb-2 block">Difficulty</label>
                  <select
                    value={filter.difficulty || ''}
                    onChange={(e) => setFilter(prev => ({ 
                      ...prev, 
                      difficulty: e.target.value as QuizDifficulty || undefined 
                    }))}
                    className="w-full p-2 border rounded-md bg-background"
                  >
                    <option value="">All</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Min Score</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={filter.minScore || ''}
                    onChange={(e) => setFilter(prev => ({ 
                      ...prev, 
                      minScore: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Max Score</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={filter.maxScore || ''}
                    onChange={(e) => setFilter(prev => ({ 
                      ...prev, 
                      maxScore: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Date Range</label>
                  <select
                    value={filter.dateRange || 'all'}
                    onChange={(e) => setFilter(prev => ({ 
                      ...prev, 
                      dateRange: e.target.value as 'week' | 'month' | 'year' | 'all' 
                    }))}
                    className="w-full p-2 border rounded-md bg-background"
                  >
                    <option value="all">All Time</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Sort By</label>
                  <div className="flex gap-2">
                    <select
                      value={filter.sortBy}
                      onChange={(e) => setFilter(prev => ({ 
                        ...prev, 
                        sortBy: e.target.value as 'date' | 'score' | 'title' 
                      }))}
                      className="flex-1 p-2 border rounded-md bg-background"
                    >
                      <option value="date">Date</option>
                      <option value="score">Score</option>
                      <option value="title">Title</option>
                    </select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilter(prev => ({ 
                        ...prev, 
                        sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
                      }))}
                    >
                      {filter.sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              Showing {filteredAttempts.length} of {historyData.data.attempts.length} attempts
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quiz Attempts List */}
      <div className="space-y-4">
        {filteredAttempts.map((attempt) => (
          <Card key={attempt.id} className="transition-colors hover:bg-muted/50">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">{attempt.quiz.title}</CardTitle>
                    {getPerformanceIcon(attempt.score)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(attempt.completedAt)}
                    </span>
                    {attempt.timeTaken && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatTime(attempt.timeTaken)}
                      </span>
                    )}
                    <Badge className={getDifficultyColor(attempt.quiz.difficulty)}>
                      {attempt.quiz.difficulty}
                    </Badge>
                    <Badge variant="outline">
                      {attempt.quiz.questionCount} questions
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getScoreColor(attempt.score)}`}>
                    {attempt.score}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {Math.round((attempt.score / 100) * attempt.totalQuestions)}/{attempt.totalQuestions} correct
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewAttempt?.(attempt.id, {
                      id: attempt.quizId,
                      userId: attempt.userId,
                      title: attempt.quiz.title,
                      sourceDocumentIds: attempt.quiz.sourceDocumentIds,
                      questionCount: attempt.quiz.questionCount,
                      difficulty: attempt.quiz.difficulty,
                      questionTypes: attempt.quiz.questionTypes,
                      generationMethod: 'rag',
                      metadata: {} as any,
                      createdAt: attempt.completedAt,
                      updatedAt: attempt.completedAt,
                    })}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Review
                  </Button>
                  {onRetakeQuiz && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRetakeQuiz(attempt.quizId)}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Retake
                    </Button>
                  )}
                  {onViewQuiz && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewQuiz(attempt.quizId)}
                      className="flex items-center gap-2"
                    >
                      <BookOpen className="h-4 w-4" />
                      View Quiz
                    </Button>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedAttempt(
                    expandedAttempt === attempt.id ? null : attempt.id
                  )}
                >
                  {expandedAttempt === attempt.id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Expanded Details */}
              {expandedAttempt === attempt.id && (
                <div className="mt-4 pt-4 border-t space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium mb-2">Quiz Details</h4>
                      <div className="space-y-1 text-muted-foreground">
                        <p>Question Types: {attempt.quiz.questionTypes.join(', ')}</p>
                        <p>Documents: {attempt.quiz.sourceDocumentIds.length} source(s)</p>
                        <p>Completed: {new Date(attempt.completedAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Performance</h4>
                      <div className="space-y-1 text-muted-foreground">
                        <p>Score: {attempt.score}% ({Math.round((attempt.score / 100) * attempt.totalQuestions)}/{attempt.totalQuestions})</p>
                        {attempt.timeTaken && (
                          <p>Time: {formatTime(attempt.timeTaken)} ({Math.round(attempt.timeTaken / attempt.totalQuestions)}s per question)</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAttempts.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Search className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No quiz attempts match your current filters.
            </p>
            <Button
              variant="outline"
              onClick={() => setFilter({
                searchTerm: '',
                sortBy: 'date',
                sortOrder: 'desc',
              })}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}