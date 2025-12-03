"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  BookOpen, 
  Trophy, 
  TrendingUp,
  Calendar,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizStatsCardProps {
  quiz: {
    id: number;
    title: string;
    description: string;
    questions: number;
    duration: number;
    difficulty: string;
    category: string;
    lastAttempt: string;
    bestScore: number | null;
    attempts: number;
    tags: string[];
    isBookmarked: boolean;
    completionRate: number;
    averageScore: number;
  };
  onStart: () => void;
  onBookmark: () => void;
}

export function QuizStatsCard({ quiz, onStart, onBookmark }: QuizStatsCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
      case "Medium": return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
      case "Hard": return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
      default: return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 dark:text-green-400";
    if (score >= 70) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border hover:border-blue-200 dark:hover:border-blue-800">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  {quiz.category}
                </Badge>
                {quiz.isBookmarked && (
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                )}
              </div>
              <h3 className="font-semibold text-lg leading-tight mb-1 truncate">
                {quiz.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {quiz.description}
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span className="text-muted-foreground">{quiz.questions} questions</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-500" />
              <span className="text-muted-foreground">{quiz.duration}min</span>
            </div>
            {quiz.bestScore && (
              <>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className={cn("font-medium", getScoreColor(quiz.bestScore))}>
                    Best: {quiz.bestScore}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  <span className="text-muted-foreground">
                    Avg: {quiz.averageScore}%
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Difficulty Badge */}
          <div className="flex items-center justify-between">
            <Badge className={cn("text-xs border", getDifficultyColor(quiz.difficulty))}>
              {quiz.difficulty}
            </Badge>
            {quiz.attempts > 0 && (
              <span className="text-xs text-muted-foreground">
                {quiz.attempts} attempt{quiz.attempts !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Progress Bar */}
          {quiz.attempts > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{quiz.completionRate}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${quiz.completionRate}%` }}
                />
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {quiz.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {quiz.tags.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{quiz.tags.length - 2}
              </Badge>
            )}
          </div>

          {/* Last Attempt */}
          {quiz.lastAttempt !== "Never" && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Last: {quiz.lastAttempt}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}