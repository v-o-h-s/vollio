import {
  useCreateNoteMutation,
  useUpdateNoteMutation,
} from "@/lib/store/apiSlice";
import { useGetNoteQuery } from "@/lib/store/apiSlice";
import { useViewer } from "../context/ViewerContext";
import { useParams } from "next/navigation";
import { useState } from "react";
import { JSONContent } from "@tiptap/core";
import { extractText } from "../utils";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
export const useAssistantActions = ({
  content,
}: {
  content: string | JSONContent;
}) => {
  const [copied, setCopied] = useState(false);
  const { activeTabId, isNoterOpen, setIsNoterOpen, setActiveTabId } =
    useViewer();
  const params = useParams();
  const documentId = params?.id as string;
  const [createNote] = useCreateNoteMutation();
  const [updateNote] = useUpdateNoteMutation();
  const { data: currentNote } = useGetNoteQuery(activeTabId, {
    skip: activeTabId === "home",
  });

  // function to handle copying assistant response
  const handleCopy = async () => {
    let textToCopy = "";
    if (typeof content === "string") {
      textToCopy = content;
    } else {
      textToCopy = extractText(content).trim();
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // function to handle adding assistant response to notes
  const handleAddToNotes = async () => {
    if (typeof content === "string") {
      // it should be JSONCONTENT
      return;
    }

    if (!isNoterOpen) {
      setIsNoterOpen(true);
    }

    try {
      if (activeTabId !== "home") {
        // Append to existing note
        if (!currentNote) return;

        const newContent = {
          type: "doc",
          content: [
            ...(currentNote.content?.content || []),
            ...(content.content || []), // Spread the assistant response's child nodes
          ],
        };
        
        await updateNote({
          id: activeTabId,
          updates: {
            content: newContent,
          },
        }).unwrap();
        toast.success("Added to existing note");
      } else {
        // Create new note
        const noteId = uuidv4();
        await createNote({
          id: noteId,
          documentId: documentId,
          content: content,
          color: "#ffffff",
          is_auto_generated: false,
        }).unwrap();
        toast.success("Created new note with content");
        setActiveTabId(noteId);
      }
    } catch (error) {
      console.error("Failed to add to notes:", error);
      toast.error("Failed to add to notes");
    }
  };
  return {
    handleCopy,
    handleAddToNotes,
    copied,
  };
};
