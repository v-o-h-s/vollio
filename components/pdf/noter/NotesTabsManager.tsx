// TODO you must handle when user click on some note from the home , and another tab does already exist
// TODO you must handle when user click on some tab from the tabs

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
  isHome?: boolean; // Special flag for the home tab
};

interface NotesTabsManagerProps {
  tabs: Tab[];
  activeTabId: string;
  onReorder: (tabs: Tab[]) => void;
  onAddNote: () => void;
  onDeleteNote: (id: string) => void;
  onTabClick: (tabId: string) => void;
}

export default function NotesTabsManager({
  tabs,
  activeTabId,
  onReorder,
  onAddNote,
  onDeleteNote,
  onTabClick,
}: NotesTabsManagerProps) {
  // Only sortable tabs (exclude home tab)
  const sortableTabs = useMemo(() => tabs.filter((tab) => !tab.isHome), [tabs]);
  const sortableIds = useMemo(
    () => sortableTabs.map((tab) => tab.id),
    [sortableTabs]
  );
  const { isOver, setNodeRef } = useDroppable({ id: "droppable" });
  const style = isOver ? { backgroundColor: "var(--muted)" } : undefined;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = sortableTabs.findIndex((tab) => tab.id === active.id);
    const newIndex = sortableTabs.findIndex((tab) => tab.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // Reorder only sortable tabs, then merge back with home tab
    const reorderedSortable = arrayMove<Tab>(sortableTabs, oldIndex, newIndex);
    const homeTab = tabs.find((tab) => tab.isHome);
    const newTabs = homeTab
      ? [homeTab, ...reorderedSortable]
      : reorderedSortable;
    onReorder(newTabs);
  };

  return (
    <DndContext
      modifiers={[restrictToHorizontalAxis]}
      onDragEnd={handleDragEnd}
    >
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
              <NoteTab
                id={tab.id}
                label={tab.label}
                key={tab.id}
                isActive={activeTabId === tab.id}
                isHome={tab.isHome}
                onDelete={onDeleteNote}
                onClick={onTabClick}
              />
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
