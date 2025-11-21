import { Plus, PlusCircle } from "lucide-react";

export function NoteAddButton() {
  return (
    <div
      className=" items-center bg-background   text-sm  my-3 rounded-lg p-1 
                 hover:bg-primary/10 text-foreground hover:text-primary cursor-pointer transition-all duration-150
                 font-medium"
    >
      <Plus className="w-5 h-5 text-sm" />
    </div>
  );
}
