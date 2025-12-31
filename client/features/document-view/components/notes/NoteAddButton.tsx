import { Plus, PlusCircle } from "lucide-react";

export function NoteAddButton({ onClick }: { onClick?: () => void }) {
  return (
    <div
      className=" items-center bg-background   text-sm  my-3 rounded-lg p-1 
                 hover:bg-indigo-500/10 text-foreground hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-all duration-150
                 font-medium"
      onClick={onClick}
    >
      <Plus className="w-5 h-5 text-sm" />
    </div>
  );
}
