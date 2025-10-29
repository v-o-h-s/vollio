"use client";

import React, { useState, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CreditCard,
  Clock,
  Search,
  Filter,
  Play,
  Bookmark,
  BookmarkCheck,
  Plus,
  Zap,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useFloatingSidebarIntegration } from "@/hooks/use-floating-sidebar";
import toast from "react-hot-toast";

// Flashcard interface
interface Flashcard {
  id: number;
  title: string;
  description: string;
  cards: number;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  lastStudied: string;
  masteryLevel: number; // 0-100
  dueForReview: number;
  tags: string[];
  createdAt: string;
  isBookmarked: boolean;
  studyStreak: number;
  averageScore: number;
}

// Categories and difficulties
const categories = [
  "All",
  "Mathematics",
  "Programming",
  "History",
  "Chemistry",
  "Computer Science",
  "Language",
  "Medicine",
  "Physics",
];

const difficulties = ["All", "Easy", "Medium", "Hard"];

// Dummy flashcard data
const dummyFlashcards: Flashcard[] = [
  {
    id: 1,
    title: "JavaScript ES6 Features",
    description: "Modern JavaScript features including arrow functions, destructuring, and async/await.",
    cards: 25,
    difficulty: "Medium",
    category: "Programming",
    lastStudied: "2024-01-15",
    masteryLevel: 78,
    dueForReview: 5,
    tags: ["javascript", "es6", "programming", "web-development"],
    createdAt: "2024-01-01",
    isBookmarked: true,
    studyStreak: 7,
    averageScore: 85,
  },
  {
    id: 2,
    title: "Calculus Derivatives",
    description: "Fundamental derivative rules and applications in calculus.",
    cards: 30,
    difficulty: "Hard",
    category: "Mathematics",
    lastStudied: "2024-01-10",
    masteryLevel: 92,
    dueForReview: 2,
    tags: ["calculus", "derivatives", "mathematics"],
    createdAt: "2024-01-05",
    isBookmarked: false,
    studyStreak: 12,
    averageScore: 91,
  },
  {
    id: 3,
    title: "Spanish Vocabulary - Food",
    description: "Essential Spanish vocabulary for food, cooking, and dining.",
    cards: 40,
    difficulty: "Easy",
    category: "Language",
    lastStudied: "Never",
    masteryLevel: 0,
    dueForReview: 40,
    tags: ["spanish", "vocabulary", "food", "language"],
    createdAt: "2024-01-08",
    isBookmarked: true,
    studyStreak: 0,
    averageScore: 0,
  },
  {
    id: 4,
    title: "Organic Chemistry Reactions",
    description: "Key organic chemistry reactions and mechanisms.",
    cards: 35,
    difficulty: "Hard",
    category: "Chemistry",
    lastStudied: "2024-01-12",
    masteryLevel: 65,
    dueForReview: 8,
    tags: ["organic-chemistry", "reactions", "mechanisms"],
    createdAt: "2024-01-03",
    isBookmarked: false,
    studyStreak: 4,
    averageScore: 72,
  },
];

// Utility functions
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
    Medicine: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
    Physics: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
  };
  return (
    colors[category as keyof typeof colors] ||
    "bg-gray-500/10 text-gray-700 dark:text-gray-400"
  );
};

const getMasteryColor = (level: number) => {
  if (level >= 80) return "text-green-600 dark:text-green-400";
  if (level >= 60) return "text-yellow-600 dark:text-yellow-400";
  if (level >= 40) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
};

