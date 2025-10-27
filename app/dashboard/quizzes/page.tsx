"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Clock,
  BookOpen,
  Trophy,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Star,
  Calendar,
  Users,
  Target,
  TrendingUp,
  Brain,
  Zap,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Dummy data for prototype
const dummyQuizzes = [
  {
    id: 1,
    title: "Advanced Calculus Concepts",
    description:
      "Test your understanding of limits, derivatives, and integrals",
    questions: 25,
    duration: 45,
    difficulty: "Hard",
    category: "Mathematics",
    lastAttempt: "2 days ago",
    bestScore: 85,
    attempts: 3,
    tags: ["Calculus", "Mathematics", "Advanced"],
    createdAt: "2024-01-15",
    isBookmarked: true,
    completionRate: 78,
    averageScore: 82,
  },
  {
    id: 2,
    title: "React Hooks Deep Dive",
    description: "Master useState, useEffect, and custom hooks",
    questions: 20,
    duration: 30,
    difficulty: "Medium",
    category: "Programming",
    lastAttempt: "1 week ago",
    bestScore: 92,
    attempts: 5,
    tags: ["React", "JavaScript", "Frontend"],
    createdAt: "2024-01-10",
    isBookmarked: false,
    completionRate: 95,
    averageScore: 88,
  },
  {
    id: 3,
    title: "World History Timeline",
    description: "Key events from ancient civilizations to modern times",
    questions: 30,
    duration: 60,
    difficulty: "Easy",
    category: "History",
    lastAttempt: "Never",
    bestScore: null,
    attempts: 0,
    tags: ["History", "Timeline", "World Events"],
    createdAt: "2024-01-20",
    isBookmarked: true,
    completionRate: 0,
    averageScore: 0,
  },
  {
    id: 4,
    title: "Organic Chemistry Reactions",
    description: "Mechanisms and products of organic reactions",
    questions: 35,
    duration: 50,
    difficulty: "Hard",
    category: "Chemistry",
    lastAttempt: "3 days ago",
    bestScore: 76,
    attempts: 2,
    tags: ["Chemistry", "Organic", "Reactions"],
    createdAt: "2024-01-12",
    isBookmarked: false,
    completionRate: 68,
    averageScore: 74,
  },
  {
    id: 5,
    title: "Machine Learning Fundamentals",
    description: "Basic concepts of ML algorithms and applications",
    questions: 28,
    duration: 40,
    difficulty: "Medium",
    category: "Computer Science",
    lastAttempt: "5 days ago",
    bestScore: 89,
    attempts: 4,
    tags: ["ML", "AI", "Algorithms"],
    createdAt: "2024-01-08",
    isBookmarked: true,
    completionRate: 85,
    averageScore: 86,
  },
  {
    id: 6,
    title: "Spanish Vocabulary Builder",
    description: "Essential Spanish words and phrases for beginners",
    questions: 40,
    duration: 25,
    difficulty: "Easy",
    category: "Language",
    lastAttempt: "Yesterday",
    bestScore: 94,
    attempts: 8,
    tags: ["Spanish", "Vocabulary", "Beginner"],
    createdAt: "2024-01-05",
    isBookmarked: false,
    completionRate: 92,
    averageScore: 91,
  },
];

const categories = [
  "All",
  "Mathematics",
  "Programming",
  "History",
  "Chemistry",
  "Computer Science",
  "Language",
];
const difficulties = ["All", "Easy", "Medium", "Hard"];

export default function QuizzesPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredQuizzes = dummyQuizzes.filter((quiz) => {
    const matchesCategory =
      selectedCategory === "All" || quiz.category === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === "All" || quiz.difficulty === selectedDifficulty;
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
      case "Medium":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
      case "Hard":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Mathematics":
        return <Target className="w-4 h-4" />;
      case "Programming":
        return <Brain className="w-4 h-4" />;
      case "History":
        return <BookOpen className="w-4 h-4" />;
      case "Chemistry":
        return <Zap className="w-4 h-4" />;
      case "Computer Science":
        return <Brain className="w-4 h-4" />;
      case "Language":
        return <Users className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Quiz Center
              </h1>
              <p className="text-muted-foreground">
                Test your knowledge and track your progress
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => router.push("/dashboard/quizzes/create")}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Quiz
              </Button>
              <Button variant="outline">
                <Trophy className="w-4 h-4 mr-2" />
                Leaderboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Total Quizzes
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {dummyQuizzes.length}
                  </p>
                </div>
                <div className="p-3 bg-blue-500 rounded-full">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">
                    Completed
                  </p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {dummyQuizzes.filter((q) => q.attempts > 0).length}
                  </p>
                </div>
                <div className="p-3 bg-green-500 rounded-full">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    Avg Score
                  </p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {Math.round(
                      dummyQuizzes.reduce((acc, q) => acc + q.averageScore, 0) /
                        dummyQuizzes.length
                    )}
                    %
                  </p>
                </div>
                <div className="p-3 bg-purple-500 rounded-full">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border-orange-200 dark:border-orange-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                    Study Streak
                  </p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    7 days
                  </p>
                </div>
                <div className="p-3 bg-orange-500 rounded-full">
                  <Award className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search quizzes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "transition-all duration-200",
                  selectedCategory === category &&
                    "bg-blue-500 hover:bg-blue-600"
                )}
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            {difficulties.map((difficulty) => (
              <Button
                key={difficulty}
                variant={
                  selectedDifficulty === difficulty ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSelectedDifficulty(difficulty)}
                className={cn(
                  "transition-all duration-200",
                  selectedDifficulty === difficulty &&
                    "bg-blue-500 hover:bg-blue-600"
                )}
              >
                {difficulty}
              </Button>
            ))}
          </div>
        </div>

        {/* Quiz Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <Card
              key={quiz.id}
              className="group hover:shadow-lg transition-all duration-300 border-border hover:border-blue-200 dark:hover:border-blue-800"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 mb-2">
                    {getCategoryIcon(quiz.category)}
                    <Badge variant="outline" className="text-xs">
                      {quiz.category}
                    </Badge>
                    {quiz.isBookmarked && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>

                <CardTitle className="text-lg leading-tight">
                  {quiz.title}
                </CardTitle>
                <CardDescription className="text-sm line-clamp-2">
                  {quiz.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-4">
                  {/* Quiz Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{quiz.questions} questions</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{quiz.duration}min</span>
                      </div>
                    </div>
                  </div>

                  {/* Difficulty and Score */}
                  <div className="flex items-center justify-between">
                    <Badge
                      className={cn(
                        "text-xs border",
                        getDifficultyColor(quiz.difficulty)
                      )}
                    >
                      {quiz.difficulty}
                    </Badge>
                    {quiz.bestScore && (
                      <div className="text-sm font-medium text-foreground">
                        Best: {quiz.bestScore}%
                      </div>
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
                    {quiz.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {quiz.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{quiz.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() =>
                        router.push(`/dashboard/quizzes/${quiz.id}`)
                      }
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {quiz.attempts > 0 ? "Retake" : "Start"}
                    </Button>
                    <Button variant="outline" size="icon">
                      <Star
                        className={cn(
                          "w-4 h-4",
                          quiz.isBookmarked && "text-yellow-500 fill-current"
                        )}
                      />
                    </Button>
                  </div>

                  {/* Last Attempt */}
                  {quiz.lastAttempt !== "Never" && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Last attempt: {quiz.lastAttempt}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredQuizzes.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No quizzes found
            </h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or create a new quiz.
            </p>
            <Button
              onClick={() => router.push("/dashboard/quizzes/create")}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Quiz
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
