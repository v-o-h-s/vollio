import { Badge } from "@/components/ui/badge";
import { LuBrain as Brain, LuLayers as Layers } from "react-icons/lu";
import { cn } from "@/lib/utils";

interface SidebarProps {
  section: "quizzes" | "flashcards";
  setSection: (section: "quizzes" | "flashcards") => void;
  flashcards: any[];
  quizzesData: any[];
}

export function Sidebar({
  section,
  setSection,
  flashcards,
  quizzesData,
}: SidebarProps) {
  return (
    <div className="w-full border-b border-border/60">
      <div className="flex items-center gap-8 px-2">
        <button
          onClick={() => setSection("quizzes")}
          className={cn(
            "flex items-center gap-2 py-4 px-1 transition-all duration-300 font-semibold text-sm relative",
            section === "quizzes"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Brain
            className={cn(
              "w-4 h-4",
              section === "quizzes"
                ? "text-indigo-500"
                : "text-muted-foreground"
            )}
          />
          Quizzes
          <Badge
            variant="secondary"
            className="ml-1 text-[10px] h-5 min-w-5 flex items-center justify-center bg-muted/60"
          >
            {quizzesData?.length || 0}
          </Badge>
          {section === "quizzes" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setSection("flashcards")}
          className={cn(
            "flex items-center gap-2 py-4 px-1 transition-all duration-300 font-semibold text-sm relative",
            section === "flashcards"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Layers
            className={cn(
              "w-4 h-4",
              section === "flashcards"
                ? "text-rose-500"
                : "text-muted-foreground"
            )}
          />
          Flashcards
          <Badge
            variant="secondary"
            className="ml-1 text-[10px] h-5 min-w-5 flex items-center justify-center bg-muted/60"
          >
            {flashcards?.length || 0}
          </Badge>
          {section === "flashcards" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-full" />
          )}
        </button>
      </div>
    </div>
  );
}
