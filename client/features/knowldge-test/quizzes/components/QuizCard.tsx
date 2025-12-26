import {
  Card,
  CardContent,
  CardDescription,
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
import { BookOpen, Clock, Globe, MoreVertical, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CreateQuizResponse } from "@vollio/shared";

const getDifficultyColor = (diff: string | null) => {
  switch (diff?.toLowerCase()) {
    case "easy":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "medium":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "hard":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-700";
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
  const timeEstimate = q.settings.timeLimitMinutes || questionCount * 1.5; // Fallback estimate
  return (
    <Card
      key={q.id}
      className="flex flex-col border-border/50 hover:border-primary/50 shadow-xs hover:shadow-md transition-all duration-300 group overflow-hidden"
    >
      <div className="h-2 w-full bg-linear-to-r from-purple-500 to-indigo-500" />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <Badge
            variant="outline"
            className={`${getDifficultyColor(difficulty)} border-none mb-2`}
          >
            {difficulty}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete?.(q.id)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
          {q.title || "Untitled Quiz"}
        </CardTitle>
        <CardDescription className="line-clamp-2 text-xs mt-1 h-8">
          Generated on {new Date(q.createdAt).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="py-2 grow">
        <div className="flex flex-wrap gap-y-2 gap-x-4 text-xs text-muted-foreground mt-2">
          <div className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span className="truncate max-w-[100px]">
              {q.documentId.split("-")[0]}...
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Globe className="w-3.5 h-3.5" />
            <span>{q.language.toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>~{Math.round(timeEstimate)}m</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 pb-4">
        <div className="w-full flex items-center justify-between">
          <span className="text-sm font-medium">{questionCount} Questions</span>
          <Link href={`/dashboard/knowledge-test/quizzes/${q.id}`}>
            <Button
              size="sm"
              className="rounded-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              Start <Play className="w-3 h-3 ml-1 fill-current" />
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
