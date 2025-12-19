"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  BookOpen,
  Bookmark,
  Plus,
  Clock,
  BarChart,
  Globe,
  MoreVertical,
  Search,
  Filter,
  Brain,
  Layers,
  GraduationCap
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Section = "quizzes" | "flashcards";

interface QuizItem {
  id: string;
  title: string;
  description?: string;
  questions: number;
  documentName?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  language: "en" | "fr" | "ar";
  createdAt: string;
  timeEstimate?: number; // in minutes
}

interface FlashcardSet {
  id: string;
  title: string;
  cards: number;
  category?: string;
  documentName?: string;
  createdAt: string;
  mastery?: number; // percentage
}

const sampleQuizzes: QuizItem[] = [
  { id: "q1", title: "Biology Basics", description: "Cells, DNA, and systems", questions: 10, documentName: "BiologyNotes.pdf", difficulty: "Easy", language: "en", createdAt: "2025-01-01", timeEstimate: 15 },
  { id: "q2", title: "Intro to JavaScript", description: "ES6, scope and async foundations", questions: 12, documentName: "JS-Guide.pdf", difficulty: "Medium", language: "en", createdAt: "2025-02-03", timeEstimate: 20 },
  { id: "q3", title: "French Basics", description: "Common verbs and vocabulary", questions: 8, documentName: "FrenchNotes.pdf", difficulty: "Easy", language: "fr", createdAt: "2025-04-12", timeEstimate: 10 },
  { id: "q4", title: "Advanced Calculus", description: "Derivatives and Integrals of complex functions", questions: 15, documentName: "Calculus.pdf", difficulty: "Hard", language: "en", createdAt: "2025-05-15", timeEstimate: 45 },
];

const sampleFlashcards: FlashcardSet[] = [
  { id: "f1", title: "Spanish - Food", cards: 40, category: "Language", documentName: "SpanishNotes.pdf", createdAt: "2025-03-10", mastery: 45 },
  { id: "f2", title: "Calculus - Derivatives", cards: 30, category: "Mathematics", documentName: "CalculusBook.pdf", createdAt: "2025-02-25", mastery: 10 },
  { id: "f3", title: "World History Timeline", cards: 55, category: "History", documentName: "History.pdf", createdAt: "2025-03-01", mastery: 75 },
];

