"use client";

import React, { useState, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Clock,
  Trophy,
  Target,
  Search,
  Filter,
  Star,
  Play,
  RotateCcw,
  Bookmark,
  BookmarkCheck,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useFloatingSidebarIntegration } from "@/hooks/use-floating-sidebar";
import toast from "react-hot-toast";

// Quiz interface matching the steering rules
interface Quiz {
  id: number;
  title: string;
  description: string;
  questions: number;
  duration: number; // in minutes
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  lastAttempt: string;
  bestScore: number | null;
  attempts: number;
  tags: string[];
  createdAt: string;
  isBookmarked: boolean;
  completionRate: number;
  averageScore: number;
}

// Categories and difficulties from steering rules
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

// Dummy quiz data matching the comprehensive structure
const dummyQuizzes: Quiz[] = [
  {
    id: 1,
    title: "JavaScript Fundamentals",
    description:
      "Master the core concepts of JavaScript programming including variables, functions, and control structures.",
    questions: 15,
    duration: 20,
    difficulty: "Easy",
    category: "Programming",
    lastAttempt: "2024-01-15",
    bestScore: 85,
    attempts: 3,
    tags: ["javascript", "programming", "web-development"],
    createdAt: "2024-01-01",
    isBookmarked: true,
    completionRate: 78,
    averageScore: 82,
  },
  {
    id: 2,
    title: "Advanced React Patterns",
    description:
      "Explore advanced React concepts including hooks, context, and performance optimization techniques.",
    questions: 25,
    duration: 35,
    difficulty: "Hard",
    category: "Programming",
    lastAttempt: "2024-01-10",
    bestScore: 92,
    attempts: 2,
    tags: ["react", "hooks", "performance", "advanced"],
    createdAt: "2024-01-05",
    isBookmarked: false,
    completionRate: 65,
    averageScore: 88,
  },
  {
    id: 3,
    title: "Linear Algebra Basics",
    description:
      "Introduction to vectors, matrices, and linear transformations with practical applications.",
    questions: 20,
    duration: 30,
    difficulty: "Medium",
    category: "Mathematics",
    lastAttempt: "Never",
    bestScore: null,
    attempts: 0,
    tags: ["linear-algebra", "vectors", "matrices"],
    createdAt: "2024-01-08",
    isBookmarked: true,
    completionRate: 0,
    averageScore: 0,
  },
  {
    id: 4,
    title: "World War II History",
    description:
      "Comprehensive overview of major events, battles, and consequences of World War II.",
    questions: 30,
    duration: 45,
    difficulty: "Medium",
    category: "History",
    lastAttempt: "2024-01-12",
    bestScore: 78,
    attempts: 1,
    tags: ["world-war-2", "history", "20th-century"],
    createdAt: "2024-01-03",
    isBookmarked: false,
    completionRate: 45,
    averageScore: 78,
  },
  {
    id: 5,
    title: "Organic Chemistry Reactions",
    description:
      "Study of organic reaction mechanisms, synthesis pathways, and molecular structures.",
    questions: 18,
    duration: 25,
    difficulty: "Hard",
    category: "Chemistry",
    lastAttempt: "Never",
    bestScore: null,
    attempts: 0,
    tags: ["organic-chemistry", "reactions", "synthesis"],
    createdAt: "2024-01-06",
    isBookmarked: false,
    completionRate: 0,
    averageScore: 0,
  },
  {
    id: 6,
    title: "Data Structures & Algorithms",
    description:
      "Essential data structures and algorithmic thinking for computer science fundamentals.",
    questions: 22,
    duration: 40,
    difficulty: "Medium",
    category: "Computer Science",
    lastAttempt: "2024-01-14",
    bestScore: 88,
    attempts: 4,
    tags: ["algorithms", "data-structures", "computer-science"],
    createdAt: "2024-01-02",
    isBookmarked: true,
    completionRate: 82,
    averageScore: 85,
  },
];

// Utility functions from steering rules
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

const getCategoryColor = (category: string) => {
  const colors = {
    Programming: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    Mathematics: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
    History: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    Chemistry: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    "Computer Science": "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
    Language: "bg-pink-500/10 text-pink-700 dark:text-pink-400",
  };
  return (
    colors[category as keyof typeof colors] ||
    "bg-gray-500/10 text-gray-700 dark:text-gray-400"
  );
};

