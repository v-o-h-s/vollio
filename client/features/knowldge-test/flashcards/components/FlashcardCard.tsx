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
  Layers,
  MoreVertical,
  GraduationCap,
  Calendar,
  Trash2,
  Globe,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FlashCardsSetSummary } from "@vollio/shared";
import { cn } from "@/lib/utils";

export function FlashcardCard({
  set,
  onDelete,
}: {
  set: FlashCardsSetSummary;
  onDelete: (id: string) => void;
}) {
  const cardCount = set.flashCards?.length || 0;

  return (
    <Card
      key={set.id}
      className="group relative flex flex-col h-full border-border/60 hover:border-pink-500/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden bg-card/10 backdrop-blur-xs"
    >
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 translate-y-1 group-hover:translate-y-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(set.id);
          }}
          className="h-9 w-9 rounded-full bg-background/80 hover:bg-destructive hover:text-white shadow-xl backdrop-blur-md transition-all border border-border/20"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <CardHeader className="pb-3 pt-5 px-5 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <Badge
            variant="outline"
            className={cn(
              "px-2.5 py-0.5 text-xs font-bold tracking-wide border-pink-500/20 bg-pink-500/10 text-pink-700 dark:text-pink-400"
            )}
          >
            FLASHCARDS
          </Badge>
        </div>

        <CardTitle className="text-lg font-bold leading-snug line-clamp-2 group-hover:text-pink-600 transition-colors">
          {set.name || "Untitled Deck"}
        </CardTitle>

        <div className="flex items-center text-xs text-muted-foreground gap-2">
          <Calendar className="w-3.5 h-3.5" />
          <span>{new Date(set.createdAt).toLocaleDateString()}</span>
        </div>
      </CardHeader>

      <CardContent className="px-5 py-2 grow">
        <div className="grid grid-cols-2 gap-3 mt-1">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/40 text-xs font-medium text-muted-foreground">
            <BookOpen className="w-4 h-4 " />
            <span className="truncate" title={set.documentId}>
              {set.documentId.split("-")[0]}...
            </span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/40 text-xs font-medium text-muted-foreground">
            <Globe className="w-4 h-4 " />
            <span>{set.language.toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/40 text-xs font-medium text-muted-foreground">
            <Layers className="w-4 h-4 " />
            <span>{cardCount} Cards</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-5 py-4 pt-2">
        <div className="w-full flex items-center justify-between gap-4">
          <div className="text-sm font-semibold text-muted-foreground">
            <span className="text-foreground">{cardCount}</span> Flashcards
          </div>
          <Link
            href={`/dashboard/knowledge-test/flashcards/${set.id}`}
            className="block"
          >
            <Button
              size="sm"
              className="rounded-full pl-4 pr-5 bg-pink-600/90 hover:bg-pink-600 text-white shadow-md hover:shadow-pink-500/20 transition-all duration-300"
            >
              <GraduationCap className="w-3.5 h-3.5 mr-2" /> Practice Now
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
