import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  Clock,
  Globe,
  MoreVertical,
  Play,
  Calendar,
  Trash2,
  Edit2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CreateQuizResponse } from "@vollio/shared";
import { cn } from "@/lib/utils";

const getDifficultyColor = (diff: string | null) => {
  switch (diff?.toLowerCase()) {
    case "easy":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
    case "medium":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
    case "hard":
      return "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20";
    default:
      return "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20";
  }
};

export function QuizCard({
  q,
  onDelete,
}: {
  q: CreateQuizResponse;
  onDelete?: (id: string) => void;
}) {
  const difficulty = q.settings.difficultyLevel || "Medium";
  const questionCount = q.settings.numberOfQuestions || q.questions.length || 0;
  const timeEstimate = q.settings.timeLimitMinutes || questionCount * 1.5;

  return (
    <Card
      key={q.id}
      className="group relative flex flex-col h-full border-border/60 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden bg-card/50 backdrop-blur-xs"
    >
      <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-background/80"
            >
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="cursor-pointer">
              <Edit2 className="w-4 h-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive cursor-pointer focus:text-destructive"
              onClick={() => onDelete?.(q.id)}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CardHeader className="pb-3 pt-5 px-5 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <Badge
            variant="outline"
            className={cn(
              "px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide border",
              getDifficultyColor(difficulty)
            )}
          >
            {difficulty}
          </Badge>
        </div>
        
        <CardTitle className="text-lg font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {q.title || "Untitled Quiz"}
        </CardTitle>
        
        <div className="flex items-center text-xs text-muted-foreground gap-2">
          <Calendar className="w-3.5 h-3.5" />
          <span>{new Date(q.createdAt).toLocaleDateString()}</span>
        </div>
      </CardHeader>

      <CardContent className="px-5 py-2 grow">
        <div className="grid grid-cols-2 gap-3 mt-1">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/40 text-xs font-medium text-muted-foreground">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            <span className="truncate" title={q.documentId}>
              {q.documentId.split("-")[0]}...
            </span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/40 text-xs font-medium text-muted-foreground">
            <Globe className="w-4 h-4 text-blue-500" />
            <span>{q.language.toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/40 text-xs font-medium text-muted-foreground">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>~{Math.round(timeEstimate)}m</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-5 py-4 pt-2">
        <div className="w-full flex items-center justify-between gap-4">
          <div className="text-sm font-semibold text-muted-foreground">
            <span className="text-foreground">{questionCount}</span> Questions
          </div>
          <Link href={`/dashboard/knowledge-test/quizzes/${q.id}`} className="block">
            <Button
              size="sm"
              className="rounded-full pl-4 pr-5 bg-primary/90 hover:bg-primary shadow-md hover:shadow-primary/20 transition-all duration-300"
            >
              <Play className="w-3.5 h-3.5 mr-2 fill-current" /> Start Quiz
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
