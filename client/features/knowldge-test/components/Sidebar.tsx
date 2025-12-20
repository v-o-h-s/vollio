import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, Brain, Layers, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

import { CreateQuizResponse } from "@shared/types/responses/quizRoutes";
import { useMemo, useState } from "react";

interface SidebarProps {
  section: "quizzes" | "flashcards";
  setSection: (section: "quizzes" | "flashcards") => void;

  query: string;
  setQuery: (query: string) => void;
  selectedDocument: string;
  setSelectedDocument: (document: string) => void;
  selectedDifficulty: string;
  setSelectedDifficulty: (difficulty: string) => void;
  selectedLanguage: string;
  setSelectedLanguage: (language: string) => void;

  flashcards: any[];
  documentsMap: Map<string, string>;
  quizzesData: CreateQuizResponse[];
}

export function Sidebar({
  section,
  setSection,

  query,
  setQuery,
  selectedDocument,
  setSelectedDocument,
  selectedDifficulty,
  setSelectedDifficulty,
  selectedLanguage,
  setSelectedLanguage,
  documentsMap,
  flashcards,
  quizzesData,
}: SidebarProps) {
  /**
   *  we filter like the document that have quizzes so we pass them later
   * to the sidebar for filtering
   */
  const availableDocuments = useMemo(() => {
    const docs = new Set<string>();
    quizzesData?.forEach((q) => {
      const filename = documentsMap.get(q.fileId);
      if (filename) docs.add(filename);
    });
    flashcards.forEach((f) => f.documentName && docs.add(f.documentName));
    return Array.from(docs);
  }, [quizzesData, documentsMap, flashcards]);

  const filteredQuizzes = useMemo(
    () =>
      (quizzesData || []).filter((q) => {
        const matchesQuery = (q.title || "")
          .toLowerCase()
          .includes(query.toLowerCase());

        const filename = documentsMap.get(q.fileId);
        const matchesDocument =
          selectedDocument === "all" || filename === selectedDocument;

        const matchesDifficulty =
          selectedDifficulty === "all" ||
          q.settings.difficultyLevel?.toLowerCase() ===
            selectedDifficulty.toLowerCase();

        const matchesLanguage =
          selectedLanguage === "all" || q.language === selectedLanguage;

        return (
          matchesQuery &&
          matchesDocument &&
          matchesDifficulty &&
          matchesLanguage
        );
      }),
    [
      quizzesData,
      query,
      selectedDocument,
      selectedDifficulty,
      selectedLanguage,
      documentsMap,
    ]
  );

  const filteredFlashcards = useMemo(
    () =>
      flashcards.filter((f) => {
        const matchesQuery = (f.title || "")
          .toLowerCase()
          .includes(query.toLowerCase());

        const matchesDocument =
          selectedDocument === "all" || f.documentName === selectedDocument;

        // Reusing category as language/category filter
        const matchesLanguage =
          selectedLanguage === "all" || f.category === selectedLanguage;

        return matchesQuery && matchesDocument && matchesLanguage;
      }),
    [flashcards, query, selectedDocument, selectedLanguage]
  );

  return (
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
              className={`justify-start ${
                section === "quizzes"
                  ? "bg-background shadow-xs ring-1 ring-indigo-500/10"
                  : ""
              }`}
            >
              <Brain
                className={`w-4 h-4 mr-2 ${
                  section === "quizzes"
                    ? "text-indigo-500"
                    : "text-muted-foreground"
                }`}
              />
              Quizzes
              <Badge
                variant="secondary"
                className="ml-auto text-[10px] h-5 min-w-5 flex items-center justify-center"
              >
                {filteredQuizzes.length}
              </Badge>
            </Button>
            <Button
              variant={section === "flashcards" ? "secondary" : "ghost"}
              onClick={() => setSection("flashcards")}
              className={`justify-start ${
                section === "flashcards"
                  ? "bg-background shadow-xs ring-1 ring-rose-500/10"
                  : ""
              }`}
            >
              <Layers
                className={`w-4 h-4 mr-2 ${
                  section === "flashcards"
                    ? "text-rose-500"
                    : "text-muted-foreground"
                }`}
              />
              Flashcards
              <Badge
                variant="secondary"
                className="ml-auto text-[10px] h-5 min-w-5 flex items-center justify-center"
              >
                {filteredFlashcards.length}
              </Badge>
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
              <label className="text-xs font-medium text-muted-foreground">
                Source Document
              </label>
              <select
                value={selectedDocument}
                onChange={(e) => setSelectedDocument(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border/50 rounded-md bg-background/50 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Documents</option>
                {availableDocuments.map((doc) => (
                  <option key={doc} value={doc}>
                    {doc}
                  </option>
                ))}
              </select>
            </div>

            {section === "quizzes" && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Difficulty
                  </label>
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
                  <label className="text-xs font-medium text-muted-foreground">
                    Language
                  </label>
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
  );
}
