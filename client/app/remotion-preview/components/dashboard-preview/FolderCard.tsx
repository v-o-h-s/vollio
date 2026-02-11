"use client";

import { MoreVertical, Edit, Trash2, MoveRight } from "lucide-react";
import { IoFolder, IoFolderOpen } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface FolderCardProps {
  id: string;
  name: string;
  parentId?: string | null;
  isSelected: boolean;
  isDraggedOver?: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onOpen: () => void;
  allFolders: { id: string; name: string; parent_id?: string | null }[];
}

export function FolderCard({
  id,
  name,
  parentId,
  isSelected,
  isDraggedOver,
  onSelect,
  onOpen,
}: FolderCardProps) {
  return (
    <div
      className={cn(
        `relative group flex flex-col justify-center h-[140px] w-[140px] cursor-pointer transition-all hover:shadow-md hover:bg-neutral-100 rounded-2xl ${
          isSelected
            ? "bg-neutral-100 border-neutral-500 ring-1 ring-neutral-500"
            : ""
        }`,
        isDraggedOver ? "bg-neutral-100 border-neutral-500" : "",
      )}
      onClick={onSelect}
      onDoubleClick={onOpen}
    >
      <div className="flex flex-col items-center gap-4">
        <IoFolder className="h-12 w-12 text-neutral-700 group-hover:hidden transition-colors" />
        <IoFolderOpen className="h-12 w-12 text-black hidden group-hover:block transition-colors" />
        <p
          className="text-sm text-center font-bold px-2 line-clamp-2 break-words w-full text-neutral-900"
          title={name}
        >
          {name}
        </p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-neutral-500 hover:text-neutral-900"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="bg-white border-neutral-200"
        >
          <DropdownMenuItem className="focus:bg-neutral-100">
            <Edit className="h-4 w-4 mr-2" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem className="focus:bg-neutral-100">
            <MoveRight className="h-4 w-4 mr-2" />
            Move
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive focus:bg-red-50">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