export default function KnowledgeTestPage() {
  const [section, setSection] = React.useState<Section>("quizzes");
  const [query, setQuery] = React.useState("");
  const [selectedDocument, setSelectedDocument] = React.useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<string>("all");
  const [selectedLanguage, setSelectedLanguage] = React.useState<string>("all");

  const availableDocuments = React.useMemo(() => {
    const docs = new Set<string>();
    sampleQuizzes.forEach((q) => q.documentName && docs.add(q.documentName));
    sampleFlashcards.forEach((f) => f.documentName && docs.add(f.documentName));
    return Array.from(docs);
  }, []);

  const quizzes = React.useMemo(
    () =>
      sampleQuizzes.filter((q) => {
        const matchesQuery = q.title.toLowerCase().includes(query.toLowerCase()) || (q.description || "").toLowerCase().includes(query.toLowerCase());
        const matchesDocument = selectedDocument === "all" || q.documentName === selectedDocument;
        const matchesDifficulty = selectedDifficulty === "all" || q.difficulty === selectedDifficulty;
        const matchesLanguage = selectedLanguage === "all" || q.language === selectedLanguage;
        return matchesQuery && matchesDocument && matchesDifficulty && matchesLanguage;
      }),
    [query, selectedDocument, selectedDifficulty, selectedLanguage]
  );

  const flashcards = React.useMemo(
    () =>
      sampleFlashcards.filter((f) => {
        const matchesQuery = f.title.toLowerCase().includes(query.toLowerCase());
        const matchesDocument = selectedDocument === "all" || f.documentName === selectedDocument;
        return matchesQuery && matchesDocument;
      }),
    [query, selectedDocument]
  );

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "Easy": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "Medium": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Hard": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6 container mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-linear-to-br ${section === "quizzes" ? "from-purple-500 to-indigo-500" : "from-pink-500 to-rose-500"} text-white transition-colors duration-500`}>
              {section === "quizzes" ? <Brain className="w-6 h-6" /> : <Layers className="w-6 h-6" />}
            </div>
            {section === "quizzes" ? "Knowledge Quizzes" : "Flashcard Decks"}
          </h1>
          <p className="text-muted-foreground mt-1 ml-14">
            {section === "quizzes" ? "Test your understanding with AI-generated quizzes." : "Master topics through spaced repetition and active recall."}
          </p>
        </div>
        <div className="flex gap-2">
            <Link href={section === "quizzes" ? "/dashboard/quizzes/create" : "/dashboard/flashcards/create"}>
              <Button className={`bg-linear-to-r ${section === "quizzes" ? "from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700" : "from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"} text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 duration-200`}>
                <Plus className="w-4 h-4 mr-2" />
                {section === 'quizzes' ? 'Create New Quiz' : 'Create New Deck'}
              </Button>
            </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar / Filters */}
        <aside className="col-span-1 lg:col-span-3 space-y-6">
          <Card className="border-border/50 shadow-sm bg-card/40 backdrop-blur-sm sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                Navigate & Filter
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2 p-1 bg-muted/50 rounded-lg">
                <Button 
                  variant={section === "quizzes" ? "secondary" : "ghost"} 
                  onClick={() => setSection("quizzes")} 
                  className={`justify-start ${section === 'quizzes' ? 'bg-background shadow-xs' : ''}`}
                >
                  <Brain className={`w-4 h-4 mr-2 ${section === 'quizzes' ? 'text-purple-500' : 'text-muted-foreground'}`} /> 
                  Quizzes
                  <Badge variant="secondary" className="ml-auto text-[10px] h-5 min-w-5 flex items-center justify-center">{sampleQuizzes.length}</Badge>
                </Button>
                <Button 
                  variant={section === "flashcards" ? "secondary" : "ghost"} 
                  onClick={() => setSection("flashcards")} 
                  className={`justify-start ${section === 'flashcards' ? 'bg-background shadow-xs' : ''}`}
                >
                  <Layers className={`w-4 h-4 mr-2 ${section === 'flashcards' ? 'text-pink-500' : 'text-muted-foreground'}`} /> 
                  Flashcards
                  <Badge variant="secondary" className="ml-auto text-[10px] h-5 min-w-5 flex items-center justify-center">{sampleFlashcards.length}</Badge>
                </Button>
              </div>

              <div className="space-y-3 pt-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search..." 
                    className="pl-9 bg-background/50" 
                    value={query} 
                    onChange={(e) => setQuery(e.target.value)} 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Source Document</label>
                  <select 
                    value={selectedDocument} 
                    onChange={(e) => setSelectedDocument(e.target.value)} 
                    className="w-full px-3 py-2 text-sm border border-border/50 rounded-md bg-background/50 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="all">All Documents</option>
                    {availableDocuments.map((doc) => (
                      <option key={doc} value={doc}>{doc}</option>
                    ))}
                  </select>
                </div>

                {section === "quizzes" && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Difficulty</label>
                      <select 
                        value={selectedDifficulty} 
                        onChange={(e) => setSelectedDifficulty(e.target.value)} 
                        className="w-full px-3 py-2 text-sm border border-border/50 rounded-md bg-background/50 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="all">Any Difficulty</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                     <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Language</label>
                      <select 
                        value={selectedLanguage} 
                        onChange={(e) => setSelectedLanguage(e.target.value)} 
                        className="w-full px-3 py-2 text-sm border border-border/50 rounded-md bg-background/50 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="all">Any Language</option>
                        <option value="en">English</option>
                        <option value="fr">French</option>
                        <option value="ar">Arabic</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content Grid */}
        <main className="col-span-1 lg:col-span-9">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Create New Card (Placeholder for quick access) */}
            <Link href={section === "quizzes" ? "/dashboard/quizzes/create" : "/dashboard/flashcards/create"}>
              <Card className="h-full border-2 border-dashed border-muted-foreground/20 bg-muted/5 hover:bg-muted/10 hover:border-primary/50 transition-all cursor-pointer flex flex-col items-center justify-center p-6 min-h-[220px] group">
                  <div className={`p-4 rounded-full mb-4 group-hover:scale-110 transition-transform ${section === "quizzes" ? "bg-purple-100 text-purple-600 dark:bg-purple-900/20" : "bg-pink-100 text-pink-600 dark:bg-pink-900/20"}`}>
                    <Plus className="w-8 h-8" />
                  </div>
                  <h3 className="font-medium text-lg">Create New</h3>
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    {section === "quizzes" ? "Generate a new quiz from your notes" : "Build a new flashcard deck"}
                  </p>
              </Card>
            </Link>

            {/* Quiz Cards */}
            {section === "quizzes" && quizzes.map((q) => (
               <Card key={q.id} className="flex flex-col border-border/50 hover:border-primary/50 shadow-xs hover:shadow-md transition-all duration-300 group overflow-hidden">
                  <div className="h-2 w-full bg-linear-to-r from-purple-500 to-indigo-500" />
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <Badge variant="outline" className={`${getDifficultyColor(q.difficulty)} border-none mb-2`}>
                        {q.difficulty}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">{q.title}</CardTitle>
                    <CardDescription className="line-clamp-2 text-xs mt-1 h-8">
                       {q.description || "No description provided."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="py-2 grow">
                    <div className="flex flex-wrap gap-y-2 gap-x-4 text-xs text-muted-foreground mt-2">
                       <div className="flex items-center gap-1">
                         <BookOpen className="w-3.5 h-3.5" />
                         <span className="truncate max-w-[100px]">{q.documentName || "No Source"}</span>
                       </div>
                       <div className="flex items-center gap-1">
                         <Globe className="w-3.5 h-3.5" />
                         <span>{q.language.toUpperCase()}</span>
                       </div>
                       <div className="flex items-center gap-1">
                         <Clock className="w-3.5 h-3.5" />
                         <span>~{q.timeEstimate}m</span>
                       </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 pb-4">
                    <div className="w-full flex items-center justify-between">
                       <span className="text-sm font-medium">{q.questions} Questions</span>
                       <Link href={`/dashboard/quizzes/${q.id}`}>
                        <Button size="sm" className="rounded-full bg-purple-600 hover:bg-purple-700 text-white">
                          Start <Play className="w-3 h-3 ml-1 fill-current" />
                        </Button>
                       </Link>
                    </div>
                  </CardFooter>
               </Card>
            ))}

             {/* Flashcard Cards */}
             {section === "flashcards" && flashcards.map((f) => (
               <Card key={f.id} className="flex flex-col border-border/50 hover:border-pink-500/50 shadow-xs hover:shadow-md transition-all duration-300 group overflow-hidden">
                  <div className="h-2 w-full bg-linear-to-r from-pink-500 to-rose-500" />
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <Badge variant="outline" className="bg-pink-50 text-pink-700 dark:bg-pink-900/20 dark:text-pink-300 border-none mb-2">
                        {f.category || "General"}
                      </Badge>
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardTitle className="text-lg leading-tight group-hover:text-pink-600 transition-colors">{f.title}</CardTitle>
                    <CardDescription className="line-clamp-1 text-xs mt-1">
                       Based on {f.documentName || "Manual input"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="py-2 grow">
                     <div className="mt-2 space-y-2">
                       <div className="flex justify-between text-xs mb-1">
                         <span className="text-muted-foreground">Mastery</span>
                         <span className="font-medium">{f.mastery ?? 0}%</span>
                       </div>
                       <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                         <div 
                            className="h-full bg-pink-500 rounded-full transition-all duration-1000" 
                            style={{ width: `${f.mastery ?? 0}%` }}
                         />
                       </div>
                     </div>
                  </CardContent>
                  <CardFooter className="pt-2 pb-4">
                    <div className="w-full flex items-center justify-between">
                       <span className="text-sm font-medium flex items-center gap-1">
                         <Layers className="w-4 h-4 text-muted-foreground" />
                         {f.cards} Cards
                       </span>
                       <Link href={`/dashboard/flashcards/study/${f.id}`}>
                        <Button size="sm" variant="outline" className="rounded-full border-pink-200 hover:border-pink-300 hover:bg-pink-50 dark:border-pink-800 dark:hover:bg-pink-900/30 text-pink-600 dark:text-pink-400">
                          Study <GraduationCap className="w-4 h-4 ml-1" />
                        </Button>
                       </Link>
                    </div>
                  </CardFooter>
               </Card>
            ))}

            {/* Empty States */}
            {section === "quizzes" && quizzes.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center p-12 text-center border rounded-xl border-dashed bg-muted/30">
                <Brain className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">No quizzes found</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  Try adjusting your filters or create a new quiz to get started playing.
                </p>
              </div>
            )}
             {section === "flashcards" && flashcards.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center p-12 text-center border rounded-xl border-dashed bg-muted/30">
                <Layers className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">No flashcards found</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  Try adjusting your filters or create a new deck to get started studying.
                </p>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
