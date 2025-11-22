import { DndContext, type DragEndEvent, useDroppable } from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useMemo, useState } from "react";
import { NoteAddButton } from "./NoteAddButton";
import NoteTab from "./NoteTab";

export type Tab = {
  id: string;
  label: string;
};

interface NotesTabsManagerProps {
  tabs: Tab[];
  onReorder: (tabs: Tab[]) => void;
  onAddNote: () => void;
  onDeleteNote: (id: string) => void;
}


export default function NotesTabsManager({
  tabs,
  onReorder,
  onAddNote,
  onDeleteNote,
}: NotesTabsManagerProps) {



  const sortableIds = useMemo(
    () => tabs.map((tab) => tab.id),
    [tabs],
  );
  const { isOver, setNodeRef } = useDroppable({ id: "droppable" });
  const style = isOver ? { backgroundColor: "var(--muted)" } : undefined;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = tabs.findIndex((tab) => tab.id === active.id);
    const newIndex = tabs.findIndex((tab) => tab.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    onReorder(arrayMove<Tab>(tabs, oldIndex, newIndex));
  };

  return (
    <DndContext modifiers={[restrictToHorizontalAxis]} onDragEnd={handleDragEnd}>
      <div
        className="flex flex-col justify-center  absolute top-0 w-full   px-2"
        ref={setNodeRef}
        style={style}
      >
        <SortableContext
          items={sortableIds}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex flex-row  items-center gap-2 justify-start ">
            {tabs.map((tab) => (
              <NoteTab id={tab.id} label={tab.label} key={tab.id} onDelete={onDeleteNote} />
            ))}

            <NoteAddButton onClick={onAddNote} />
          </div>
        </SortableContext>
        {/* Divider: change color and height for better visibility */}
        <div className="w-full h-px bg-border  rounded" />
      </div>
    </DndContext>
  );
}