export default function FlashcardsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarkedFlashcards, setBookmarkedFlashcards] = useState<Set<number>>(
    new Set(dummyFlashcards.filter((f) => f.isBookmarked).map((f) => f.id))
  );
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [showDueOnly, setShowDueOnly] = useState(false);
  
  // Refs for sidebar integration
  const searchInputRef = useRef<HTMLInputElement>(null);



  // Combined filtering logic
  const filteredFlashcards = useMemo(() => {
    return dummyFlashcards.filter((flashcard) => {
      const matchesCategory =
        selectedCategory === "All" || flashcard.category === selectedCategory;
      const matchesDifficulty =
        selectedDifficulty === "All" || flashcard.difficulty === selectedDifficulty;
      const matchesSearch =
        flashcard.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flashcard.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flashcard.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesBookmark = !showBookmarkedOnly || bookmarkedFlashcards.has(flashcard.id);
      const matchesDue = !showDueOnly || flashcard.dueForReview > 0;

      return matchesCategory && matchesDifficulty && matchesSearch && matchesBookmark && matchesDue;
    });
  }, [selectedCategory, selectedDifficulty, searchQuery, showBookmarkedOnly, showDueOnly, bookmarkedFlashcards]);

  const toggleBookmark = (flashcardId: number) => {
    setBookmarkedFlashcards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(flashcardId)) {
        newSet.delete(flashcardId);
      } else {
        newSet.add(flashcardId);
      }
      return newSet;
    });
  };

  // Integrate with floating sidebar
  useFloatingSidebarIntegration({
    searchFlashcards: () => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
        searchInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },
    filterCategory: () => {
      const currentIndex = categories.indexOf(selectedCategory);
      const nextIndex = (currentIndex + 1) % categories.length;
      setSelectedCategory(categories[nextIndex]);
      toast.success(`Category: ${categories[nextIndex]}`);
    },
    filterDifficulty: () => {
      const currentIndex = difficulties.indexOf(selectedDifficulty);
      const nextIndex = (currentIndex + 1) % difficulties.length;
      setSelectedDifficulty(difficulties[nextIndex]);
      toast.success(`Difficulty: ${difficulties[nextIndex]}`);
    },
    filterBookmarked: () => {
      setShowBookmarkedOnly(!showBookmarkedOnly);
      toast.success(showBookmarkedOnly ? 'Showing all flashcards' : 'Showing bookmarked only');
    },
    showDueCards: () => {
      setShowDueOnly(!showDueOnly);
      toast.success(showDueOnly ? 'Showing all flashcards' : 'Showing due cards only');
    },
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left space-y-4">
            <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              Flashcard Center
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Master any subject with spaced repetition flashcards. Create, study, and track your progress with intelligent review scheduling.
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/dashboard/flashcards/create">
              <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-6 py-3 group">
                <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
                Create Flashcards
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter Flashcards
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
                    placeholder="Search flashcards, descriptions, or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-border/50 focus:border-primary/50"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="lg:w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-border/50 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
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
                  className="w-full px-3 py-2 border border-border/50 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                >
                  {difficulties.map((difficulty) => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Filters */}
              <div className="flex gap-2">
                <Button
                  variant={showDueOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowDueOnly(!showDueOnly)}
                  className="whitespace-nowrap"
                >
                  <Zap className="w-4 h-4 mr-1" />
                  Due Only
                </Button>
                <Button
                  variant={showBookmarkedOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
                  className="whitespace-nowrap"
                >
                  <Bookmark className="w-4 h-4 mr-1" />
                  Bookmarked
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flashcard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFlashcards.map((flashcard) => (
            <Card
              key={flashcard.id}
              className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/20 hover:-translate-y-1"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
                      {flashcard.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {flashcard.description}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleBookmark(flashcard.id)}
                    className="ml-2 p-1 h-8 w-8 hover:scale-110 transition-transform duration-200"
                  >
                    {bookmarkedFlashcards.has(flashcard.id) ? (
                      <BookmarkCheck className="w-4 h-4 text-primary" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Flashcard Metadata */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CreditCard className="w-4 h-4" />
                    {flashcard.cards} cards
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {flashcard.dueForReview} due
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge className={getDifficultyColor(flashcard.difficulty)}>
                    {flashcard.difficulty}
                  </Badge>
                  <Badge className={getCategoryColor(flashcard.category)}>
                    {flashcard.category}
                  </Badge>
                  {flashcard.studyStreak > 0 && (
                    <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">
                      🔥 {flashcard.studyStreak} day streak
                    </Badge>
                  )}
                </div>

                {/* Mastery Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mastery Level</span>
                    <span className={`font-medium ${getMasteryColor(flashcard.masteryLevel)}`}>
                      {flashcard.masteryLevel}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${flashcard.masteryLevel}%` }}
                    />
                  </div>
                  {flashcard.lastStudied !== "Never" && (
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Last studied: {flashcard.lastStudied}</span>
                      <span>Avg: {flashcard.averageScore}%</span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {flashcard.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {flashcard.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{flashcard.tags.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Link href={`/dashboard/flashcards/study/${flashcard.id}`} className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 group">
                      <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                      {flashcard.dueForReview > 0 ? "Review" : "Study"}
                    </Button>
                  </Link>
                  {flashcard.lastStudied !== "Never" && (
                    <Button variant="outline" size="sm" className="hover:scale-105 transition-transform duration-200">
                      <TrendingUp className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredFlashcards.length === 0 && (
          <Card className="text-center py-12 border-border/50">
            <CardContent>
              <div className="animate-bounce mb-4">
                <CreditCard className="w-16 h-16 text-muted-foreground mx-auto" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No flashcards found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or create your first flashcard deck.
              </p>
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={() => {
                    setSelectedCategory("All");
                    setSelectedDifficulty("All");
                    setSearchQuery("");
                    setShowBookmarkedOnly(false);
                    setShowDueOnly(false);
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
                <Link href="/dashboard/flashcards/create">
                  <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Flashcards
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}