export default function QuizzesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarkedQuizzes, setBookmarkedQuizzes] = useState<Set<number>>(
    new Set(dummyQuizzes.filter((q) => q.isBookmarked).map((q) => q.id))
  );
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [showStatsExpanded, setShowStatsExpanded] = useState(false);
  
  // Refs for sidebar integration
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Statistics calculations
  const stats = useMemo(() => {
    const totalQuizzes = dummyQuizzes.length;
    const completedQuizzes = dummyQuizzes.filter((q) => q.attempts > 0).length;
    const averageScore =
      dummyQuizzes
        .filter((q) => q.bestScore !== null)
        .reduce((sum, q) => sum + (q.bestScore || 0), 0) /
      (dummyQuizzes.filter((q) => q.bestScore !== null).length || 1);
    const studyStreak = 7; // Mock data

    return {
      totalQuizzes,
      completedQuizzes,
      averageScore: Math.round(averageScore),
      studyStreak,
    };
  }, []);

  // Combined filtering logic from steering rules
  const filteredQuizzes = useMemo(() => {
    return dummyQuizzes.filter((quiz) => {
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
      const matchesBookmark = !showBookmarkedOnly || bookmarkedQuizzes.has(quiz.id);

      return matchesCategory && matchesDifficulty && matchesSearch && matchesBookmark;
    });
  }, [selectedCategory, selectedDifficulty, searchQuery, showBookmarkedOnly, bookmarkedQuizzes]);

  const toggleBookmark = (quizId: number) => {
    setBookmarkedQuizzes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(quizId)) {
        newSet.delete(quizId);
      } else {
        newSet.add(quizId);
      }
      return newSet;
    });
  };

  // Integrate with floating sidebar
  useFloatingSidebarIntegration({
    searchQuizzes: () => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
        searchInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },
    filterCategory: () => {
      // Cycle through categories
      const currentIndex = categories.indexOf(selectedCategory);
      const nextIndex = (currentIndex + 1) % categories.length;
      setSelectedCategory(categories[nextIndex]);
      toast.success(`Category: ${categories[nextIndex]}`);
    },
    filterDifficulty: () => {
      // Cycle through difficulties
      const currentIndex = difficulties.indexOf(selectedDifficulty);
      const nextIndex = (currentIndex + 1) % difficulties.length;
      setSelectedDifficulty(difficulties[nextIndex]);
      toast.success(`Difficulty: ${difficulties[nextIndex]}`);
    },
    filterBookmarked: () => {
      setShowBookmarkedOnly(!showBookmarkedOnly);
      toast.success(showBookmarkedOnly ? 'Showing all quizzes' : 'Showing bookmarked only');
    },
    showQuizStats: () => {
      setShowStatsExpanded(!showStatsExpanded);
      toast.success(showStatsExpanded ? 'Stats collapsed' : 'Stats expanded');
    },
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left space-y-4">
            <h1 className="text-4xl font-bold text-foreground">Quiz Center</h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Test your knowledge with our comprehensive collection of
              interactive quizzes. Track your progress and master new subjects.
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/dashboard/quizzes/create">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3">
                <Plus className="w-4 h-4 mr-2" />
                Create Quiz
              </Button>
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Total Quizzes
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {stats.totalQuizzes}
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
                    {stats.completedQuizzes}
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
                    Average Score
                  </p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {stats.averageScore}%
                  </p>
                </div>
                <div className="p-3 bg-purple-500 rounded-full">
                  <Target className="w-6 h-6 text-white" />
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
                    {stats.studyStreak} days
                  </p>
                </div>
                <div className="p-3 bg-orange-500 rounded-full">
                  <Star className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter Quizzes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    ref={searchInputRef}
                    placeholder="Search quizzes, descriptions, or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="lg:w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div className="lg:w-32">
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {difficulties.map((difficulty) => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <Card
              key={quiz.id}
              className="group hover:shadow-lg transition-all duration-300 border-border"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
                      {quiz.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {quiz.description}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleBookmark(quiz.id)}
                    className="ml-2 p-1 h-8 w-8"
                  >
                    {bookmarkedQuizzes.has(quiz.id) ? (
                      <BookmarkCheck className="w-4 h-4 text-primary" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Quiz Metadata */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {quiz.questions} questions
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {quiz.duration} min
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge className={getDifficultyColor(quiz.difficulty)}>
                    {quiz.difficulty}
                  </Badge>
                  <Badge className={getCategoryColor(quiz.category)}>
                    {quiz.category}
                  </Badge>
                </div>

                {/* Progress and Score */}
                {quiz.attempts > 0 ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {quiz.completionRate}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${quiz.completionRate}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Best Score: {quiz.bestScore}%
                      </span>
                      <span className="text-muted-foreground">
                        {quiz.attempts} attempts
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Not started yet
                    </p>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-gray-300 h-2 rounded-full w-0" />
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {quiz.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {quiz.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{quiz.tags.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                    <Play className="w-4 h-4 mr-2" />
                    {quiz.attempts > 0 ? "Continue" : "Start Quiz"}
                  </Button>
                  {quiz.attempts > 0 && (
                    <Button variant="outline" size="sm">
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredQuizzes.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No quizzes found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or search terms to find more quizzes.
              </p>
              <Button
                onClick={() => {
                  setSelectedCategory("All");
                  setSelectedDifficulty("All");
                  setSearchQuery("");
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
