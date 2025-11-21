import { NoteAddButton } from "./NoteAddButton";
import NoteTab from "./NoteTab";

export default function NotesTabsManager() {
  return (
    <div className="flex flex-col justify-center  absolute top-0 w-full   px-2">
      <div className="flex flex-row items-center gap-2 justify-start ">
        <NoteTab id={1} />
        <NoteTab id={2} />
        <NoteTab id={3} />
        <NoteAddButton />
      </div>  
      {/* Divider: change color and height for better visibility */}
      <div className="w-full h-px bg-border  rounded" />
    </div>
  );
}
