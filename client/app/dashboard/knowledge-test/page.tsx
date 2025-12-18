"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Play, BookOpen, Bookmark, Plus } from "lucide-react";

type Section = "quizzes" | "flashcards";

interface QuizItem {
  id: string;
  title: string;
  description?: string;
  questions: number;
  documentName?: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  language?: "en" | "fr" | "ar";
  createdAt: string;
}

interface FlashcardSet {
  id: string;
  title: string;
  cards: number;
  category?: string;
  documentName?: string;
  createdAt: string;
}

const sampleQuizzes: QuizItem[] = [
  { id: "q1", title: "Biology Basics", description: "Cells, DNA, and systems", questions: 10, documentName: "BiologyNotes.pdf", difficulty: "Easy", language: "en", createdAt: "2025-01-01" },
  { id: "q2", title: "Intro to JavaScript", description: "ES6, scope and async", questions: 12, documentName: "JS-Guide.pdf", difficulty: "Medium", language: "en", createdAt: "2025-02-03" },
  { id: "q3", title: "French Basics", description: "Common verbs and vocabulary", questions: 8, documentName: "FrenchNotes.pdf", difficulty: "Easy", language: "fr", createdAt: "2025-04-12" },
];

const sampleFlashcards: FlashcardSet[] = [
  { id: "f1", title: "Spanish - Food", cards: 40, category: "Language", documentName: "SpanishNotes.pdf", createdAt: "2025-03-10" },
  { id: "f2", title: "Calculus - Derivatives", cards: 30, category: "Mathematics", documentName: "CalculusBook.pdf", createdAt: "2025-02-25" },
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

  return (
    <div className="space-y-6 container mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 ">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className="col-span-1 sticky top-6">
          <Card className="space-y-4 p-4 bg-card/30">
            <CardHeader>
              <CardTitle className="text-lg">Knowledge Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col gap-2">
                <Button variant={section === "quizzes" ? "default" : "ghost"} onClick={() => setSection("quizzes")} className="justify-start">
                  <BookOpen className="w-4 h-4 mr-2" /> Quizzes
                </Button>
                <Button variant={section === "flashcards" ? "default" : "ghost"} onClick={() => setSection("flashcards")} className="justify-start">
                  <Bookmark className="w-4 h-4 mr-2" /> Flashcards
                </Button>
              </div>

              <div className="pt-4 border-t border-border">
                <Input placeholder={section === "quizzes" ? "Search quizzes..." : "Search flashcards..."} value={query} onChange={(e) => setQuery(e.target.value)} />
                {section === "quizzes" && (
                  <div className="mt-3 space-y-2">
                    <select value={selectedDocument} onChange={(e) => setSelectedDocument(e.target.value)} className="w-full px-3 py-2 border border-border/50 rounded-md bg-background text-foreground">
                      <option value="all">All documents</option>
                      {availableDocuments.map((doc) => (
                        <option key={doc} value={doc}>
                          {doc}
                        </option>
                      ))}
                    </select>

                    <div className="flex gap-2">
                      <select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)} className="flex-1 px-3 py-2 border border-border/50 rounded-md bg-background text-foreground">
                        <option value="all">All difficulties</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                      <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} className="w-28 px-3 py-2 border border-border/50 rounded-md bg-background text-foreground">
                        <option value="all">Any</option>
                        <option value="en">EN</option>
                        <option value="fr">FR</option>
                        <option value="ar">AR</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4">
                {section === "quizzes" ? (
                  <Link href="/dashboard/quizzes/create">
                    <Button className="w-full" variant="secondary">
                      <Plus className="w-4 h-4 mr-2" />Create Quiz
                    </Button>
                  </Link>
                ) : (
                  <Link href="/dashboard/flashcards/create">
                    <Button className="w-full" variant="secondary">
                      <Plus className="w-4 h-4 mr-2" />Create Flashcards
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Main area */}
        <main className="col-span-1 lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{section === "quizzes" ? "Quizzes" : "Flashcards"}</h1>
              <p className="text-muted-foreground">{section === "quizzes" ? "Take a quiz to test your knowledge" : "Review flashcards and test yourself"}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="flex items-center gap-2">
                <Play className="w-3 h-3" />Practice
              </Badge>
            </div>
          </div>

          {/* List */}
          <div className="space-y-4">
            {section === "quizzes" &&
              quizzes.map((q) => (
                <Card key={q.id} className="flex items-center justify-between bg-card/30">
                  <div className="p-4">
                    <h3 className="text-lg font-medium">{q.title}</h3>
                    <p className="text-sm text-muted-foreground">{q.description}</p>
                    <div className="mt-2 text-xs text-muted-foreground">{q.questions} questions • {new Date(q.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="p-4 flex items-center gap-2">
                    <Link href={`/dashboard/quizzes/${q.id}`}>
                      <Button variant="outline"><Play className="w-4 h-4 mr-2" />Start Test</Button>
                    </Link>
                  </div>
                </Card>
              ))}

            {section === "flashcards" &&
              flashcards.map((f) => (
                <Card key={f.id} className="flex items-center justify-between bg-card/30">
                  <div className="p-4">
                    <h3 className="text-lg font-medium">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.category} • {f.cards} cards</p>
                    <div className="mt-2 text-xs text-muted-foreground">Created {new Date(f.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="p-4 flex items-center gap-2">
                    <Link href={`/dashboard/flashcards/study/${f.id}`}>
                      <Button variant="outline"><Play className="w-4 h-4 mr-2" />Study</Button>
                    </Link>
                  </div>
                </Card>
              ))}

            {/* Empty state */}
            {(section === "quizzes" && quizzes.length === 0) && (
              <Card>
                <CardContent className="text-center text-muted-foreground">No quizzes found. Create a new quiz to get started.</CardContent>
              </Card>
            )}

            {(section === "flashcards" && flashcards.length === 0) && (
              <Card>
                <CardContent className="text-center text-muted-foreground">No flashcards found. Create a new set to get started.</CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
