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
import { GraduationCap, Layers, Link, MoreVertical } from "lucide-react";
export function FlashcardCard({ f }: { f: any }) {
    const getDifficultyColor = (diff: string) => {
        switch (diff) {
          case "Easy":
            return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
          case "Medium":
            return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
          case "Hard":
            return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
          default:
            return "bg-gray-100 text-gray-700";
        }
      };
  return (
    <Card
      key={f.id}
      className="flex flex-col border-border/50 hover:border-pink-500/50 shadow-xs hover:shadow-md transition-all duration-300 group overflow-hidden"
    >
      <div className="h-2 w-full bg-linear-to-r from-pink-500 to-rose-500" />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <Badge
            variant="outline"
            className="bg-pink-50 text-pink-700 dark:bg-pink-900/20 dark:text-pink-300 border-none mb-2"
          >
            {f.category || "General"}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardTitle className="text-lg leading-tight group-hover:text-pink-600 transition-colors">
          {f.title}
        </CardTitle>
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
            <Button
              size="sm"
              variant="outline"
              className="rounded-full border-pink-200 hover:border-pink-300 hover:bg-pink-50 dark:border-pink-800 dark:hover:bg-pink-900/30 text-pink-600 dark:text-pink-400"
            >
              Study <GraduationCap className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
