"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Brain,
  Clock,
  Star,
  Search,
  Filter,
  Plus,
  RotateCcw,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
  SkipForward,
  SkipBack,
} from "lucide-react";

// Dummy flashcard data
const dummyFlashcards = [
  {
    id: 1,
    title: "JavaScript Fundamentals",
    description: "Core JavaScript concepts and syntax",
    cardCount: 25,
    category: "Programming",
    difficulty: "Medium",
    lastStudied: "2024-01-15",
    masteryLevel: 75,
    tags: ["JavaScript", "Web Development", "Frontend"],
    createdAt: "2024-01-10",
    isBookmarked: true,
    studySessions: 8,
    averageScore: 82,
  },
  {
    id: 2,
    title: "React Hooks",
    description: "Understanding useState, useEffect, and custom hooks",
    cardCount: 18,
    category: "Programming",
    difficulty: "Hard",
    lastStudied: "2024-01-14",
    masteryLevel: 60,
    tags: ["React", "Hooks", "Frontend"],
    createdAt: "2024-01-08",
    isBookmarked: false,
    studySessions: 5,
    averageScore: 78,
  },
  {
    id: 3,
    title: "Calculus Derivatives",
    description: "Rules and applications of derivatives",
    cardCount: 32,
    category: "Mathematics",
    difficulty: "Hard",
    lastStudied: "2024-01-12",
    masteryLevel: 45,
    tags: ["Calculus", "Derivatives", "Math"],
    createdAt: "2024-01-05",
    isBookmarked: true,
    studySessions: 12,
    averageScore: 65,
  },
  {
    id: 4,
    title: "Spanish Vocabulary",
    description: "Common Spanish words and phrases",
    cardCount: 50,
    category: "Language",
    difficulty: "Easy",
    lastStudied: "2024-01-16",
    masteryLevel: 90,
    tags: ["Spanish", "Vocabulary", "Language Learning"],
    createdAt: "2024-01-01",
    isBookmarked: false,
    studySessions: 20,
    averageScore: 88,
  },
  {
    id: 5,
    title: "Chemistry Elements",
    description: "Periodic table elements and properties",
    cardCount: 40,
    category: "Chemistry",
    difficulty: "Medium",
    lastStudied: "2024-01-13",
    masteryLevel: 70,
    tags: ["Chemistry", "Elements", "Science"],
    createdAt: "2024-01-03",
    isBookmarked: true,
    studySessions: 15,
    averageScore: 75,
  },
  {
    id: 6,
    title: "World History Timeline",
    description: "Major historical events and dates",
    cardCount: 35,
    category: "History",
    difficulty: "Medium",
    lastStudied: "2024-01-11",
    masteryLevel: 55,
    tags: ["History", "Timeline", "Events"],
    createdAt: "2024-01-02",
    isBookmarked: false,
    studySessions: 6,
    averageScore: 70,
  },
];

const categories = [
  "All",
  "Programming",
  "Mathematics",
  "Language",
  "Chemistry",
  "History",
];
const difficulties = ["All", "Easy", "Medium", "Hard"];

export default function FlashcardsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  // Filter flashcards based on search and filters
  const filteredFlashcards = dummyFlashcards.filter((deck) => {
    const matchesCategory =
      selectedCategory === "All" || deck.category === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === "All" || deck.difficulty === selectedDifficulty;
    const matchesSearch =
      deck.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deck.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deck.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  // Calculate statistics
  const totalDecks = dummyFlashcards.length;
  const totalCards = dummyFlashcards.reduce(
    (sum, deck) => sum + deck.cardCount,
    0
  );
  const averageMastery = Math.round(
    dummyFlashcards.reduce((sum, deck) => sum + deck.masteryLevel, 0) /
      totalDecks
  );
  const studyStreak = 7; // Mock study streak

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

  const getMasteryColor = (mastery: number) => {
    if (mastery >= 80) return "bg-green-500";
    if (mastery >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Flashcards
          </h1>
          <p className="text-muted-foreground">
            Study with spaced repetition and track your progress
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Total Decks
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {totalDecks}
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
                    Total Cards
                  </p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {totalCards}
                  </p>
                </div>
                <div className="p-3 bg-green-500 rounded-full">
                  <Brain className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    Avg Mastery
                  </p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {averageMastery}%
                  </p>
                </div>
                <div className="p-3 bg-purple-500 rounded-full">
                  <Star className="w-6 h-6 text-white" />
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
                    {studyStreak} days
                  </p>
                </div>
                <div className="p-3 bg-orange-500 rounded-full">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search flashcard decks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              {difficulties.map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {difficulty}
                </option>
              ))}
            </select>

            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Deck
            </Button>
          </div>
        </div>

        {/* Flashcard Decks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFlashcards.map((deck) => (
            <Card
              key={deck.id}
              className="group hover:shadow-lg transition-all duration-300 border-border"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {deck.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {deck.description}
                    </p>
                  </div>
                  {deck.isBookmarked && (
                    <Star className="w-4 h-4 text-yellow-500 fill-current ml-2 flex-shrink-0" />
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Deck Stats */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{deck.cardCount} cards</span>
                  <span>{deck.studySessions} sessions</span>
                </div>

                {/* Mastery Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Mastery</span>
                    <span className="font-medium text-foreground">
                      {deck.masteryLevel}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getMasteryColor(
                        deck.masteryLevel
                      )}`}
                      style={{ width: `${deck.masteryLevel}%` }}
                    />
                  </div>
                </div>

                {/* Category and Difficulty */}
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {deck.category}
                  </Badge>
                  <Badge
                    className={`text-xs border ${getDifficultyColor(
                      deck.difficulty
                    )}`}
                  >
                    {deck.difficulty}
                  </Badge>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {deck.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {deck.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{deck.tags.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Last Studied */}
                <p className="text-xs text-muted-foreground">
                  Last studied:{" "}
                  {new Date(deck.lastStudied).toLocaleDateString()}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Study
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredFlashcards.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No flashcard decks found
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ||
              selectedCategory !== "All" ||
              selectedDifficulty !== "All"
                ? "Try adjusting your search or filters"
                : "Create your first flashcard deck to get started"}
            </p>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create New Deck
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
    