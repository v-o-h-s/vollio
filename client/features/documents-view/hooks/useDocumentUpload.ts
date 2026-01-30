import { useRef, useState, ChangeEvent, DragEvent } from "react";
import { toast } from "react-toastify";

interface UseDocumentUploadProps {
  currentFolder: string | null;
  uploadDocument: (file: File, folderId: string | null) => Promise<any>;
  onUploadComplete: () => void;
}

export function useDocumentUpload({
  currentFolder,
  uploadDocument,
  onUploadComplete,
}: UseDocumentUploadProps) {
  const [isDraggingDocument, setIsDraggingDocument] = useState(false);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    documentInputRef.current?.click();
  };

  const handleDocumentInputChange = async (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const document of files) {
      try {
        await toast.promise(uploadDocument(document, currentFolder), {
          pending: `Uploading ${document.name}...`,
          success: `Successfully uploaded ${document.name}`,
          error: `Failed to upload ${document.name}`,
        });
      } catch (error) {
        console.error("Failed to upload document:", document.name, error);
      }
    }

    if (documentInputRef.current) {
      documentInputRef.current.value = "";
    }

    onUploadComplete();
  };

  const handleDocumentDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes("Files")) {
      setIsDraggingDocument(true);
    }
  };

  const handleDocumentDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (
      x <= rect.left ||
      x >= rect.right ||
      y <= rect.top ||
      y >= rect.bottom
    ) {
      setIsDraggingDocument(false);
    }
  };

  const handleDocumentDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDocumentDrop = async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingDocument(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    for (const document of files) {
      try {
        await toast.promise(uploadDocument(document, currentFolder), {
          pending: `Uploading ${document.name}...`,
          success: `Successfully uploaded ${document.name}`,
          error: `Failed to upload ${document.name}`,
        });
      } catch (error) {
        console.error("Failed to upload document:", document.name, error);
      }
    }

    onUploadComplete();
  };

  return {
    documentInputRef,
    isDraggingDocument,
    handleUploadClick,
    handleDocumentInputChange,
    handleDocumentDragEnter,
    handleDocumentDragLeave,
    handleDocumentDragOver,
    handleDocumentDrop,
  };
}
