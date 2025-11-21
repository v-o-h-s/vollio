export default function NoteTab({id}: {id: number}) {
  return (
    <div
      className="flex items-center min-w-[100px] h-8 bg-background flex flex-row justify-center text-sm border border-border  rounded-lg
                 hover:bg-primary/10 text-foreground hover:text-primary cursor-pointer transition-all duration-150
                 font-medium"
    >
      <span className="truncate">Note Tab {id}</span>
    </div>
  );
}
