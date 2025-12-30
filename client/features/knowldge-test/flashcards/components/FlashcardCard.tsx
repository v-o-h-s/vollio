import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Button,
} from "@/components/ui";
import Link from "next/link";
import {
  LuGraduationCap as GraduationCap,
  LuLayers as Layers,
  LuTrash2 as Trash2,
} from "react-icons/lu";
import { FiMoreVertical as MoreVertical } from "react-icons/fi";
import { FlashCardsSetSummary } from "@vollio/shared";
import { format } from "date-fns";

interface FlashcardCardProps {
  set: FlashCardsSetSummary;
  onDelete: (id: string) => void;
}

export function FlashcardCard({ set, onDelete }: FlashcardCardProps) {
  return (
    <Card className="flex flex-col border-border/50 hover:border-pink-500/50 shadow-xs hover:shadow-md transition-all duration-300 group overflow-hidden bg-card">
      <div className="h-2 w-full bg-linear-to-r from-pink-500 to-rose-500" />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <Badge
            variant="outline"
            className="bg-pink-50 text-pink-700 dark:bg-pink-900/20 dark:text-pink-300 border-none mb-2"
          >
            {set.language.toUpperCase()}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive cursor-pointer focus:text-destructive"
                onClick={() => onDelete(set.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Deck
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardTitle className="text-lg leading-tight group-hover:text-pink-600 transition-colors line-clamp-1">
          {set.name}
        </CardTitle>
        <CardDescription className="line-clamp-1 text-xs mt-1">
          Created {format(new Date(set.createdAt), "MMM d, yyyy")}
        </CardDescription>
      </CardHeader>

      <CardContent className="py-2 grow">
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Layers className="w-4 h-4" />
          <span>{set.flashCards.length} Cards</span>
        </div>
      </CardContent>

      <CardFooter className="pt-2 pb-4">
        <Link
          href={`/dashboard/knowledge-test/flashcards/${set.id}`}
          className="w-full"
        >
          <Button
            size="sm"
            variant="outline"
            className="w-full rounded-full border-pink-200 hover:border-pink-300 hover:bg-pink-50 dark:border-pink-800 dark:hover:bg-pink-900/30 text-pink-600 dark:text-pink-400"
          >
            Study Now <GraduationCap className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
